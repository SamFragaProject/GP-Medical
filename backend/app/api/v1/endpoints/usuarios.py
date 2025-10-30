"""
Gestión Completa de Usuarios
- CRUD de usuarios
- Gestión de roles
- Cambio de contraseña
- Activación/desactivación
- Búsqueda avanzada
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from sqlalchemy.orm import selectinload
from pydantic import BaseModel, EmailStr
from datetime import datetime

from app.db.session import get_db
from app.core.security import get_password_hash, verify_password
from app.core.deps import get_current_user
from app.models.user import Usuario, Rol

router = APIRouter()


# ============================================================================
# SCHEMAS
# ============================================================================

class UsuarioBase(BaseModel):
    email: EmailStr
    username: str
    nombre: str
    apellido_paterno: str
    apellido_materno: Optional[str] = None
    telefono: Optional[str] = None
    celular: Optional[str] = None
    cedula_profesional: Optional[str] = None
    especialidad: Optional[str] = None
    subespecialidad: Optional[str] = None


class UsuarioCreate(UsuarioBase):
    password: str
    empresa_id: int
    rol_id: Optional[int] = None


class UsuarioUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    nombre: Optional[str] = None
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    telefono: Optional[str] = None
    celular: Optional[str] = None
    cedula_profesional: Optional[str] = None
    especialidad: Optional[str] = None
    subespecialidad: Optional[str] = None
    is_active: Optional[bool] = None


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class ResetPasswordRequest(BaseModel):
    new_password: str


class UsuarioResponse(BaseModel):
    id: int
    empresa_id: int
    email: str
    username: str
    nombre: str
    apellido_paterno: str
    apellido_materno: Optional[str]
    telefono: Optional[str]
    celular: Optional[str]
    cedula_profesional: Optional[str]
    especialidad: Optional[str]
    subespecialidad: Optional[str]
    is_active: bool
    is_superuser: bool
    ultimo_acceso: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UsuarioWithRoles(UsuarioResponse):
    roles: List[dict] = []

    class Config:
        from_attributes = True


# ============================================================================
# USUARIOS CRUD
# ============================================================================

@router.get("/", response_model=List[UsuarioResponse])
async def list_usuarios(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    rol_id: Optional[int] = None,
    is_active: Optional[bool] = None,
    especialidad: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Lista todos los usuarios con filtros opcionales
    """
    query = select(Usuario)

    # Filtros
    conditions = []

    if search:
        conditions.append(
            or_(
                Usuario.nombre.ilike(f"%{search}%"),
                Usuario.apellido_paterno.ilike(f"%{search}%"),
                Usuario.email.ilike(f"%{search}%"),
                Usuario.username.ilike(f"%{search}%"),
            )
        )

    if is_active is not None:
        conditions.append(Usuario.is_active == is_active)

    if especialidad:
        conditions.append(Usuario.especialidad.ilike(f"%{especialidad}%"))

    if conditions:
        query = query.where(and_(*conditions))

    query = query.offset(skip).limit(limit).order_by(Usuario.created_at.desc())

    result = await db.execute(query)
    usuarios = result.scalars().all()

    return usuarios


