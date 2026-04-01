from typing import List, Dict, Any
from datetime import datetime, timedelta
import statistics


class PatternDetector:
    def __init__(self):
        self.learning_rate = 0.1

    def detect_productivity_patterns(self, sessions: List[Dict]) -> Dict[str, Any]:
        if len(sessions) < 3:
            return {"message": "Not enough data for pattern detection", "patterns": []}

        patterns = []

        hourly_distribution = self._analyze_hourly_patterns(sessions)
        if hourly_distribution.get("peak_hours"):
            patterns.append(
                {
                    "type": "peak_performance",
                    "description": f"Your most productive hours are {hourly_distribution['peak_hours']}",
                    "confidence": hourly_distribution["confidence"],
                }
            )

        break_pattern = self._analyze_break_patterns(sessions)
        if break_pattern.get("frequency"):
            patterns.append(
                {
                    "type": "break_habits",
                    "description": break_pattern["description"],
                    "data": break_pattern,
                }
            )

        dependency_trend = self._analyze_dependency_trend(sessions)
        if dependency_trend:
            patterns.append(dependency_trend)

        return {
            "patterns": patterns,
            "recommendations": self._generate_recommendations(patterns),
        }

    def _analyze_hourly_patterns(self, sessions: List[Dict]) -> Dict:
        hour_counts = {}
        for session in sessions:
            if session.get("start_time"):
                hour = datetime.fromisoformat(
                    session["start_time"].replace("Z", "+00:00")
                ).hour
                if hour not in hour_counts:
                    hour_counts[hour] = {"count": 0, "total_minutes": 0}
                hour_counts[hour]["count"] += 1
                hour_counts[hour]["total_minutes"] += session.get("duration_minutes", 0)

        if not hour_counts:
            return {}

        peak_hours = sorted(
            hour_counts.items(), key=lambda x: x[1]["total_minutes"], reverse=True
        )[:3]

        return {
            "peak_hours": [h[0] for h in peak_hours],
            "confidence": 0.75 if len(sessions) > 10 else 0.5,
        }

    def _analyze_break_patterns(self, sessions: List[Dict]) -> Dict:
        breaks = [
            s.get("break_time_minutes", 0)
            for s in sessions
            if s.get("break_time_minutes")
        ]

        if not breaks:
            return {"description": "No break data available", "frequency": 0}

        avg_break = statistics.mean(breaks)

        if avg_break < 5:
            description = "You take very short breaks. Consider taking longer breaks for better productivity."
        elif avg_break < 15:
            description = "Your break patterns are healthy. Keep it up!"
        else:
            description = "You take longer breaks. Ensure they're spaced regularly."

        return {
            "description": description,
            "frequency": avg_break,
            "total_breaks": len(breaks),
        }

    def _analyze_dependency_trend(self, sessions: List[Dict]) -> Dict:
        recent = sessions[:5]
        older = sessions[5:10] if len(sessions) > 5 else []

        if not older:
            return {}

        recent_dep = sum(
            1 for s in recent if s.get("classification") == "High Dependency"
        )
        older_dep = sum(
            1 for s in older if s.get("classification") == "High Dependency"
        )

        if recent_dep > older_dep:
            return {
                "type": "dependency_increasing",
                "description": "Your AI dependency has been increasing. Consider coding more independently.",
                "trend": "increasing",
            }
        elif recent_dep < older_dep:
            return {
                "type": "dependency_decreasing",
                "description": "Great progress! You're becoming less dependent on AI assistance.",
                "trend": "decreasing",
            }

        return {}

    def _generate_recommendations(self, patterns: List[Dict]) -> List[str]:
        recommendations = []

        for pattern in patterns:
            if pattern.get("type") == "peak_performance":
                recommendations.append(
                    f"Schedule complex coding tasks during your peak hours"
                )
            elif pattern.get("type") == "break_habits":
                recommendations.append("Take regular breaks to maintain focus")
            elif pattern.get("type") == "dependency_increasing":
                recommendations.append(
                    "Try solving problems independently before using AI"
                )

        if not recommendations:
            recommendations.append("Keep tracking to get personalized recommendations")

        return recommendations

    def predict_session_outcome(self, session_data: Dict) -> Dict:
        duration = session_data.get("duration_minutes", 0)
        prompts = session_data.get("prompt_count", 0)
        breaks = session_data.get("break_time_minutes", 0)

        # Calculate actual vibe score using formula
        predicted_score = round(
            (duration * prompts) / (breaks + 1), 2
        ) if duration > 0 else 0

        if predicted_score >= 500 or (prompts > 50 and duration > 120):
            predicted_class = "High Dependency"
            confidence = 0.85
        elif predicted_score >= 100 or (prompts > 20 and duration > 60):
            predicted_class = "Deep Flow"
            confidence = 0.70
        else:
            predicted_class = "Normal"
            confidence = 0.60

        # Scale confidence with data quality
        confidence = min(0.5 + (duration / 360), 0.95)

        return {
            "predicted_classification": predicted_class,
            "predicted_score": predicted_score,
            "confidence": round(confidence, 2),
            "factors": {
                "duration": duration,
                "prompt_count": prompts,
                "break_minutes": breaks,
            },
        }
