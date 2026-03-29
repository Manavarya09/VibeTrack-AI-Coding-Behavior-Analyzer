from typing import Tuple


def calculate_vibe_score(
    duration_minutes: float, prompt_count: int, break_time_minutes: float
) -> float:
    if duration_minutes <= 0:
        return 0.0

    score = (duration_minutes * prompt_count) / (break_time_minutes + 1)
    return round(score, 2)


def classify_engagement(
    vibe_score: float, prompt_count: int, duration_minutes: float
) -> str:
    if vibe_score >= 500 or (prompt_count > 50 and duration_minutes > 120):
        return "High Dependency"
    elif vibe_score >= 100 or (prompt_count > 20 and duration_minutes > 60):
        return "Deep Flow"
    else:
        return "Normal"


def calculate_session_metrics(
    duration_minutes: float, prompt_count: int, break_time_minutes: float
) -> Tuple[float, str]:
    vibe_score = calculate_vibe_score(
        duration_minutes, prompt_count, break_time_minutes
    )
    classification = classify_engagement(vibe_score, prompt_count, duration_minutes)
    return vibe_score, classification
