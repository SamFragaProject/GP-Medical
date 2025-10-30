"""
Citas endpoints - Complete implementation
"""

from typing import List
from datetime import datetime, date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload

from app.core.database import get_db
from app.api.deps import get_current_user, get_tenant_id
from app.models.user import Usuario
from app.models.appointment import Cita
from app.models.patient import Paciente
from app.schemas.appointment import (
    Cita as CitaSchema,
    CitaCreate,
    CitaUpdate,
)

router = APIRouter()


@router.get("/", response_model=List[CitaSchema])
async def list_citas(
    skip: int = 0,
    limit: int = 100,
    fecha: date = None,
    medico_id: int = None,
    paciente_id: int = None,
    estado: str = None,
    empresa_id: int = Depends(get_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """List all citas with optional filters"""
    query = select(Cita).where(Cita.empresa_id == empresa_id)

    if fecha:
        # Filter by date
        start = datetime.combine(fecha, datetime.min.time())
        end = datetime.combine(fecha, datetime.max.time())
        query = query.where(
            and_(
                Cita.fecha_hora_inicio >= start,
                Cita.fecha_hora_inicio <= end
            )
        )

    if medico_id:
        query = query.where(Cita.medico_id == medico_id)

    if paciente_id:
        query = query.where(Cita.paciente_id == paciente_id)

    if estado:
        query = query.where(Cita.estado == estado)

    query = query.order_by(Cita.fecha_hora_inicio)
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    citas = result.scalars().all()

    return citas


@router.get("/today", response_model=List[CitaSchema])
async def get_citas_today(
    medico_id: int = None,
    empresa_id: int = Depends(get_tenant_id),
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Get today's appointments"""
    today = date.today()
    start = datetime.combine(today, datetime.min.time())
    end = datetime.combine(today, datetime.max.time())

    query = select(Cita).where(
        and_(
            Cita.empresa_id == empresa_id,
            Cita.fecha_hora_inicio >= start,
            Cita.fecha_hora_inicio <= end
        )
    )

    if medico_id:
        query = query.where(Cita.medico_id == medico_id)

    query = query.order_by(Cita.fecha_hora_inicio)

    result = await db.execute(query)
    citas = result.scalars().all()

    return citas


@router.post("/", response_model=CitaSchema, status_code=status.HTTP_201_CREATED)
async def create_cita(
    cita_in: CitaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Create new cita"""
    # Create cita
    cita = Cita(
        **cita_in.model_dump(),
        estado="NUEVA",
        confirmada_por_paciente=False,
        recordatorio_enviado=False,
    )

    db.add(cita)
    await db.commit()
    await db.refresh(cita)

    return cita


@router.put("/{cita_id}", response_model=CitaSchema)
async def update_cita(
    cita_id: int,
    cita_in: CitaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Usuario = Depends(get_current_user),
):
    """Update cita"""
    result = await db.execute(
        select(Cita).where(Cita.id == cita_id)
    )
    cita = result.scalar_one_or_none()

    if not cita:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cita not found"
        )

    # Update fields
    update_data = cita_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(cita, field, value)

    await db.commit()
    await db.refresh(cita)

    return cita
