from typing import Dict, Any, List
from datetime import datetime, timedelta


class RecommendationEngine:
    def __init__(self):
        self.recommendations = []

    def generate_recommendations(self, user_data: Dict) -> List[Dict]:
        recommendations = []

        if user_data.get("avg_session_length", 0) > 120:
            recommendations.append(
                {
                    "type": "break_reminder",
                    "priority": "high",
                    "message": "Your average session exceeds 2 hours. Consider taking regular breaks.",
                    "action": "Enable break reminders in settings",
                }
            )

        if (
            user_data.get("high_dependency_count", 0)
            > user_data.get("total_sessions", 1) * 0.3
        ):
            recommendations.append(
                {
                    "type": "dependency_check",
                    "priority": "medium",
                    "message": "High dependency on AI detected. Try solving problems independently first.",
                    "action": "Practice coding without AI for 30 minutes daily",
                }
            )

        if user_data.get("avg_break_per_session", 0) < 5:
            recommendations.append(
                {
                    "type": "health_check",
                    "priority": "high",
                    "message": "You take very short breaks. This may lead to burnout.",
                    "action": "Set minimum 5-minute breaks every hour",
                }
            )

        peak_hours = user_data.get("peak_hours", [])
        if peak_hours and 0 in peak_hours:
            recommendations.append(
                {
                    "type": "schedule_optimization",
                    "priority": "low",
                    "message": "Late night coding detected. Consider adjusting your schedule.",
                    "action": "Schedule important work during peak hours",
                }
            )

        if not recommendations:
            recommendations.append(
                {
                    "type": "keep_it_up",
                    "priority": "low",
                    "message": "Your coding habits look great! Keep it up.",
                    "action": None,
                }
            )

        return recommendations

    def get_personalized_tips(self, session_data: Dict) -> List[str]:
        tips = []

        if session_data.get("classification") == "High Dependency":
            tips.append("Try to solve the problem yourself before using AI assistance")
            tips.append("Use AI for learning, not just copying solutions")

        if session_data.get("duration_minutes", 0) > 180:
            tips.append("Consider taking a longer break to rest your mind")

        if session_data.get("prompt_count", 0) > 50:
            tips.append(
                "High interaction rate - ensure you're learning, not just copying"
            )

        return tips


recommendation_engine = RecommendationEngine()
