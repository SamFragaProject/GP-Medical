"""
CRM (Customer Relationship Management) endpoints
Gestión de campañas, mensajes y tareas de seguimiento
"""

from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.models.crm import (
    Campana, Mensaje, TareaCRM,
    TipoCampana, EstadoCampana, CanalMensaje, EstadoMensaje,
    EstadoTarea, PrioridadTarea
)
from app.models.patient import Paciente

router = APIRouter()

# ============================================================================
# SCHEMAS
# ============================================================================

# ========== CAMPAÑAS ==========

class CampanaBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    tipo: TipoCampana
    descripcion: Optional[str] = None
    estado: EstadoCampana = EstadoCampana.BORRADOR
    segmentacion: Optional[dict] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    programada: bool = False
    canal: CanalMensaje
    asunto: Optional[str] = None
    plantilla: Optional[str] = None
    variables: Optional[dict] = None


class CampanaCreate(CampanaBase):
    pass


class CampanaUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=255)
    tipo: Optional[TipoCampana] = None
    descripcion: Optional[str] = None
    estado: Optional[EstadoCampana] = None
    segmentacion: Optional[dict] = None
    fecha_inicio: Optional[datetime] = None
    fecha_fin: Optional[datetime] = None
    programada: Optional[bool] = None
    canal: Optional[CanalMensaje] = None
    asunto: Optional[str] = None
    plantilla: Optional[str] = None
    variables: Optional[dict] = None


class CampanaResponse(CampanaBase):
    id: int
    empresa_id: int
    creada_por_id: int
    total_destinatarios: int
    total_enviados: int
    total_entregados: int
    total_abiertos: int
    total_clicks: int
    fecha_creacion: datetime
    fecha_actualizacion: datetime

    class Config:
        from_attributes = True


class CampanaEstadisticas(BaseModel):
    total_campanas: int
    campanas_activas: int
    campanas_completadas: int
    total_mensajes_enviados: int
    tasa_entrega_promedio: float
    tasa_apertura_promedio: float


# ========== MENSAJES ==========

class MensajeBase(BaseModel):
    canal: CanalMensaje
    destinatario: str = Field(..., min_length=1, max_length=255)
    asunto: Optional[str] = None
    contenido: str
    fecha_programada: Optional[datetime] = None


class MensajeCreate(MensajeBase):
    campana_id: Optional[int] = None
    paciente_id: Optional[int] = None


class MensajeUpdate(BaseModel):
    estado: Optional[EstadoMensaje] = None
    fecha_programada: Optional[datetime] = None


class MensajeResponse(MensajeBase):
    id: int
    empresa_id: int
    campana_id: Optional[int]
    paciente_id: Optional[int]
    enviado_por_id: Optional[int]
    estado: EstadoMensaje
    fecha_envio: Optional[datetime]
    fecha_entrega: Optional[datetime]
    fecha_lectura: Optional[datetime]
    proveedor: Optional[str]
    proveedor_id: Optional[str]
    intentos: int
    error: Optional[str]
    abierto: bool
    clicks: int
    fecha_creacion: datetime

    class Config:
        from_attributes = True


class EnviarMensajeRequest(BaseModel):
    mensaje_id: int


# ========== TAREAS CRM ==========

class TareaCRMBase(BaseModel):
    titulo: str = Field(..., min_length=1, max_length=255)
    descripcion: Optional[str] = None
    tipo: str = Field(..., min_length=1, max_length=100)
    estado: EstadoTarea = EstadoTarea.PENDIENTE
    prioridad: PrioridadTarea = PrioridadTarea.MEDIA
    fecha_vencimiento: Optional[datetime] = None
    recordatorio: bool = False
    fecha_recordatorio: Optional[datetime] = None
    resultado: Optional[str] = None
    notas: Optional[str] = None


class TareaCRMCreate(TareaCRMBase):
    paciente_id: Optional[int] = None
    asignada_a_id: int


