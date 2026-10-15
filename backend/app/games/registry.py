"""
Game Registry – maps game type -> validator, client sanitizer, and per-item grader.
"""
import json
import random
from typing import Dict, Any, Tuple
from app.games.schemas import (
    FillBlankGameContent,
    BugHuntGameContent,
    OrderStepsGameContent,
    VisualizerGameContent,
)


class BaseGameHandler:
    @staticmethod
    def validate(content_json: str) -> Any:
        raise NotImplementedError

    @staticmethod
    def sanitize_for_client(content: Any) -> Dict[str, Any]:
        """Never include answers or un-shuffled steps in client payload."""
        raise NotImplementedError

    @staticmethod
    def grade_item(content: Any, item_id: Any, response: Any) -> Dict[str, Any]:
        """Grade a single item response. Server holds the truth."""
        raise NotImplementedError

    @staticmethod
    def get_total_items(content: Any) -> int:
        raise NotImplementedError


# 1. Fill in the Blank Handler
class FillBlankHandler(BaseGameHandler):
    @staticmethod
    def validate(content_json: str) -> FillBlankGameContent:
        data = json.loads(content_json)
        return FillBlankGameContent(**data)

    @staticmethod
    def sanitize_for_client(content: FillBlankGameContent) -> Dict[str, Any]:
        return {
            "prompt": content.prompt,
            "code_template": content.code_template,
            "blanks": [
                {
                    "id": b.id,
                    "options": b.options,
                }
                for b in content.blanks
            ],
            "hints": content.hints,
            "topic": content.topic,
            "difficulty": content.difficulty,
            "points": content.points,
        }

    @staticmethod
    def grade_item(content: FillBlankGameContent, item_id: Any, response: Any) -> Dict[str, Any]:
        target_blank = next((b for b in content.blanks if str(b.id) == str(item_id)), None)
        if not target_blank:
            return {"correct": False, "feedback": f"Blank {item_id} not found."}

        resp_str = str(response).strip().lower()
        ans_str = str(target_blank.answer).strip().lower()
        is_correct = resp_str == ans_str

        return {
            "correct": is_correct,
            "feedback": "Correct!" if is_correct else "Not quite, try another option.",
            "explanation": content.explanation if is_correct else None,
        }

    @staticmethod
    def get_total_items(content: FillBlankGameContent) -> int:
        return len(content.blanks)


# 2. Bug Hunt Handler
class BugHuntHandler(BaseGameHandler):
    @staticmethod
    def validate(content_json: str) -> BugHuntGameContent:
        data = json.loads(content_json)
        return BugHuntGameContent(**data)

    @staticmethod
    def sanitize_for_client(content: BugHuntGameContent) -> Dict[str, Any]:
        return {
            "prompt": content.prompt,
            "code": content.code,
            "fix_options": content.fix_options,
            "hints": content.hints,
            "topic": content.topic,
            "difficulty": content.difficulty,
            "points": content.points,
        }

    @staticmethod
    def grade_item(content: BugHuntGameContent, item_id: Any, response: Any) -> Dict[str, Any]:
        item_type = str(item_id).lower()

        if item_type in ("line", "bug_line"):
            try:
                line_guess = int(response)
            except (ValueError, TypeError):
                return {"correct": False, "feedback": "Invalid line number."}

            is_correct = line_guess == content.bug_line
            return {
                "correct": is_correct,
                "feedback": "Buggy line found! Now select the fix." if is_correct else "That line is clean. Look closely at variables and loop conditions.",
            }

        elif item_type in ("fix", "fix_option"):
            try:
                fix_idx = int(response)
            except (ValueError, TypeError):
                return {"correct": False, "feedback": "Invalid fix option selection."}

            is_correct = fix_idx == content.correct_fix_index
            return {
                "correct": is_correct,
                "feedback": "Bug resolved successfully!" if is_correct else "That fix causes other issues. Try another option.",
                "explanation": content.bug_explanation if is_correct else None,
            }

        return {"correct": False, "feedback": f"Unknown item type: {item_id}"}

    @staticmethod
    def get_total_items(content: BugHuntGameContent) -> int:
        return 2  # Item 1: find line, Item 2: select fix


# 3. Order Steps Handler
class OrderStepsHandler(BaseGameHandler):
    @staticmethod
    def validate(content_json: str) -> OrderStepsGameContent:
        data = json.loads(content_json)
        return OrderStepsGameContent(**data)

    @staticmethod
    def sanitize_for_client(content: OrderStepsGameContent) -> Dict[str, Any]:
        # Server shuffles steps for client so client receives scrambled order
        steps_copy = list(content.steps)
        # Ensure it's not accidentally in the identical order if len > 1
        for _ in range(10):
            shuffled = random.sample(steps_copy, len(steps_copy))
            if shuffled != steps_copy or len(steps_copy) <= 1:
                break
        return {
            "prompt": content.prompt,
            "steps": shuffled,
            "hints": content.hints,
            "topic": content.topic,
            "difficulty": content.difficulty,
            "points": content.points,
        }

    @staticmethod
    def grade_item(content: OrderStepsGameContent, item_id: Any, response: Any) -> Dict[str, Any]:
        if not isinstance(response, list):
            return {"correct": False, "feedback": "Steps response must be a list."}

        is_correct = response == content.steps
        return {
            "correct": is_correct,
            "feedback": "Perfect order!" if is_correct else "Steps are not in the right sequence yet.",
            "explanation": content.explanation if is_correct else None,
        }

    @staticmethod
    def get_total_items(content: OrderStepsGameContent) -> int:
        return 1


# 4. Visualizer Handler
class VisualizerHandler(BaseGameHandler):
    @staticmethod
    def validate(content_json: str) -> VisualizerGameContent:
        data = json.loads(content_json)
        return VisualizerGameContent(**data)

    @staticmethod
    def sanitize_for_client(content: VisualizerGameContent) -> Dict[str, Any]:
        return {
            "kind": content.kind,
            "prompt": content.prompt,
            "starter_code": content.starter_code,
            "expected_output": content.expected_output,
            "test_cases": [tc.dict() for tc in content.test_cases],
            "hints": content.hints,
            "topic": content.topic,
            "difficulty": content.difficulty,
            "points": content.points,
        }

    @staticmethod
    def grade_item(content: VisualizerGameContent, item_id: Any, response: Any) -> Dict[str, Any]:
        # For visualizer, grading happens via /api/visualizer/check
        return {
            "correct": True,
            "feedback": "Visualizer challenge graded.",
        }

    @staticmethod
    def get_total_items(content: VisualizerGameContent) -> int:
        return max(1, len(content.test_cases))


# Registry Mapping
GAME_REGISTRY: Dict[str, BaseGameHandler] = {
    "fill_blank": FillBlankHandler,
    "bug_hunt": BugHuntHandler,
    "order_steps": OrderStepsHandler,
    "visualizer": VisualizerHandler,
    "code_visualizer": VisualizerHandler,
}


def get_game_handler(game_type: str) -> BaseGameHandler:
    handler = GAME_REGISTRY.get(game_type)
    if not handler:
        raise ValueError(f"Unsupported game type: {game_type}")
    return handler
