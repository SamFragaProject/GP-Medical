"""
Recetas Endpoints con Integración de IA
"""

from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
import qrcode
import io
import base64
import uuid

from app.db.session import get_db
from app.models.prescription import Receta, DetalleReceta, EstadoReceta
from app.core.deps import get_current_user
from app.services.ai_service import ai_service

router = APIRouter()


# ============================================================================
# SCHEMAS
# ============================================================================

class DetalleRecetaCreate(BaseModel):
    medicamento: str
    presentacion: Optional[str] = None
    concentracion: Optional[str] = None
    dosis: str
    via_administracion: Optional[str] = "oral"
    frecuencia: str
    duracion: Optional[str] = None
    indicaciones: str
    cantidad: float
    producto_id: Optional[int] = None


class DetalleRecetaResponse(BaseModel):
    id: int
    medicamento: str
    presentacion: Optional[str]
    concentracion: Optional[str]
    dosis: str
    via_administracion: Optional[str]
    frecuencia: str
    duracion: Optional[str]
    indicaciones: str
    cantidad: float
    cantidad_dispensada: float
    dispensada: bool

    class Config:
        from_attributes = True


class RecetaCreate(BaseModel):
    paciente_id: int
    encuentro_id: Optional[int] = None
    diagnostico: Optional[str] = None
    indicaciones_generales: Optional[str] = None
    fecha_vigencia: Optional[date] = None
    detalles: List[DetalleRecetaCreate] = []


class RecetaUpdate(BaseModel):
    diagnostico: Optional[str] = None
    indicaciones_generales: Optional[str] = None
    fecha_vigencia: Optional[date] = None
    estado: Optional[EstadoReceta] = None


class RecetaResponse(BaseModel):
    id: int
    empresa_id: int
    paciente_id: int
    encuentro_id: Optional[int]
    medico_id: int
    folio: str
    codigo_qr: Optional[str]
    estado: EstadoReceta
    fecha_emision: date
    fecha_vigencia: Optional[date]
    diagnostico: Optional[str]
    indicaciones_generales: Optional[str]
    firmada: bool
    fecha_firma: Optional[datetime]
    pdf_url: Optional[str]
    detalles: List[DetalleRecetaResponse] = []
    paciente: Optional[dict] = None
    medico: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AIAssistRequest(BaseModel):
    """Request para asistencia de IA en recetas"""
    medicamento: str
    diagnostico: Optional[str] = None
    edad_paciente: Optional[int] = None
    peso_paciente: Optional[float] = None


class AICompletePrescriptionRequest(BaseModel):
    """Request para generar receta completa con IA"""
    diagnostico: str
    sintomas: str
    edad_paciente: int
    peso_paciente: Optional[float] = None
    alergias: Optional[str] = None


# ============================================================================
# RECETAS CRUD
# ============================================================================

