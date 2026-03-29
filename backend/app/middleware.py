from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from typing import Dict
import time
from collections import defaultdict


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, calls: int = 100, period: int = 60):
        super().__init__(app)
        self.calls = calls
        self.period = period
        self.clients: Dict[str, list] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        current_time = time.time()

        if client_ip in self.clients:
            self.clients[client_ip] = [
                timestamp
                for timestamp in self.clients[client_ip]
                if current_time - timestamp < self.period
            ]

        if len(self.clients[client_ip]) >= self.calls:
            raise HTTPException(
                status_code=429, detail="Rate limit exceeded. Please try again later."
            )

        self.clients[client_ip].append(current_time)

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(self.calls)
        response.headers["X-RateLimit-Remaining"] = str(
            self.calls - len(self.clients[client_ip])
        )

        return response