@router.get("/{usuario_id}", response_model=UsuarioWithRoles)
async def get_usuario(
    usuario_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Obtiene un usuario por ID con sus roles
    """
    query = select(Usuario).options(selectinload(Usuario.roles)).where(Usuario.id == usuario_id)

    result = await db.execute(query)
    usuario = result.scalar_one_or_none()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return usuario


@router.post("/", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def create_usuario(
    usuario_data: UsuarioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Crea un nuevo usuario
    """
    # Verificar si el email ya existe
    result = await db.execute(
        select(Usuario).where(Usuario.email == usuario_data.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El email ya está registrado"
        )

    # Verificar si el username ya existe
    result = await db.execute(
        select(Usuario).where(Usuario.username == usuario_data.username)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre de usuario ya está registrado"
        )

    # Crear usuario
    nuevo_usuario = Usuario(
        email=usuario_data.email,
        username=usuario_data.username,
        hashed_password=get_password_hash(usuario_data.password),
        nombre=usuario_data.nombre,
        apellido_paterno=usuario_data.apellido_paterno,
        apellido_materno=usuario_data.apellido_materno,
        telefono=usuario_data.telefono,
        celular=usuario_data.celular,
        cedula_profesional=usuario_data.cedula_profesional,
        especialidad=usuario_data.especialidad,
        subespecialidad=usuario_data.subespecialidad,
        empresa_id=usuario_data.empresa_id,
        is_active=True,
        is_superuser=False,
    )

    db.add(nuevo_usuario)
    await db.commit()
    await db.refresh(nuevo_usuario)

    # Asignar rol si se especificó
    if usuario_data.rol_id:
        # TODO: Asignar rol al usuario
        pass

    return nuevo_usuario


@router.put("/{usuario_id}", response_model=UsuarioResponse)
async def update_usuario(
    usuario_id: int,
    usuario_data: UsuarioUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Actualiza un usuario existente
    """
    query = select(Usuario).where(Usuario.id == usuario_id)
    result = await db.execute(query)
    usuario = result.scalar_one_or_none()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Si se cambia el email, verificar que no exista
    if usuario_data.email and usuario_data.email != usuario.email:
        result = await db.execute(
            select(Usuario).where(Usuario.email == usuario_data.email)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El email ya está registrado"
            )

    # Si se cambia el username, verificar que no exista
    if usuario_data.username and usuario_data.username != usuario.username:
        result = await db.execute(
            select(Usuario).where(Usuario.username == usuario_data.username)
        )
        if result.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El nombre de usuario ya está registrado"
            )

    # Actualizar campos
    for key, value in usuario_data.model_dump(exclude_unset=True).items():
        setattr(usuario, key, value)

    await db.commit()
    await db.refresh(usuario)

    return usuario


@router.delete("/{usuario_id}")
async def delete_usuario(
    usuario_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Desactiva un usuario (no lo elimina físicamente)
    """
    query = select(Usuario).where(Usuario.id == usuario_id)
    result = await db.execute(query)
    usuario = result.scalar_one_or_none()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # No permitir auto-eliminación
    if usuario.id == current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes desactivar tu propio usuario"
        )

    # Desactivar en lugar de eliminar
    usuario.is_active = False

    await db.commit()

    return {"message": "Usuario desactivado exitosamente"}


# ============================================================================
# GESTIÓN DE CONTRASEÑAS
# ============================================================================

@router.post("/{usuario_id}/change-password")
async def change_password(
    usuario_id: int,
    passwords: ChangePasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Cambio de contraseña (requiere contraseña actual)
    """
    # Solo el mismo usuario puede cambiar su contraseña con este endpoint
    if usuario_id != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para cambiar la contraseña de otro usuario"
        )

    query = select(Usuario).where(Usuario.id == usuario_id)
    result = await db.execute(query)
    usuario = result.scalar_one_or_none()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Verificar contraseña actual
    if not verify_password(passwords.current_password, usuario.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Contraseña actual incorrecta"
        )

    # Actualizar contraseña
    usuario.hashed_password = get_password_hash(passwords.new_password)

    await db.commit()

    return {"message": "Contraseña actualizada exitosamente"}


@router.post("/{usuario_id}/reset-password")
async def reset_password(
    usuario_id: int,
    passwords: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Reseteo de contraseña por administrador (no requiere contraseña actual)
    Solo para administradores
    """
    # TODO: Verificar que current_user sea administrador

    query = select(Usuario).where(Usuario.id == usuario_id)
    result = await db.execute(query)
    usuario = result.scalar_one_or_none()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Actualizar contraseña
    usuario.hashed_password = get_password_hash(passwords.new_password)

    await db.commit()

    return {"message": "Contraseña reseteada exitosamente"}


# ============================================================================
# ACTIVACIÓN/DESACTIVACIÓN
# ============================================================================

@router.post("/{usuario_id}/activate")
async def activate_usuario(
    usuario_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Activa un usuario desactivado
    """
    query = select(Usuario).where(Usuario.id == usuario_id)
    result = await db.execute(query)
    usuario = result.scalar_one_or_none()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.is_active = True

    await db.commit()

    return {"message": "Usuario activado exitosamente"}


@router.post("/{usuario_id}/deactivate")
async def deactivate_usuario(
    usuario_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Desactiva un usuario
    """
    query = select(Usuario).where(Usuario.id == usuario_id)
    result = await db.execute(query)
    usuario = result.scalar_one_or_none()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # No permitir auto-desactivación
    if usuario.id == current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No puedes desactivar tu propio usuario"
        )

    usuario.is_active = False

    await db.commit()

    return {"message": "Usuario desactivado exitosamente"}


# ============================================================================
# BÚSQUEDAS Y FILTROS
# ============================================================================

@router.get("/search/medicos", response_model=List[UsuarioResponse])
async def search_medicos(
    search: Optional[str] = None,
    especialidad: Optional[str] = None,
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Busca médicos (usuarios con cédula profesional)
    """
    query = select(Usuario).where(
        and_(
            Usuario.is_active == True,
            Usuario.cedula_profesional.isnot(None)
        )
    )

    if search:
        query = query.where(
            or_(
                Usuario.nombre.ilike(f"%{search}%"),
                Usuario.apellido_paterno.ilike(f"%{search}%"),
                Usuario.especialidad.ilike(f"%{search}%"),
            )
        )

    if especialidad:
        query = query.where(Usuario.especialidad.ilike(f"%{especialidad}%"))

    query = query.limit(limit).order_by(Usuario.nombre)

    result = await db.execute(query)
    medicos = result.scalars().all()

    return medicos


@router.get("/stats/summary")
async def get_user_stats(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Obtiene estadísticas de usuarios
    """
    # Total usuarios
    result = await db.execute(select(Usuario))
    total = len(result.scalars().all())

    # Usuarios activos
    result = await db.execute(select(Usuario).where(Usuario.is_active == True))
    activos = len(result.scalars().all())

    # Usuarios inactivos
    inactivos = total - activos

    # Médicos
    result = await db.execute(
        select(Usuario).where(Usuario.cedula_profesional.isnot(None))
    )
    medicos = len(result.scalars().all())

    return {
        "total": total,
        "activos": activos,
        "inactivos": inactivos,
        "medicos": medicos,
    }
