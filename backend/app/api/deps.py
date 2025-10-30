"""
API dependencies
"""

from typing import Optional, Generator
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import Usuario


# Security scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Usuario:
    """
    Get current authenticated user
    """
    token = credentials.credentials

    # Decode token
    payload = decode_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id: int = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    # Get user from database
    result = await db.execute(
        select(Usuario).where(Usuario.id == user_id)
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )

    return user


async def get_current_active_superuser(
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    """
    Get current active superuser
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions",
        )
    return current_user


async def get_tenant_id(
    x_tenant_id: Optional[str] = Header(None),
    current_user: Usuario = Depends(get_current_user),
) -> int:
    """
    Get tenant ID from header or current user
    """
    if x_tenant_id:
        return int(x_tenant_id)
    return current_user.empresa_id


def require_permission(permission: str):
    """
    Dependency factory for checking permissions
    Usage: deps.require_permission("pacientes:crear")
    """
    async def permission_checker(
        current_user: Usuario = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> Usuario:
        # TODO: Implement permission checking against user's roles
        # For now, just return the user
        # In production, check if user has the required permission
        return current_user

    return permission_checker
