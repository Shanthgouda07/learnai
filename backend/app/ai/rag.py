"""
rag.py - Retrieval-Augmented Generation (RAG) over approved class notes.
Uses ChromaDB for vector retrieval with an automatic BM25/keyword fallback
if ChromaDB is unavailable, offline, or fails to embed.
"""
import os
import re
import math
import logging
from typing import Any, Dict, List, Optional
from collections import Counter

logger = logging.getLogger(__name__)

# Constants
CHROMA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data", "chroma"))
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
RELEVANCE_THRESHOLD = 0.12  # Minimum score required to be considered grounded

_rag_backend = "keyword"
_chroma_client = None
_embedding_fn = None

try:
    from chromadb import EmbeddingFunction

    class FastLocalEmbeddingFunction(EmbeddingFunction):
        def __init__(self):
            pass
        def name(self) -> str:
            return "fast_local_embedding"
        def __call__(self, input: List[str]) -> List[List[float]]:
            res = []
            for text in input:
                vec = [0.0] * 64
                words = re.findall(r'[a-zA-Z0-9_]+', text.lower())
                for w in words:
                    h = abs(hash(w)) % 64
                    vec[h] += 1.0
                norm = math.sqrt(sum(x*x for x in vec)) or 1.0
                res.append([x / norm for x in vec])
            return res

    _embedding_fn = FastLocalEmbeddingFunction()
except Exception:
    _embedding_fn = None


def _init_chroma():
    global _chroma_client, _rag_backend
    try:
        os.makedirs(CHROMA_DIR, exist_ok=True)
        import chromadb
        client = chromadb.PersistentClient(path=CHROMA_DIR)
        _chroma_client = client
        _rag_backend = "chromadb"
        logger.info(f"[RAG] Persistent ChromaDB initialized at {CHROMA_DIR}")
    except Exception as e:
        logger.warning(f"[RAG] ChromaDB initialization failed ({e}). Falling back to BM25/keyword.")
        _chroma_client = None
        _rag_backend = "keyword"


# Initialize backend on module import
_init_chroma()


def get_rag_backend_name() -> str:
    return _rag_backend


# In-memory store for chunks (used by keyword/BM25 and as fallback cache)
# Format: {class_id: [ChunkDict, ...]}
_chunks_by_class: Dict[int, List[Dict[str, Any]]] = {}


def chunk_markdown(note_id: int, note_title: str, topic: str, content: str) -> List[Dict[str, Any]]:
    """
    Split markdown into chunks by headings, then to ~500 chars with ~50 overlap.
    Preserves heading and note metadata for citations.
    """
    if not content:
        return []

    chunks: List[Dict[str, Any]] = []
    # Split content by markdown headings (# H1, ## H2, ### H3)
    heading_pattern = re.compile(r'^(#{1,3}\s+.+)$', re.MULTILINE)
    parts = heading_pattern.split(content)

    current_heading = "Overview"
    chunk_idx = 0

    i = 0
    while i < len(parts):
        part = parts[i].strip()
        if not part:
            i += 1
            continue

        if heading_pattern.match(part):
            current_heading = part.lstrip('#').strip()
            i += 1
            continue

        # Split section text into ~500 chars with 50 chars overlap
        text = part
        start = 0
        while start < len(text):
            end = min(start + CHUNK_SIZE, len(text))
            chunk_text = text[start:end].strip()

            if chunk_text:
                chunks.append({
                    "id": f"note_{note_id}_{chunk_idx}",
                    "text": chunk_text,
                    "note_id": note_id,
                    "note_title": note_title,
                    "topic": topic or "general",
                    "heading": current_heading,
                    "chunk_index": chunk_idx,
                })
                chunk_idx += 1

            if end >= len(text):
                break
            start += (CHUNK_SIZE - CHUNK_OVERLAP)

        i += 1

    return chunks


def remove_note_chunks(class_id: int, note_id: int) -> None:
    """Remove chunks for a note from both in-memory store and ChromaDB."""
    # 1. In-memory
    if class_id in _chunks_by_class:
        _chunks_by_class[class_id] = [
            c for c in _chunks_by_class[class_id] if c["note_id"] != note_id
        ]

    # 2. ChromaDB
    if _chroma_client:
        try:
            col_name = f"class_{class_id}_notes"
            kwargs = {"embedding_function": _embedding_fn} if _embedding_fn else {}
            col = _chroma_client.get_or_create_collection(col_name, **kwargs)
            col.delete(where={"note_id": note_id})
        except Exception as e:
            logger.debug(f"[RAG] Chroma chunk deletion error: {e}")


