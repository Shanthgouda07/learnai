# LearnAI - 3-Minute Live Demo Pitch Script

**Target Duration:** Exactly 180 seconds (3:00)  
**Presenter Roles:** 1 Presenter (switching between Teacher & Student views in split/tabbed browser)  
**Demo Mode:** Active (`VITE_USE_MOCK_AI=true` or live Gemini API key, pre-seeded state)

---

## Timeline & Narration

### [0:00 - 0:20] The Problem: One Teacher, Forty Trajectories
- **Screen:** Open on the Teacher AI Desk (`/desk`) with the class overview.
- **Narrator Action:** Point to the class roster and varied student mastery bars.
- **Script:**
  > *"Every computer science teacher faces the same dilemma: one teacher, forty students, and forty completely different learning gaps. When Casey struggles with for-loops, the problem isn't the loop syntax—it's that Casey never understood variable reassignment two weeks ago. Traditional tutoring tools either give students answers directly or overwhelm the teacher with raw logs. LearnAI bridges this gap: a calm, privacy-first teaching studio where AI supports human judgment, deterministically diagnoses prerequisites, and never teaches without teacher approval."*

---

### [0:20 - 0:50] Teacher Studio: AI Draft with Sources & Human Approval
- **Screen:** Navigate to `/notes/editor` (or Teacher Note Creator).
- **Narrator Action:**
  1. Click **"Draft with AI"**. Enter topic: `"Understanding For Loops in Python"`.
  2. Notice the yellow **"DRAFT (Pending Approval)"** badge and the **"Grounded in: NCERT / Python 3.12 Spec"** citation badge.
  3. Edit one line in the draft markdown.
  4. Click **"Approve & Publish to Class"**.
- **Script:**
  > *"First, content generation. The teacher retains 100% curriculum control. When I draft a lesson on 'For Loops', our backend runs strict RAG retrieval against verified reference material. Notice the citation chips showing exactly which textbook sections grounded this text. The note starts in a locked 'DRAFT' state—students cannot see it until I review it. With one click, I approve and assign it to the class."*

---

### [0:50 - 1:20] Student Journey: Recall Gate & Guarded AI Helper
- **Screen:** Switch to Student Alex (`S-001`) at `/notes/note-001`.
- **Narrator Action:**
  1. Show the **"Listen"** (Read Aloud) button and the accessible **"Simple Summary"** toggle.
  2. Click **"Check Understanding"** (Recall check). Answer the quick question. The game lock icon unlocks with an animation.
  3. Open the **AI Helper Drawer** (`Alt + H`).
  4. Prompt 1: *"Can you give me a hint on how the loop counter increments?"*  
     -> AI replies with a Socratic hint with citation, read aloud enabled.
  5. Prompt 2: *"Can you write my homework essay on French history?"*  
     -> Guard rails trigger: *"That's outside our current lesson notes. Please ask your teacher for help with this topic!"*
- **Script:**
  > *"Now let's step into the student's notebook. Before students can access interactive challenges, they complete a quick active-recall gate. The lock clicks open. If Alex gets stuck, our Socratic AI Helper is grounded exclusively in the teacher's approved lesson. When Alex asks for a hint, the helper guides them without giving away code answers. And if Alex asks something off-topic or attempts prompt injection, the deterministic guardrails intercept it: 'That's outside our lesson notes—ask your teacher.'"*

---

### [1:20 - 1:55] Visualizer Game: Deterministic Sandbox & Fair Mastery
- **Screen:** Open Challenge / Visualizer (`/visualizer` or game challenge).
- **Narrator Action:**
  1. Press **"Step"** to step through execution.
  2. Show line-by-line highlight, variables updating in the state panel, and the call stack.
  3. Submit answer.
  4. Show the score modal: **Points breakdown based on comprehension and persistence, zero speed bonus**.
- **Script:**
  > *"When students practice, they don't just see green checkmarks—they see how execution works. In our visualizer, code animates step-by-step: variables mutate, the call stack grows, and students build mental models. When Alex submits, our points system rewards mastery and deep reflection—with zero speed bonuses, ensuring neurodivergent students and careful thinkers aren't penalized."*

---

### [1:55 - 2:40] Teacher AI Desk: Deterministic Root-Cause & Actionable Support
- **Screen:** Return to Teacher AI Desk (`/desk`), click **Mastery Heatmap**, then click student **Casey (`S-004`)**.
- **Narrator Action:**
  1. Show Casey flagged with red warning chip: *"Needs Attention: Loops (Prerequisite Gap: Variables)"*.
  2. Click **"Why am I seeing this?"** -> Opens deterministic evidence modal showing failing variable reassignments from 3 days ago.
  3. Toggle **"View as Table"** (demonstrating WCAG compliance).
  4. Click **"Generate Support Task"** for the group (S-004, S-007, S-011).
  5. Review AI-drafted micro-remediation note, edit the title, click **"Assign Group Task"**.
