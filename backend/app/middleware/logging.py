"""
Logging middleware for request/response tracking
"""

import time
import logging
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

logger = logging.getLogger(__name__)


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log all requests and responses"""

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        """Log request and response"""

        # Start timer
        start_time = time.time()

        # Get request info
        method = request.method
        url = str(request.url)
        client = request.client.host if request.client else "unknown"

        # Process request
        response = await call_next(request)

        # Calculate duration
        duration = time.time() - start_time

        # Log
        logger.info(
            f"{method} {url} - {response.status_code} - "
            f"{duration:.2f}s - {client}"
        )

        # Add custom headers
        response.headers["X-Process-Time"] = str(duration)

        return response
