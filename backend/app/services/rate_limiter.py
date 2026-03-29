from typing import Dict
import time


class RateLimiter:
    def __init__(self):
        self.requests: Dict[str, list] = {}

    def check(self, key: str, limit: int = 100, window: int = 60) -> bool:
        now = time.time()

        if key not in self.requests:
            self.requests[key] = []

        self.requests[key] = [t for t in self.requests[key] if now - t < window]

        if len(self.requests[key]) >= limit:
            return False

        self.requests[key].append(now)
        return True

    def get_remaining(self, key: str, limit: int = 100) -> int:
        if key not in self.requests:
            return limit
        return max(0, limit - len(self.requests[key]))


rate_limiter = RateLimiter()
