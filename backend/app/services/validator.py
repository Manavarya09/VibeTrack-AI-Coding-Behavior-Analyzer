from typing import Dict, Any, List
from datetime import datetime


class DataValidator:
    @staticmethod
    def validate_session_data(data: Dict) -> tuple[bool, List[str]]:
        errors = []

        if "user_id" not in data:
            errors.append("user_id is required")

        if "duration_minutes" in data and data["duration_minutes"] < 0:
            errors.append("duration_minutes cannot be negative")

        if "prompt_count" in data and data["prompt_count"] < 0:
            errors.append("prompt_count cannot be negative")

        return len(errors) == 0, errors

    @staticmethod
    def validate_event_data(data: Dict) -> tuple[bool, List[str]]:
        errors = []

        required = ["session_id", "user_id", "event_type"]
        for field in required:
            if field not in data:
                errors.append(f"{field} is required")

        valid_types = ["prompt", "break", "activity", "tab_focus"]
        if "event_type" in data and data["event_type"] not in valid_types:
            errors.append(f"event_type must be one of: {valid_types}")

        return len(errors) == 0, errors


validator = DataValidator()
