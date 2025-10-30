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
from app.core.deps import get_current_user
from app.models.user import Usuario, Rol, UsuarioRol, Permiso, RolPermiso
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
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get current user information with roles and permissions
    """
    # Get user roles
    roles_result = await db.execute(
        select(Rol)
        .join(UsuarioRol)
        .where(UsuarioRol.usuario_id == current_user.id)
        .where(Rol.activo == True)
    )
    roles = roles_result.scalars().all()

    # Get user permissions through roles
    permissions_result = await db.execute(
        select(Permiso)
        .join(RolPermiso, RolPermiso.permiso_id == Permiso.id)
        .join(Rol, Rol.id == RolPermiso.rol_id)
        .join(UsuarioRol, UsuarioRol.rol_id == Rol.id)
        .where(UsuarioRol.usuario_id == current_user.id)
        .where(Rol.activo == True)
    )
    permissions = permissions_result.scalars().all()

    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "nombre": current_user.nombre,
        "apellido_paterno": current_user.apellido_paterno,
        "apellido_materno": current_user.apellido_materno,
        "telefono": current_user.telefono,
        "celular": current_user.celular,
        "empresa_id": current_user.empresa_id,
        "cedula_profesional": current_user.cedula_profesional,
        "especialidad": current_user.especialidad,
        "subespecialidad": current_user.subespecialidad,
        "avatar_url": current_user.avatar_url,
        "is_active": current_user.is_active,
        "is_superuser": current_user.is_superuser,
        "roles": [rol.codigo for rol in roles],
        "permisos": [permiso.codigo for permiso in permissions],
        "created_at": current_user.fecha_creacion.isoformat() if current_user.fecha_creacion else None,
        "updated_at": current_user.fecha_actualizacion.isoformat() if current_user.fecha_actualizacion else None,
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