class TareaCRMUpdate(BaseModel):
    titulo: Optional[str] = Field(None, min_length=1, max_length=255)
    descripcion: Optional[str] = None
    tipo: Optional[str] = None
    estado: Optional[EstadoTarea] = None
    prioridad: Optional[PrioridadTarea] = None
    asignada_a_id: Optional[int] = None
    paciente_id: Optional[int] = None
    fecha_vencimiento: Optional[datetime] = None
    recordatorio: Optional[bool] = None
    fecha_recordatorio: Optional[datetime] = None
    resultado: Optional[str] = None
    notas: Optional[str] = None


class TareaCRMResponse(TareaCRMBase):
    id: int
    empresa_id: int
    paciente_id: Optional[int]
    asignada_a_id: int
    creada_por_id: int
    fecha_completada: Optional[datetime]
    fecha_creacion: datetime
    fecha_actualizacion: datetime

    class Config:
        from_attributes = True


class CompletarTareaRequest(BaseModel):
    resultado: Optional[str] = None
    notas: Optional[str] = None


# ============================================================================
# ENDPOINTS - CAMPAÑAS
# ============================================================================

@router.get("/campanas", response_model=List[CampanaResponse])
async def list_campanas(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    tipo: Optional[TipoCampana] = None,
    estado: Optional[EstadoCampana] = None,
    canal: Optional[CanalMensaje] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Lista todas las campañas con filtros opcionales
    """
    query = select(Campana).order_by(desc(Campana.fecha_creacion))

    # Filters
    filters = []
    # For production, add empresa_id filter
    # filters.append(Campana.empresa_id == current_user.empresa_id)

    if tipo:
        filters.append(Campana.tipo == tipo)
    if estado:
        filters.append(Campana.estado == estado)
    if canal:
        filters.append(Campana.canal == canal)

    if filters:
        query = query.where(and_(*filters))

    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    campanas = result.scalars().all()

    return campanas


@router.post("/campanas", response_model=CampanaResponse, status_code=status.HTTP_201_CREATED)
async def create_campana(
    campana_data: CampanaCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Crea una nueva campaña
    """
    # For production, get from current_user
    empresa_id = 1
    usuario_id = 1

    campana = Campana(
        empresa_id=empresa_id,
        creada_por_id=usuario_id,
        **campana_data.model_dump()
    )

    db.add(campana)
    await db.commit()
    await db.refresh(campana)

    return campana


@router.get("/campanas/{campana_id}", response_model=CampanaResponse)
async def get_campana(
    campana_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene una campaña por ID
    """
    result = await db.execute(
        select(Campana).where(Campana.id == campana_id)
    )
    campana = result.scalar_one_or_none()

    if not campana:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )

    return campana


@router.put("/campanas/{campana_id}", response_model=CampanaResponse)
async def update_campana(
    campana_id: int,
    campana_data: CampanaUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Actualiza una campaña
    """
    result = await db.execute(
        select(Campana).where(Campana.id == campana_id)
    )
    campana = result.scalar_one_or_none()

    if not campana:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )

    # Update fields
    update_data = campana_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(campana, field, value)

    await db.commit()
    await db.refresh(campana)

    return campana


@router.delete("/campanas/{campana_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_campana(
    campana_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Elimina una campaña (solo si está en borrador)
    """
    result = await db.execute(
        select(Campana).where(Campana.id == campana_id)
    )
    campana = result.scalar_one_or_none()

    if not campana:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )

    if campana.estado != EstadoCampana.BORRADOR:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden eliminar campañas en borrador"
        )

    await db.delete(campana)
    await db.commit()


@router.post("/campanas/{campana_id}/activar", response_model=CampanaResponse)
async def activar_campana(
    campana_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Activa una campaña (inicia el envío de mensajes)
    """
    result = await db.execute(
        select(Campana).where(Campana.id == campana_id)
    )
    campana = result.scalar_one_or_none()

    if not campana:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )

    if campana.estado == EstadoCampana.ACTIVA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La campaña ya está activa"
        )

    campana.estado = EstadoCampana.ACTIVA
    if not campana.fecha_inicio:
        campana.fecha_inicio = datetime.utcnow()

    await db.commit()
    await db.refresh(campana)

    # TODO: In production, trigger actual message sending
    # await enviar_mensajes_campana(campana_id, db)

    return campana


