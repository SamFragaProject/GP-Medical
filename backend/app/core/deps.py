"""
Dependencies for FastAPI endpoints
Authentication, authorization, and common dependencies
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import Usuario

# Security scheme for JWT Bearer tokens
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Usuario:
    """
    Get current authenticated user from JWT token
    Validates token and retrieves user from database
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )

    # Decode token
    token = credentials.credentials
    payload = decode_token(token)

    if payload is None:
        raise credentials_exception

    # Validate token type
    token_type = payload.get("type")
    if token_type != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Tipo de token inválido",
        )

    # Get user_id from token
    user_id: Optional[int] = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    # Query user from database
    result = await db.execute(
        select(Usuario).where(Usuario.id == int(user_id))
    )
    user = result.scalar_one_or_none()

    if user is None:
        raise credentials_exception

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo",
        )

    return user


async def get_current_active_user(
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    """
    Get current active user
    Alias for get_current_user (already checks is_active)
    """
    return current_user


async def get_current_superuser(
    current_user: Usuario = Depends(get_current_user),
) -> Usuario:
    """
    Get current superuser
    Raises 403 if user is not a superuser
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tiene permisos de administrador",
        )
    return current_user


def require_role(required_role: str):
    """
    Dependency to require a specific role
    Usage: current_user: Usuario = Depends(require_role("MEDICO"))
    """
    async def role_checker(
        current_user: Usuario = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> Usuario:
        # Check if user has the required role
        result = await db.execute(
            select(Usuario)
            .where(Usuario.id == current_user.id)
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usuario no encontrado",
            )

        # Load usuario_roles to check
        from app.models.user import UsuarioRol, Rol
        roles_result = await db.execute(
            select(Rol)
            .join(UsuarioRol, UsuarioRol.rol_id == Rol.id)
            .where(UsuarioRol.usuario_id == user.id)
        )
        roles = roles_result.scalars().all()

        # Check if user has the required role
        has_role = any(rol.codigo == required_role for rol in roles)

        if not has_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere el rol: {required_role}",
            )

        return user

    return role_checker


def require_permission(required_permission: str):
    """
    Dependency to require a specific permission
    Usage: current_user: Usuario = Depends(require_permission("pacientes:crear"))
    """
    async def permission_checker(
        current_user: Usuario = Depends(get_current_user),
        db: AsyncSession = Depends(get_db),
    ) -> Usuario:
        # Superusers have all permissions
        if current_user.is_superuser:
            return current_user

        # Check if user has the required permission through their roles
        from app.models.user import UsuarioRol, Rol, RolPermiso, Permiso

        permissions_result = await db.execute(
            select(Permiso)
            .join(RolPermiso, RolPermiso.permiso_id == Permiso.id)
            .join(Rol, Rol.id == RolPermiso.rol_id)
            .join(UsuarioRol, UsuarioRol.rol_id == Rol.id)
            .where(UsuarioRol.usuario_id == current_user.id)
            .where(Rol.activo == True)
        )
        permissions = permissions_result.scalars().all()

        # Check if user has the required permission
        has_permission = any(
            permiso.codigo == required_permission for permiso in permissions
        )

        if not has_permission:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Se requiere el permiso: {required_permission}",
            )

        return current_user

    return permission_checker


# Optional authentication (for public endpoints that want user info if available)
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    ),
    db: AsyncSession = Depends(get_db),
) -> Optional[Usuario]:
    """
    Get current user if token is provided, otherwise return None
    Useful for public endpoints that want to customize behavior for logged-in users
    """
    if credentials is None:
        return None

    try:
        token = credentials.credentials
        payload = decode_token(token)

        if payload is None:
            return None

        user_id: Optional[int] = payload.get("sub")
        if user_id is None:
            return None

        result = await db.execute(
            select(Usuario).where(Usuario.id == int(user_id))
        )
        user = result.scalar_one_or_none()

        if user and user.is_active:
            return user

    except Exception:
        # If anything fails, just return None
        pass

    return None
