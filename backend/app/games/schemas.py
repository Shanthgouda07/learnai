"""
Pydantic schemas for game templates and content_json payloads.
All games share: {topic, difficulty (1-3), points, hints[0..3], explanation}
"""
from typing import List, Union, Optional, Any, Dict
from pydantic import BaseModel, Field


class BaseGameContent(BaseModel):
    topic: str
    difficulty: int = Field(ge=1, le=3, default=1)
    points: int = 100
    hints: List[str] = Field(default_factory=list)
    explanation: str = ""


# 1. Fill in the Blank
class BlankItem(BaseModel):
    id: Union[str, int]
    options: List[str]
    answer: str


class FillBlankGameContent(BaseGameContent):
    prompt: str
    code_template: str
    blanks: List[BlankItem]


# 2. Bug Hunt
class BugHuntGameContent(BaseGameContent):
    prompt: str
    code: str
    bug_line: int
    bug_explanation: str
    fix_options: List[str]
    correct_fix_index: int


# 3. Order Steps
class OrderStepsGameContent(BaseGameContent):
    prompt: str
    steps: List[str]  # In correct order on server


# 4. Visualizer
class VisualizerTestCase(BaseModel):
    name: str
    stdin: List[str] = Field(default_factory=list)
    expected_stdout: str


class VisualizerGameContent(BaseGameContent):
    kind: str = "fix_bug"  # predict_output | fix_bug | make_it_print
    prompt: str
    starter_code: str
    expected_output: str = ""
    test_cases: List[VisualizerTestCase] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# API Request / Response Schemas
# ---------------------------------------------------------------------------
class StartSessionResponse(BaseModel):
    session_id: int
    game_id: int
    title: str
    game_type: str
    max_points: int
    content: Dict[str, Any]  # Client-safe (answers stripped, steps shuffled)


class AnswerRequest(BaseModel):
    session_id: int
    item_id: Union[str, int]
    response: Any


class AnswerResponse(BaseModel):
    correct: bool
    feedback: str
    explanation: Optional[str] = None


class FinishRequest(BaseModel):
    session_id: int
    duration_sec: Optional[int] = 0
    hints_used: Optional[int] = 0


class PointBreakdownItem(BaseModel):
    label: str
    points: int


class FinishResponse(BaseModel):
    session_id: int
    score: int
    accuracy: float
    duration_sec: int
    streak: int
    points_breakdown: List[PointBreakdownItem]
    review_topics: List[str]
    best_score: int
    trend: List[int]
    status: str = "completed"


class LeaderboardFreeStats(BaseModel):
    best: int
    average: float
    trend: List[int]
    attempts: int
    last_played: Optional[str] = None