@router.post("/campanas/{campana_id}/pausar", response_model=CampanaResponse)
async def pausar_campana(
    campana_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Pausa una campaña activa
    """
    result = await db.execute(
        select(Campana).where(Campana.id == campana_id)
    )
    campana = result.scalar_one_or_none()

    if not campana:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Campaña no encontrada"
        )

    if campana.estado != EstadoCampana.ACTIVA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden pausar campañas activas"
        )

    campana.estado = EstadoCampana.PAUSADA

    await db.commit()
    await db.refresh(campana)

    return campana


@router.get("/campanas/estadisticas", response_model=CampanaEstadisticas)
async def get_estadisticas_campanas(
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene estadísticas generales de campañas
    """
    # For production, filter by empresa_id

    # Total campaigns
    total_result = await db.execute(select(func.count(Campana.id)))
    total_campanas = total_result.scalar_one()

    # Active campaigns
    activas_result = await db.execute(
        select(func.count(Campana.id)).where(Campana.estado == EstadoCampana.ACTIVA)
    )
    campanas_activas = activas_result.scalar_one()

    # Completed campaigns
    completadas_result = await db.execute(
        select(func.count(Campana.id)).where(Campana.estado == EstadoCampana.COMPLETADA)
    )
    campanas_completadas = completadas_result.scalar_one()

    # Total messages sent
    mensajes_result = await db.execute(
        select(func.count(Mensaje.id)).where(Mensaje.estado == EstadoMensaje.ENVIADO)
    )
    total_mensajes_enviados = mensajes_result.scalar_one()

    # Average delivery rate
    # This would be calculated from actual campaign data
    tasa_entrega_promedio = 0.95  # 95%
    tasa_apertura_promedio = 0.35  # 35%

    return CampanaEstadisticas(
        total_campanas=total_campanas,
        campanas_activas=campanas_activas,
        campanas_completadas=campanas_completadas,
        total_mensajes_enviados=total_mensajes_enviados,
        tasa_entrega_promedio=tasa_entrega_promedio,
        tasa_apertura_promedio=tasa_apertura_promedio,
    )


# ============================================================================
# ENDPOINTS - MENSAJES
# ============================================================================

@router.get("/mensajes", response_model=List[MensajeResponse])
async def list_mensajes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    campana_id: Optional[int] = None,
    canal: Optional[CanalMensaje] = None,
    estado: Optional[EstadoMensaje] = None,
    paciente_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Lista todos los mensajes con filtros opcionales
    """
    query = select(Mensaje).order_by(desc(Mensaje.fecha_creacion))

    # Filters
    filters = []

    if campana_id:
        filters.append(Mensaje.campana_id == campana_id)
    if canal:
        filters.append(Mensaje.canal == canal)
    if estado:
        filters.append(Mensaje.estado == estado)
    if paciente_id:
        filters.append(Mensaje.paciente_id == paciente_id)

    if filters:
        query = query.where(and_(*filters))

    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    mensajes = result.scalars().all()

    return mensajes


@router.post("/mensajes", response_model=MensajeResponse, status_code=status.HTTP_201_CREATED)
async def create_mensaje(
    mensaje_data: MensajeCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Crea un nuevo mensaje individual
    """
    # For production, get from current_user
    empresa_id = 1
    usuario_id = 1

    mensaje = Mensaje(
        empresa_id=empresa_id,
        enviado_por_id=usuario_id,
        **mensaje_data.model_dump()
    )

    db.add(mensaje)
    await db.commit()
    await db.refresh(mensaje)

    return mensaje


@router.get("/mensajes/{mensaje_id}", response_model=MensajeResponse)
async def get_mensaje(
    mensaje_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene un mensaje por ID
    """
    result = await db.execute(
        select(Mensaje).where(Mensaje.id == mensaje_id)
    )
    mensaje = result.scalar_one_or_none()

    if not mensaje:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mensaje no encontrado"
        )

    return mensaje


@router.put("/mensajes/{mensaje_id}", response_model=MensajeResponse)
async def update_mensaje(
    mensaje_id: int,
    mensaje_data: MensajeUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Actualiza un mensaje (solo estado o fecha programada)
    """
    result = await db.execute(
        select(Mensaje).where(Mensaje.id == mensaje_id)
    )
    mensaje = result.scalar_one_or_none()

    if not mensaje:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mensaje no encontrado"
        )

    # Update fields
    update_data = mensaje_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(mensaje, field, value)

    await db.commit()
    await db.refresh(mensaje)

    return mensaje


@router.post("/mensajes/{mensaje_id}/enviar", response_model=MensajeResponse)
async def enviar_mensaje(
    mensaje_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Envía un mensaje (simula el envío)

    En producción, esto integraría con proveedores reales:
    - Email: SendGrid, AWS SES, Mailgun
    - SMS: Twilio, Nexmo
    - WhatsApp: Twilio WhatsApp API
    """
    result = await db.execute(
        select(Mensaje).where(Mensaje.id == mensaje_id)
    )
    mensaje = result.scalar_one_or_none()

    if not mensaje:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mensaje no encontrado"
        )

    if mensaje.estado == EstadoMensaje.ENVIADO:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El mensaje ya fue enviado"
        )

    # Simulate sending
    mensaje.estado = EstadoMensaje.ENVIADO
    mensaje.fecha_envio = datetime.utcnow()
    mensaje.intentos += 1
    mensaje.proveedor = "simulado"
    mensaje.proveedor_id = f"sim_{mensaje.id}_{datetime.utcnow().timestamp()}"

    # In production, call actual API:
    # if mensaje.canal == CanalMensaje.EMAIL:
    #     await enviar_email(mensaje.destinatario, mensaje.asunto, mensaje.contenido)
    # elif mensaje.canal == CanalMensaje.SMS:
    #     await enviar_sms(mensaje.destinatario, mensaje.contenido)
    # elif mensaje.canal == CanalMensaje.WHATSAPP:
    #     await enviar_whatsapp(mensaje.destinatario, mensaje.contenido)

    await db.commit()
    await db.refresh(mensaje)

    return mensaje


@router.delete("/mensajes/{mensaje_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_mensaje(
    mensaje_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Elimina un mensaje (solo si está pendiente)
    """
    result = await db.execute(
        select(Mensaje).where(Mensaje.id == mensaje_id)
    )
    mensaje = result.scalar_one_or_none()

    if not mensaje:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mensaje no encontrado"
        )

    if mensaje.estado not in [EstadoMensaje.PENDIENTE, EstadoMensaje.FALLIDO]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Solo se pueden eliminar mensajes pendientes o fallidos"
        )

    await db.delete(mensaje)
    await db.commit()


