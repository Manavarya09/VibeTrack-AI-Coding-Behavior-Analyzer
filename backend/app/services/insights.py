from typing import Dict, Any, List
from datetime import datetime, timedelta


def generate_insights(sessions: List[Dict]) -> Dict[str, Any]:
    if not sessions:
        return {"message": "No sessions to analyze", "insights": []}

    insights = []

    avg_duration = sum(s.get("duration_minutes", 0) for s in sessions) / len(sessions)
    if avg_duration > 120:
        insights.append(
            {
                "type": "warning",
                "title": "Long Sessions Detected",
                "description": f"Average session length is {avg_duration:.0f} minutes. Consider taking more breaks.",
            }
        )

    high_dependency_count = sum(
        1 for s in sessions if s.get("classification") == "High Dependency"
    )
    if high_dependency_count > len(sessions) * 0.3:
        insights.append(
            {
                "type": "info",
                "title": "High Dependency Pattern",
                "description": "Over 30% of your sessions show high dependency on AI tools.",
            }
        )

    deep_flow_count = sum(1 for s in sessions if s.get("classification") == "Deep Flow")
    if deep_flow_count > len(sessions) * 0.4:
        insights.append(
            {
                "type": "success",
                "title": "Great Flow State",
                "description": "You're spending significant time in deep flow states!",
            }
        )

    total_prompts = sum(s.get("prompt_count", 0) for s in sessions)
    prompts_per_minute = total_prompts / sum(
        s.get("duration_minutes", 1) for s in sessions
    )
    if prompts_per_minute > 1:
        insights.append(
            {
                "type": "info",
                "title": "High Interaction Rate",
                "description": f"You're averaging {prompts_per_minute:.1f} prompts per minute.",
            }
        )

    return {
        "message": f"Analyzed {len(sessions)} sessions",
        "insights": insights,
        "summary": {
            "total_sessions": len(sessions),
            "avg_duration_minutes": round(avg_duration, 2),
            "high_dependency_sessions": high_dependency_count,
            "deep_flow_sessions": deep_flow_count,
        },
    }
