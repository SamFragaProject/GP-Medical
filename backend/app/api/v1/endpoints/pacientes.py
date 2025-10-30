"""
Pacientes endpoints - Complete implementation
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func

from app.core.database import get_db
from app.api.deps import get_current_user, get_tenant_id
from app.models.user import Usuario
from app.models.patient import Paciente
from app.schemas.patient import (
    Paciente as PacienteSchema,
    PacienteCreate,
    PacienteUpdate,
)

router = APIRouter()


@router.get("/", response_model=List[PacienteSchema])
async def list_pacientes(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    activo: bool = True,
    empresa_id: int = Depends(get_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """List all pacientes with optional filters"""
    query = select(Paciente).where(Paciente.empresa_id == empresa_id)

    if activo is not None:
        query = query.where(Paciente.activo == activo)

    if search:
        query = query.where(
            or_(
                Paciente.nombre.ilike(f"%{search}%"),
                Paciente.apellido_paterno.ilike(f"%{search}%"),
                Paciente.email.ilike(f"%{search}%"),
                Paciente.numero_expediente.ilike(f"%{search}%"),
            )
        )

    query = query.order_by(Paciente.created_at.desc())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    pacientes = result.scalars().all()

    return pacientes


@router.post("/", response_model=PacienteSchema, status_code=status.HTTP_201_CREATED)
async def create_paciente(
    paciente_in: PacienteCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Create new paciente"""
    # Generate numero_expediente
    result = await db.execute(
        select(func.max(Paciente.numero_expediente))
        .where(Paciente.empresa_id == paciente_in.empresa_id)
    )
    last_exp = result.scalar()

    if last_exp:
        last_num = int(last_exp.split('-')[1])
        new_num = last_num + 1
    else:
        new_num = 1

    numero_expediente = f"EXP-{new_num:06d}"

    # Create paciente
    paciente = Paciente(
        **paciente_in.model_dump(),
        numero_expediente=numero_expediente,
        activo=True,
    )

    db.add(paciente)
    await db.commit()
    await db.refresh(paciente)

    return paciente
