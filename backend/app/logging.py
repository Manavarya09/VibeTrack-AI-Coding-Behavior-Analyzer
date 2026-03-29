from fastapi import Request
from typing import Callable
import time
import logging

logger = logging.getLogger(__name__)


async def log_requests(request: Request, call_next: Callable):
    start_time = time.time()

    response = await call_next(request)

    process_time = time.time() - start_time

    logger.info(
        f"{request.method} {request.url.path} - "
        f"Status: {response.status_code} - "
        f"Duration: {process_time:.3f}s"
    )

    response.headers["X-Process-Time"] = str(process_time)

    return response


class RequestLogger:
    def __init__(self):
        self.requests = []

    def log(self, method: str, path: str, status: int, duration: float):
        self.requests.append(
            {
                "method": method,
                "path": path,
                "status": status,
                "duration": duration,
                "timestamp": time.time(),
            }
        )

        if len(self.requests) > 1000:
            self.requests = self.requests[-1000:]

    def get_recent(self, limit: int = 100):
        return self.requests[-limit:]


request_logger = RequestLogger()
