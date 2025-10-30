"""
Authentication endpoints - Complete with roles
"""

from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload

from app.core.database import get_db
from app.core.security import verify_password, create_access_token, create_refresh_token
from app.core.config import settings
from app.models.user import Usuario, Rol, UsuarioRol
from app.schemas.auth import Login, Token
from app.schemas.user import Usuario as UsuarioSchema, UsuarioWithRoles

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(
    credentials: Login,
    db: AsyncSession = Depends(get_db),
):
    """
    Login with email and password
    Returns access and refresh tokens + user info with roles
    """
    # Get user by email
    result = await db.execute(
        select(Usuario).where(Usuario.email == credentials.email)
    )
    user = result.scalar_one_or_none()

    # Verify user exists and password is correct
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user",
        )

    # Get user roles
    roles_result = await db.execute(
        select(Rol)
        .join(UsuarioRol)
        .where(UsuarioRol.usuario_id == user.id)
    )
    roles = roles_result.scalars().all()

    # Create tokens with role information
    token_data = {
        "sub": user.id,
        "email": user.email,
        "empresa_id": user.empresa_id,
        "roles": [rol.codigo for rol in roles]
    }

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data=token_data,
        expires_delta=access_token_expires,
    )

    refresh_token = create_refresh_token(
        data={"sub": user.id, "email": user.email},
    )

    # Update last login
    from datetime import datetime
    user.last_login = datetime.utcnow()
    await db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post("/refresh", response_model=Token)
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Refresh access token using refresh token
    """
    from app.core.security import decode_token

    # Decode refresh token
    payload = decode_token(refresh_token)
    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    # Get user
    result = await db.execute(
        select(Usuario).where(Usuario.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user",
        )

    # Get roles
    roles_result = await db.execute(
        select(Rol)
        .join(UsuarioRol)
        .where(UsuarioRol.usuario_id == user.id)
    )
    roles = roles_result.scalars().all()

    # Create new tokens
    token_data = {
        "sub": user.id,
        "email": user.email,
        "empresa_id": user.empresa_id,
        "roles": [rol.codigo for rol in roles]
    }

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data=token_data,
        expires_delta=access_token_expires,
    )

    new_refresh_token = create_refresh_token(
        data={"sub": user.id, "email": user.email},
    )

    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }


@router.get("/me", response_model=UsuarioWithRoles)
async def get_current_user_info(
    db: AsyncSession = Depends(get_db),
):
    """
    Get current user information
    TODO: Add proper authentication dependency
    """
    # For now, return mock data
    return {
        "id": 1,
        "email": "admin@clinica.com",
        "username": "admin",
        "nombre": "Administrador",
        "apellido_paterno": "Sistema",
        "empresa_id": 1,
        "is_active": True,
        "is_superuser": False,
        "roles": ["ADMIN"],
        "permisos": [],
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }


@router.get("/roles")
async def get_available_roles(
    db: AsyncSession = Depends(get_db),
):
    """
    Get all available roles for login selection
    """
    result = await db.execute(
        select(Rol).where(Rol.activo == True)
    )
    roles = result.scalars().all()

    return [
        {
            "id": rol.id,
            "nombre": rol.nombre,
            "codigo": rol.codigo,
            "descripcion": rol.descripcion,
            "es_medico": rol.es_medico
        }
        for rol in roles
    ]