# ============================================================================
# ENDPOINTS - TAREAS CRM
# ============================================================================

@router.get("/tareas", response_model=List[TareaCRMResponse])
async def list_tareas(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    asignada_a_id: Optional[int] = None,
    paciente_id: Optional[int] = None,
    estado: Optional[EstadoTarea] = None,
    prioridad: Optional[PrioridadTarea] = None,
    tipo: Optional[str] = None,
    vencidas: bool = False,
    db: AsyncSession = Depends(get_db)
):
    """
    Lista todas las tareas CRM con filtros opcionales
    """
    query = select(TareaCRM).order_by(desc(TareaCRM.fecha_vencimiento))

    # Filters
    filters = []

    if asignada_a_id:
        filters.append(TareaCRM.asignada_a_id == asignada_a_id)
    if paciente_id:
        filters.append(TareaCRM.paciente_id == paciente_id)
    if estado:
        filters.append(TareaCRM.estado == estado)
    if prioridad:
        filters.append(TareaCRM.prioridad == prioridad)
    if tipo:
        filters.append(TareaCRM.tipo == tipo)
    if vencidas:
        filters.append(and_(
            TareaCRM.fecha_vencimiento < datetime.utcnow(),
            TareaCRM.estado != EstadoTarea.COMPLETADA
        ))

    if filters:
        query = query.where(and_(*filters))

    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    tareas = result.scalars().all()

    return tareas


