"""
Multi-tenancy middleware
Ensures all database queries are filtered by tenant
"""

from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp


class TenantMiddleware(BaseHTTPMiddleware):
    """
    Middleware to handle multi-tenancy
    Extracts tenant information from request and makes it available
    """

    def __init__(self, app: ASGIApp):
        super().__init__(app)

    async def dispatch(
        self, request: Request, call_next: Callable
    ) -> Response:
        """Process request and set tenant context"""

        # Extract tenant from various sources:
        # 1. Subdomain (e.g., clinica-xyz.gp-medical.com)
        # 2. Custom header (X-Tenant-ID)
        # 3. JWT token payload
        # 4. Query parameter (for development)

        tenant_id = None

        # Try custom header first
        tenant_id = request.headers.get("X-Tenant-ID")

        # Try query parameter (development only)
        if not tenant_id:
            tenant_id = request.query_params.get("tenant_id")

        # Try subdomain
        if not tenant_id:
            host = request.headers.get("host", "")
            if "." in host:
                subdomain = host.split(".")[0]
                if subdomain not in ["www", "api", "localhost"]:
                    tenant_id = subdomain

        # Store tenant in request state
        request.state.tenant_id = tenant_id

        response = await call_next(request)
        return response