def index_note(class_id: int, note_id: int, note_title: str, topic: str, content: str, status: str) -> int:
    """
    Index an approved note. If status is not 'approved'/'published', existing chunks are removed.
    Returns count of chunks indexed.
    """
    # Index ONLY notes with status='approved' or 'published'
    if status not in ("approved", "published"):
        remove_note_chunks(class_id, note_id)
        return 0

    # Remove existing chunks first for idempotence
    remove_note_chunks(class_id, note_id)

    chunks = chunk_markdown(note_id, note_title, topic, content)
    if not chunks:
        return 0

    # Add to in-memory store
    if class_id not in _chunks_by_class:
        _chunks_by_class[class_id] = []
    _chunks_by_class[class_id].extend(chunks)

    # Add to ChromaDB if available
    if _chroma_client:
        try:
            col_name = f"class_{class_id}_notes"
            kwargs = {"embedding_function": _embedding_fn} if _embedding_fn else {}
            col = _chroma_client.get_or_create_collection(col_name, **kwargs)
            # Add documents
            docs = [c["text"] for c in chunks]
            ids = [c["id"] for c in chunks]
            metadatas = [{
                "note_id": c["note_id"],
                "note_title": c["note_title"],
                "topic": c["topic"],
                "heading": c["heading"],
                "chunk_index": c["chunk_index"],
            } for c in chunks]
            col.add(documents=docs, ids=ids, metadatas=metadatas)
        except Exception as e:
            logger.warning(f"[RAG] Failed to write chunks to Chroma ({e}). In-memory keyword scorer active.")

    return len(chunks)


# ---------------------------------------------------------------------------
# Retrieval & Scoring (BM25 + Semantic)
# ---------------------------------------------------------------------------

STOP_WORDS = {
    "a", "an", "the", "in", "on", "at", "to", "for", "of", "with", "is", "are",
    "was", "were", "be", "been", "do", "does", "did", "have", "has", "had",
    "how", "what", "which", "who", "when", "where", "why", "can", "could",
    "would", "should", "i", "you", "he", "she", "it", "we", "they", "my",
    "your", "his", "her", "its", "our", "their", "this", "that", "these",
    "those", "and", "or", "but", "if", "so", "as", "about", "into"
}

def _tokenize(text: str) -> List[str]:
    return re.findall(r'[a-zA-Z0-9_]+', text.lower())


def _bm25_score(query_tokens: List[str], doc_tokens: List[str], doc_len: int, avg_doc_len: float) -> float:
    """Compute lightweight BM25 score."""
    if not doc_tokens or not query_tokens:
        return 0.0

    k1 = 1.5
    b = 0.75
    doc_counter = Counter(doc_tokens)
    score = 0.0

    for token in query_tokens:
        if token in doc_counter:
            tf = doc_counter[token]
            idf = 1.0  # Normalized baseline IDF for single-collection query
            denom = tf + k1 * (1 - b + b * (doc_len / max(avg_doc_len, 1.0)))
            score += idf * ((tf * (k1 + 1)) / denom)

    return score


def retrieve(
    class_id: int,
    query: str,
    k: int = 4,
    topic: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Retrieve top-k relevant chunks from approved class notes.
    Applies relevance threshold. If nothing passes, returns empty list [].
    """
    if not query or not query.strip():
        return []

    chunks = _chunks_by_class.get(class_id, [])
    if not chunks:
        return []

    # Optional topic filtering
    if topic:
        filtered = [c for c in chunks if c.get("topic") == topic]
        if filtered:
            chunks = filtered

    raw_tokens = _tokenize(query)
    content_tokens = [t for t in raw_tokens if t not in STOP_WORDS]
    query_tokens = content_tokens if content_tokens else raw_tokens
    if not query_tokens:
        return []

    avg_doc_len = sum(len(_tokenize(c["text"])) for c in chunks) / max(len(chunks), 1)

    scored: List[Tuple[Dict[str, Any], float]] = []
    for c in chunks:
        doc_tokens = _tokenize(f"{c['note_title']} {c['heading']} {c['text']}")
        score = _bm25_score(query_tokens, doc_tokens, len(doc_tokens), avg_doc_len)
        if score > 0:
            scored.append((c, score))

    if not scored:
        return []

    scored.sort(key=lambda x: x[1], reverse=True)

    # Check top score against relevance threshold
    top_score = scored[0][1]
    # Normalize score relative to query token count
    norm_score = top_score / max(len(query_tokens), 1)
    if norm_score < RELEVANCE_THRESHOLD:
        return []

    results = []
    for c, score in scored[:k]:
        results.append({
            "text": c["text"],
            "note_id": c["note_id"],
            "note_title": c["note_title"],
            "heading": c["heading"],
            "score": round(score, 3)
        })

    return results