@router.post("/tareas", response_model=TareaCRMResponse, status_code=status.HTTP_201_CREATED)
async def create_tarea(
    tarea_data: TareaCRMCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Crea una nueva tarea CRM
    """
    # For production, get from current_user
    empresa_id = 1
    usuario_id = 1

    tarea = TareaCRM(
        empresa_id=empresa_id,
        creada_por_id=usuario_id,
        **tarea_data.model_dump()
    )

    db.add(tarea)
    await db.commit()
    await db.refresh(tarea)

    return tarea


@router.get("/tareas/{tarea_id}", response_model=TareaCRMResponse)
async def get_tarea(
    tarea_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene una tarea por ID
    """
    result = await db.execute(
        select(TareaCRM).where(TareaCRM.id == tarea_id)
    )
    tarea = result.scalar_one_or_none()

    if not tarea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarea no encontrada"
        )

    return tarea


@router.put("/tareas/{tarea_id}", response_model=TareaCRMResponse)
async def update_tarea(
    tarea_id: int,
    tarea_data: TareaCRMUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Actualiza una tarea
    """
    result = await db.execute(
        select(TareaCRM).where(TareaCRM.id == tarea_id)
    )
    tarea = result.scalar_one_or_none()

    if not tarea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarea no encontrada"
        )

    # Update fields
    update_data = tarea_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tarea, field, value)

    await db.commit()
    await db.refresh(tarea)

    return tarea


@router.post("/tareas/{tarea_id}/completar", response_model=TareaCRMResponse)
async def completar_tarea(
    tarea_id: int,
    request_data: CompletarTareaRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Marca una tarea como completada
    """
    result = await db.execute(
        select(TareaCRM).where(TareaCRM.id == tarea_id)
    )
    tarea = result.scalar_one_or_none()

    if not tarea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarea no encontrada"
        )

    if tarea.estado == EstadoTarea.COMPLETADA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La tarea ya está completada"
        )

    tarea.estado = EstadoTarea.COMPLETADA
    tarea.fecha_completada = datetime.utcnow()
    if request_data.resultado:
        tarea.resultado = request_data.resultado
    if request_data.notas:
        tarea.notas = request_data.notas

    await db.commit()
    await db.refresh(tarea)

    return tarea


@router.delete("/tareas/{tarea_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tarea(
    tarea_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Elimina una tarea
    """
    result = await db.execute(
        select(TareaCRM).where(TareaCRM.id == tarea_id)
    )
    tarea = result.scalar_one_or_none()

    if not tarea:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarea no encontrada"
        )

    await db.delete(tarea)
    await db.commit()


@router.get("/tareas/mis-tareas", response_model=List[TareaCRMResponse])
async def get_mis_tareas(
    estado: Optional[EstadoTarea] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene las tareas asignadas al usuario actual
    """
    # For production, get from current_user
    usuario_id = 1

    query = select(TareaCRM).where(
        TareaCRM.asignada_a_id == usuario_id
    ).order_by(desc(TareaCRM.prioridad), TareaCRM.fecha_vencimiento)

    if estado:
        query = query.where(TareaCRM.estado == estado)

    result = await db.execute(query)
    tareas = result.scalars().all()

    return tareas
