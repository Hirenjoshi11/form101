"""
FormSeva In-Memory Sliding-Window Rate Limiter (FS-M1).
Protects against brute force and denial of service attacks on auth/OTP endpoints.
"""
import time
from collections import defaultdict
from typing import Dict, List, Tuple
from fastapi import Request, HTTPException, status

class InMemoryRateLimiter:
    def __init__(self, requests_limit: int = 10, window_seconds: int = 60):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        # key: (client_ip, route_path) -> list of request timestamps
        self._history: Dict[Tuple[str, str], List[float]] = defaultdict(list)

    def __call__(self, request: Request):
        client_ip = request.client.host if request.client else "127.0.0.1"
        route_path = request.url.path
        now = time.time()
        
        # Sliding window pruning
        cutoff = now - self.window_seconds
        key = (client_ip, route_path)
        
        history = [ts for ts in self._history[key] if ts > cutoff]
        self._history[key] = history
        
        if len(history) >= self.requests_limit:
            retry_after = int(self.window_seconds - (now - history[0])) + 1
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Please try again in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)}
            )
            
        self._history[key].append(now)

# Predefined rate limiters for critical endpoints
auth_rate_limiter = InMemoryRateLimiter(requests_limit=15, window_seconds=60) # 15 attempts / min
otp_rate_limiter = InMemoryRateLimiter(requests_limit=10, window_seconds=60)  # 10 attempts / min
