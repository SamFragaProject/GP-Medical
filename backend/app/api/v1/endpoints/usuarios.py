"""
Usuarios endpoints - Complete implementation
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.database import get_db
from app.core.security import get_password_hash
from app.api.deps import get_current_user, get_tenant_id
from app.models.user import Usuario, Rol, UsuarioRol
from app.schemas.user import Usuario as UsuarioSchema, UsuarioCreate, UsuarioUpdate, UsuarioWithRoles

router = APIRouter()


@router.get("/", response_model=List[UsuarioSchema])
async def list_usuarios(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    empresa_id: int = Depends(get_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """List all usuarios"""
    query = select(Usuario).where(Usuario.empresa_id == empresa_id)

    if search:
        query = query.where(
            or_(
                Usuario.nombre.ilike(f"%{search}%"),
                Usuario.apellido_paterno.ilike(f"%{search}%"),
                Usuario.email.ilike(f"%{search}%"),
                Usuario.username.ilike(f"%{search}%"),
            )
        )

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    usuarios = result.scalars().all()

    return usuarios


@router.post("/", response_model=UsuarioSchema, status_code=status.HTTP_201_CREATED)
async def create_usuario(
    usuario_in: UsuarioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Create new usuario"""
    # Check if email exists
    result = await db.execute(
        select(Usuario).where(Usuario.email == usuario_in.email)
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create usuario
    usuario = Usuario(
        email=usuario_in.email,
        username=usuario_in.username,
        hashed_password=get_password_hash(usuario_in.password),
        nombre=usuario_in.nombre,
        apellido_paterno=usuario_in.apellido_paterno,
        apellido_materno=usuario_in.apellido_materno,
        telefono=usuario_in.telefono,
        celular=usuario_in.celular,
        cedula_profesional=usuario_in.cedula_profesional,
        especialidad=usuario_in.especialidad,
        subespecialidad=usuario_in.subespecialidad,
        empresa_id=usuario_in.empresa_id,
        is_active=True,
    )

    db.add(usuario)
    await db.commit()
    await db.refresh(usuario)

    return usuario
