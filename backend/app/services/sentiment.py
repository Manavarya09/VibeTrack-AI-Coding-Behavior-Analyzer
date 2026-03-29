from typing import Dict, List, Optional
from datetime import datetime


class SentimentAnalyzer:
    def __init__(self):
        self.positive_keywords = [
            "great",
            "excellent",
            "amazing",
            "love",
            "perfect",
            "awesome",
            "productive",
            "focused",
            "flow",
            "accomplished",
            "success",
        ]
        self.negative_keywords = [
            "frustrated",
            "stuck",
            "confused",
            "tired",
            "burnout",
            "stressed",
            "overwhelmed",
            "failed",
            "error",
            "bug",
        ]

    def analyze_session_sentiment(self, session_data: Dict) -> Dict:
        content = session_data.get("content", "").lower()

        positive_count = sum(1 for word in self.positive_keywords if word in content)
        negative_count = sum(1 for word in self.negative_keywords if word in content)

        if positive_count > negative_count:
            sentiment = "positive"
            score = min(positive_count / (positive_count + negative_count + 1), 1.0)
        elif negative_count > positive_count:
            sentiment = "negative"
            score = min(negative_count / (positive_count + negative_count + 1), 1.0)
        else:
            sentiment = "neutral"
            score = 0.5

        return {
            "sentiment": sentiment,
            "score": round(score, 2),
            "positive_indicators": positive_count,
            "negative_indicators": negative_count,
        }

    def get_session_mood(self, events: List[Dict]) -> str:
        prompt_texts = [
            e.get("content", "") for e in events if e.get("event_type") == "prompt"
        ]

        if not prompt_texts:
            return "neutral"

        total_positive = sum(
            1
            for text in prompt_texts
            for word in self.positive_keywords
            if word in text.lower()
        )
        total_negative = sum(
            1
            for text in prompt_texts
            for word in self.negative_keywords
            if word in text.lower()
        )

        if total_positive > total_negative * 2:
            return "productive"
        elif total_negative > total_positive * 2:
            return "struggling"
        else:
            return "neutral"


sentiment_analyzer = SentimentAnalyzer()
