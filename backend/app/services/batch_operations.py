from typing import List, Dict, Any
from datetime import datetime, timedelta
import random


class DataGenerator:
    @staticmethod
    def generate_sample_data(num_sessions: int = 10) -> List[Dict[str, Any]]:
        sessions = []
        sources = ["desktop", "chrome", "web"]
        classifications = ["Normal", "Deep Flow", "High Dependency"]

        for i in range(num_sessions):
            start_time = datetime.utcnow() - timedelta(days=random.randint(0, 30))
            duration = random.uniform(15, 180)
            prompts = random.randint(1, 50)
            breaks = random.uniform(0, 30)

            vibe_score = (duration * prompts) / (breaks + 1)

            if vibe_score >= 500:
                classification = "High Dependency"
            elif vibe_score >= 100:
                classification = "Deep Flow"
            else:
                classification = "Normal"

            sessions.append(
                {
                    "user_id": 1,
                    "start_time": start_time.isoformat(),
                    "end_time": (start_time + timedelta(minutes=duration)).isoformat(),
                    "duration_minutes": round(duration, 2),
                    "prompt_count": prompts,
                    "break_time_minutes": round(breaks, 2),
                    "vibe_score": round(vibe_score, 2),
                    "classification": classification,
                    "source": random.choice(sources),
                    "is_active": False,
                }
            )

        return sessions

    @staticmethod
    def generate_daily_stats(days: int = 7) -> List[Dict[str, Any]]:
        stats = []

        for i in range(days):
            date = datetime.utcnow() - timedelta(days=days - i - 1)
            stats.append(
                {
                    "date": date.strftime("%Y-%m-%d"),
                    "session_count": random.randint(1, 8),
                    "total_minutes": random.uniform(60, 480),
                }
            )

        return stats


generator = DataGenerator()
