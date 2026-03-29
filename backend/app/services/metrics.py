from typing import Dict, Any, List
from datetime import datetime, timedelta
import time


class MetricsCollector:
    def __init__(self):
        self.request_count = 0
        self.error_count = 0
        self.response_times: List[float] = []
        self.endpoint_stats: Dict[str, Dict] = {}
        self.start_time = time.time()

    def record_request(
        self, endpoint: str, method: str, status_code: int, duration: float
    ):
        self.request_count += 1
        self.response_times.append(duration)

        if status_code >= 400:
            self.error_count += 1

        key = f"{method}:{endpoint}"
        if key not in self.endpoint_stats:
            self.endpoint_stats[key] = {"count": 0, "errors": 0, "total_time": 0}

        self.endpoint_stats[key]["count"] += 1
        if status_code >= 400:
            self.endpoint_stats[key]["errors"] += 1
        self.endpoint_stats[key]["total_time"] += duration

        if len(self.response_times) > 1000:
            self.response_times = self.response_times[-1000:]

    def get_metrics(self) -> Dict[str, Any]:
        uptime = time.time() - self.start_time

        avg_response_time = (
            sum(self.response_times) / len(self.response_times)
            if self.response_times
            else 0
        )
        p50 = self._percentile(self.response_times, 50)
        p95 = self._percentile(self.response_times, 95)
        p99 = self._percentile(self.response_times, 99)

        return {
            "uptime_seconds": round(uptime, 2),
            "total_requests": self.request_count,
            "total_errors": self.error_count,
            "error_rate": round(self.error_count / self.request_count * 100, 2)
            if self.request_count > 0
            else 0,
            "requests_per_second": round(self.request_count / uptime, 2)
            if uptime > 0
            else 0,
            "response_time": {
                "avg_ms": round(avg_response_time * 1000, 2),
                "p50_ms": round(p50 * 1000, 2),
                "p95_ms": round(p95 * 1000, 2),
                "p99_ms": round(p99 * 1000, 2),
            },
            "endpoints": self.endpoint_stats,
        }

    def _percentile(self, data: List[float], percentile: int) -> float:
        if not data:
            return 0
        sorted_data = sorted(data)
        index = int(len(sorted_data) * percentile / 100)
        return sorted_data[min(index, len(sorted_data) - 1)]

    def reset(self):
        self.request_count = 0
        self.error_count = 0
        self.response_times = []
        self.endpoint_stats = {}


metrics = MetricsCollector()