@router.get("/", response_model=List[RecetaResponse])
async def list_recetas(
    skip: int = 0,
    limit: int = 100,
    paciente_id: Optional[int] = None,
    medico_id: Optional[int] = None,
    estado: Optional[str] = None,
    fecha_desde: Optional[str] = None,
    fecha_hasta: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Lista recetas con filtros"""
    query = select(Receta).options(
        selectinload(Receta.detalles),
        selectinload(Receta.paciente),
        selectinload(Receta.medico)
    )

    # Filtros
    conditions = []

    if paciente_id:
        conditions.append(Receta.paciente_id == paciente_id)

    if medico_id:
        conditions.append(Receta.medico_id == medico_id)

    if estado:
        conditions.append(Receta.estado == estado)

    if fecha_desde:
        conditions.append(Receta.fecha_emision >= fecha_desde)

    if fecha_hasta:
        conditions.append(Receta.fecha_emision <= fecha_hasta)

    if conditions:
        query = query.where(and_(*conditions))

    query = query.offset(skip).limit(limit).order_by(Receta.created_at.desc())

    result = await db.execute(query)
    recetas = result.scalars().all()

    return recetas


@router.get("/{receta_id}", response_model=RecetaResponse)
async def get_receta(
    receta_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Obtiene una receta por ID"""
    query = select(Receta).options(
        selectinload(Receta.detalles),
        selectinload(Receta.paciente),
        selectinload(Receta.medico)
    ).where(Receta.id == receta_id)

    result = await db.execute(query)
    receta = result.scalar_one_or_none()

    if not receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    return receta


@router.post("/", response_model=RecetaResponse)
async def create_receta(
    receta_data: RecetaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Crea una nueva receta médica
    """
    try:
        # Generar folio único
        folio = f"RX-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

        # Crear receta
        nueva_receta = Receta(
            empresa_id=current_user.get("empresa_id", 1),
            paciente_id=receta_data.paciente_id,
            encuentro_id=receta_data.encuentro_id,
            medico_id=current_user["id"],
            folio=folio,
            fecha_emision=date.today(),
            fecha_vigencia=receta_data.fecha_vigencia,
            diagnostico=receta_data.diagnostico,
            indicaciones_generales=receta_data.indicaciones_generales,
            estado=EstadoReceta.ACTIVA
        )

        db.add(nueva_receta)
        await db.flush()

        # Crear detalles
        for detalle_data in receta_data.detalles:
            detalle = DetalleReceta(
                receta_id=nueva_receta.id,
                **detalle_data.model_dump()
            )
            db.add(detalle)

        # Generar QR code
        qr_data = f"RX:{folio}:PACIENTE:{receta_data.paciente_id}"
        qr = qrcode.QRCode(version=1, box_size=10, border=5)
        qr.add_data(qr_data)
        qr.make(fit=True)

        # Convertir QR a base64
        img = qr.make_image(fill_color="black", back_color="white")
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()

        nueva_receta.codigo_qr = f"data:image/png;base64,{qr_base64}"

        await db.commit()
        await db.refresh(nueva_receta)

        # Reload with relationships
        query = select(Receta).options(
            selectinload(Receta.detalles),
            selectinload(Receta.paciente),
            selectinload(Receta.medico)
        ).where(Receta.id == nueva_receta.id)

        result = await db.execute(query)
        receta_completa = result.scalar_one()

        return receta_completa

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creando receta: {str(e)}")


@router.put("/{receta_id}", response_model=RecetaResponse)
async def update_receta(
    receta_id: int,
    receta_data: RecetaUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Actualiza una receta"""
    query = select(Receta).where(Receta.id == receta_id)
    result = await db.execute(query)
    receta = result.scalar_one_or_none()

    if not receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    # No permitir edición si está firmada
    if receta.firmada:
        raise HTTPException(status_code=400, detail="No se puede editar una receta firmada")

    # Actualizar campos
    for key, value in receta_data.model_dump(exclude_unset=True).items():
        setattr(receta, key, value)

    await db.commit()
    await db.refresh(receta)

    # Reload with relationships
    query = select(Receta).options(
        selectinload(Receta.detalles),
        selectinload(Receta.paciente),
        selectinload(Receta.medico)
    ).where(Receta.id == receta_id)

    result = await db.execute(query)
    receta_completa = result.scalar_one()

    return receta_completa


@router.post("/{receta_id}/firmar")
async def firmar_receta(
    receta_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Firma digitalmente una receta"""
    query = select(Receta).where(Receta.id == receta_id)
    result = await db.execute(query)
    receta = result.scalar_one_or_none()

    if not receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    if receta.firmada:
        raise HTTPException(status_code=400, detail="Receta ya firmada")

    receta.firmada = True
    receta.fecha_firma = datetime.utcnow()

    await db.commit()

    return {"message": "Receta firmada exitosamente"}


@router.delete("/{receta_id}")
async def delete_receta(
    receta_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Cancela una receta"""
    query = select(Receta).where(Receta.id == receta_id)
    result = await db.execute(query)
    receta = result.scalar_one_or_none()

    if not receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    # Cambiar estado a cancelada en lugar de eliminar
    receta.estado = EstadoReceta.CANCELADA

    await db.commit()

    return {"message": "Receta cancelada"}


# ============================================================================
# DETALLES DE RECETA
# ============================================================================

@router.post("/{receta_id}/detalles")
async def add_detalle_receta(
    receta_id: int,
    detalle_data: DetalleRecetaCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Agrega un medicamento a una receta existente"""
    # Verificar que la receta existe
    query = select(Receta).where(Receta.id == receta_id)
    result = await db.execute(query)
    receta = result.scalar_one_or_none()

    if not receta:
        raise HTTPException(status_code=404, detail="Receta no encontrada")

    if receta.firmada:
        raise HTTPException(status_code=400, detail="No se pueden agregar medicamentos a una receta firmada")

    # Crear detalle
    detalle = DetalleReceta(
        receta_id=receta_id,
        **detalle_data.model_dump()
    )

    db.add(detalle)
    await db.commit()
    await db.refresh(detalle)

    return detalle


@router.delete("/detalles/{detalle_id}")
async def delete_detalle_receta(
    detalle_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Elimina un medicamento de una receta"""
    query = select(DetalleReceta).where(DetalleReceta.id == detalle_id)
    result = await db.execute(query)
    detalle = result.scalar_one_or_none()

    if not detalle:
        raise HTTPException(status_code=404, detail="Detalle no encontrado")

    # Verificar que la receta no está firmada
    query = select(Receta).where(Receta.id == detalle.receta_id)
    result = await db.execute(query)
    receta = result.scalar_one()

    if receta.firmada:
        raise HTTPException(status_code=400, detail="No se pueden eliminar medicamentos de una receta firmada")

    await db.delete(detalle)
    await db.commit()

    return {"message": "Medicamento eliminado de la receta"}


# ============================================================================
# ASISTENCIA CON IA
# ============================================================================

@router.post("/ai/suggest-dosage")
async def ai_suggest_dosage(
    request: AIAssistRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Asistente IA: Sugiere dosis, frecuencia y duración para un medicamento
    """
    try:
        suggestion = await ai_service.suggest_prescription(
            medicamento=request.medicamento,
            diagnostico=request.diagnostico,
            edad_paciente=request.edad_paciente,
            peso_paciente=request.peso_paciente
        )

        return suggestion

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error en sugerencia de IA: {str(e)}")


@router.post("/ai/generate-complete")
async def ai_generate_complete_prescription(
    request: AICompletePrescriptionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Asistente IA: Genera una receta completa basada en diagnóstico y síntomas
    """
    try:
        prescription = await ai_service.generate_complete_prescription(
            diagnostico=request.diagnostico,
            sintomas=request.sintomas,
            edad_paciente=request.edad_paciente,
            peso_paciente=request.peso_paciente,
            alergias=request.alergias
        )

        return prescription

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generando receta con IA: {str(e)}")


@router.get("/paciente/{paciente_id}/historial")
async def get_historial_recetas(
    paciente_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Obtiene historial de recetas de un paciente"""
    query = select(Receta).options(
        selectinload(Receta.detalles),
        selectinload(Receta.medico)
    ).where(Receta.paciente_id == paciente_id).order_by(Receta.fecha_emision.desc())

    result = await db.execute(query)
    recetas = result.scalars().all()

    return recetas