- **Script:**
  > *"Back at the Teacher Desk, deterministic analytics run entirely in code—not hallucinated by an LLM. Our directed acyclic graph traces Casey's loop failure back to an unresolved prerequisite in Variables. Clicking 'Why am I seeing this?' shows the exact audit evidence. With one click, the teacher drafts a targeted micro-review for the three students with this gap. The teacher reviews, edits, and assigns it in seconds. AI does the drafting; the teacher directs the learning."*

---

### [2:40 - 3:00] Privacy & Ethics by Design Close
- **Screen:** Click Footer -> **"Privacy & Ethics Center"** (`/privacy`).
- **Narrator Action:**
  1. Show **Live AI Transparency Card** (zero names sent, count of PII redactions).
  2. Show **Audit Log** containing only hashed `anon_id`s, no student names.
  3. Show **"Download My Data"** (JSON) and **"Request Data Deletion"** (subject to teacher/school approval).
- **Script:**
  > *"Finally, privacy is engineered into the foundation, not hidden in a disclaimer. Every student prompt is scrubbed of PII before leaving the browser. Our AI audit logs record zero student names—only anonymous hashes. Students can inspect every byte stored about them, download it, or request hard deletion. LearnAI brings AI into schools the right way: private, grounded, accessible, and firmly under teacher leadership. Thank you!"*

---

## Backup Plan: Offline & Technical Contingencies

| Failure Scenario | Immediate Remedy | Talking Point |
|---|---|---|
| **No Internet / Wi-Fi Drops** | System auto-detects offline state and runs on `VITE_USE_MOCK_AI=true`. Full local mock responses for helper, note generation, and support tasks. | *"LearnAI runs 100% offline with zero cloud dependency—making it ideal for low-bandwidth rural classrooms."* |
| **LLM Rate Limit / API Error** | Backend falls back seamlessly to offline heuristic mock responses in `backend/app/services/ai.py`. | *"Our architecture includes deterministic fallback layers, so the classroom experience never stops even if cloud providers have an outage."* |
| **Accidental Database Corrupt / Test Overwrite** | Click **"Reset Demo Data"** in the top demo banner (calls `/api/demo/reset`). Restores seed state in 0.4s. | *"A single click resets the class state back to standard demonstration conditions."* |
| **Display / Projector Contrast Issues** | Press `Alt + A` -> Toggle **High-Contrast Mode** or **Warm Dark Mode** in under 2 seconds. | *"Accessible to every projector and lighting environment."* |

---

## 5 Likely Judge Questions & Crisp Answers

### Q1: "How do you prevent the AI helper from hallucinating or teaching wrong concepts?"
> **Answer:** *"Strict three-tier containment: First, vector RAG retrieval restricts the model context exclusively to the teacher's approved lesson chunks. Second, temperature is clamped to 0.2 with an explicit system prompt forbidding external facts. Third, post-generation guardrail filters inspect the output for ungrounded claims or direct homework solution leaks before the student ever sees it."*

### Q2: "Can students cheat by asking the helper to write their code?"
> **Answer:** *"No. The helper system prompt strictly enforces Socratic tutoring: it is instructed to ask clarifying questions, identify syntax misconceptions, and provide pseudo-examples, but never generate the target challenge code. Furthermore, students cannot proceed to challenges without passing active recall checks."*

### Q3: "How do you protect student privacy under COPPA / FERPA / DPDP regulations?"
> **Answer:** *"By design: (1) Client-side regex & token scrubbers strip names, emails, and phone numbers before AI calls. (2) Server-side `ai_logs` and `access_log` store only anonymous GUIDs (`anon_id`), never user identities. (3) Data deletion hard-purges all personal identifiers while aggregating session metrics to preserve school reporting. (4) Consent is enforced server-side—students cannot query protected APIs without signed consent."*

### Q4: "How does this scale to schools with low-end hardware or poor internet?"
> **Answer:** *"The entire frontend is lightweight React without bloated dependencies, loading in under 1 second. The design supports offline mock mode and edge caching. The code execution sandbox runs securely with strict resource limits, and read-aloud uses the browser's native Web Speech API without consuming bandwidth or sending voice audio to third parties."*

### Q5: "Doesn't this increase the teacher's workload instead of reducing it?"
> **Answer:** *"The opposite: teachers spend hours manually grading practice tests to guess why students are struggling. LearnAI's deterministic prerequisite engine diagnoses the root cause automatically, and the AI drafts targeted intervention tasks. The teacher spends 15 seconds reviewing and approving instead of 45 minutes diagnosing and drafting from scratch."*
