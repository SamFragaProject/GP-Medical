"""
Órdenes de Estudios Endpoints
Laboratorio, Imagenología y Gabinete para Medicina del Trabajo
"""

from typing import List, Optional
from datetime import date, datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from pydantic import BaseModel
import uuid

from app.db.session import get_db
from app.models.prescription import OrdenEstudio, ResultadoEstudio, EstadoOrden
from app.core.deps import get_current_user

router = APIRouter()


# ============================================================================
# CATÁLOGO DE ESTUDIOS PARA MEDICINA DEL TRABAJO
# ============================================================================

CATALOGO_ESTUDIOS = {
    "laboratorio": {
        "nombre": "Estudios de Laboratorio",
        "categorias": {
            "quimica_sanguinea": {
                "nombre": "Química Sanguínea",
                "estudios": [
                    {"id": "glucosa", "nombre": "Glucosa"},
                    {"id": "creatinina", "nombre": "Creatinina"},
                    {"id": "urea", "nombre": "Urea"},
                    {"id": "acido_urico", "nombre": "Ácido Úrico"},
                    {"id": "colesterol_total", "nombre": "Colesterol Total"},
                    {"id": "colesterol_hdl", "nombre": "Colesterol HDL"},
                    {"id": "colesterol_ldl", "nombre": "Colesterol LDL"},
                    {"id": "trigliceridos", "nombre": "Triglicéridos"},
                    {"id": "perfil_lipidico", "nombre": "Perfil Lipídico Completo"},
                ],
            },
            "hematologia": {
                "nombre": "Hematología",
                "estudios": [
                    {"id": "biometria_hematica", "nombre": "Biometría Hemática Completa"},
                    {"id": "hemoglobina", "nombre": "Hemoglobina"},
                    {"id": "hematocrito", "nombre": "Hematocrito"},
                    {"id": "leucocitos", "nombre": "Leucocitos"},
                    {"id": "plaquetas", "nombre": "Plaquetas"},
                    {"id": "tiempos_coagulacion", "nombre": "Tiempos de Coagulación"},
                ],
            },
            "hepatico": {
                "nombre": "Perfil Hepático",
                "estudios": [
                    {"id": "tgo", "nombre": "TGO (AST)"},
                    {"id": "tgp", "nombre": "TGP (ALT)"},
                    {"id": "bilirrubinas", "nombre": "Bilirrubinas"},
                    {"id": "fosfatasa_alcalina", "nombre": "Fosfatasa Alcalina"},
                    {"id": "ggt", "nombre": "Gamma GT"},
                ],
            },
            "orina": {
                "nombre": "Examen General de Orina",
                "estudios": [
                    {"id": "examen_general_orina", "nombre": "Examen General de Orina"},
                    {"id": "urocultivo", "nombre": "Urocultivo"},
                ],
            },
            "toxicologicos": {
                "nombre": "Estudios Toxicológicos",
                "estudios": [
                    {"id": "antidoping", "nombre": "Antidoping Básico"},
                    {"id": "antidoping_ampliado", "nombre": "Antidoping Ampliado"},
                    {"id": "plomo_sangre", "nombre": "Plomo en Sangre"},
                    {"id": "mercurio", "nombre": "Mercurio"},
                ],
            },
        },
    },
    "imagen": {
        "nombre": "Estudios de Imagen",
        "categorias": {
            "rayos_x": {
                "nombre": "Rayos X",
                "estudios": [
                    {"id": "rx_torax_pa", "nombre": "Rx Tórax PA"},
                    {"id": "rx_torax_lateral", "nombre": "Rx Tórax Lateral"},
                    {"id": "rx_columna_lumbar", "nombre": "Rx Columna Lumbar"},
                    {"id": "rx_columna_cervical", "nombre": "Rx Columna Cervical"},
                    {"id": "rx_rodillas", "nombre": "Rx Rodillas"},
                    {"id": "rx_manos", "nombre": "Rx Manos"},
                ],
            },
            "ultrasonido": {
                "nombre": "Ultrasonido",
                "estudios": [
                    {"id": "us_abdominal", "nombre": "Ultrasonido Abdominal"},
                    {"id": "us_hepatico", "nombre": "Ultrasonido Hepático"},
                    {"id": "us_renal", "nombre": "Ultrasonido Renal"},
                ],
            },
            "tomografia": {
                "nombre": "Tomografía",
                "estudios": [
                    {"id": "tac_torax", "nombre": "TAC Tórax"},
                    {"id": "tac_abdomen", "nombre": "TAC Abdomen"},
                ],
            },
        },
    },
    "gabinete": {
        "nombre": "Estudios de Gabinete",
        "categorias": {
            "audiometria": {
                "nombre": "Audiometría",
                "estudios": [
                    {"id": "audiometria_tonal", "nombre": "Audiometría Tonal"},
                    {"id": "audiometria_verbal", "nombre": "Audiometría Verbal"},
                ],
            },
            "espirometria": {
                "nombre": "Espirometría",
                "estudios": [
                    {"id": "espirometria_simple", "nombre": "Espirometría Simple"},
                    {"id": "espirometria_broncodilatador", "nombre": "Espirometría con Broncodilatador"},
                ],
            },
            "cardiologia": {
                "nombre": "Cardiología",
                "estudios": [
                    {"id": "electrocardiograma", "nombre": "Electrocardiograma (ECG)"},
                    {"id": "prueba_esfuerzo", "nombre": "Prueba de Esfuerzo"},
                    {"id": "holter", "nombre": "Holter 24 horas"},
                ],
            },
            "oftalmologia": {
                "nombre": "Oftalmología",
                "estudios": [
                    {"id": "agudeza_visual", "nombre": "Agudeza Visual"},
                    {"id": "campimetria", "nombre": "Campimetría"},
                    {"id": "vision_colores", "nombre": "Visión de Colores (Ishihara)"},
                ],
            },
            "psicometria": {
                "nombre": "Psicometría",
                "estudios": [
                    {"id": "eval_psicologica_basica", "nombre": "Evaluación Psicológica Básica"},
                    {"id": "eval_psicologica_completa", "nombre": "Evaluación Psicológica Completa"},
                ],
            },
        },
    },
}


# ============================================================================
# SCHEMAS
# ============================================================================

class EstudioItem(BaseModel):
    id: str
    nombre: str


class OrdenEstudioCreate(BaseModel):
    paciente_id: int
    encuentro_id: Optional[int] = None
    tipo: str  # laboratorio, imagen, gabinete
    categoria: str
    estudios: List[dict]  # Lista de estudios solicitados
    indicaciones_clinicas: Optional[str] = None
    preparacion: Optional[str] = None
    fecha_programada: Optional[str] = None
    urgente: bool = False


class OrdenEstudioUpdate(BaseModel):
    estado: Optional[EstadoOrden] = None
    fecha_programada: Optional[str] = None
    fecha_realizacion: Optional[str] = None
    urgente: Optional[bool] = None


class OrdenEstudioResponse(BaseModel):
    id: int
    empresa_id: int
    paciente_id: int
    encuentro_id: Optional[int]
    medico_solicitante_id: int
    folio: str
    tipo: str
    categoria: str
    estudios: List[dict]
    indicaciones_clinicas: Optional[str]
    preparacion: Optional[str]
    estado: EstadoOrden
    fecha_solicitud: date
    fecha_programada: Optional[datetime]
    fecha_realizacion: Optional[datetime]
    urgente: bool
    pdf_url: Optional[str]
    paciente: Optional[dict] = None
    medico_solicitante: Optional[dict] = None
    resultados: List[dict] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ResultadoEstudioCreate(BaseModel):
    nombre_estudio: str
    interpretacion: Optional[str] = None
    observaciones: Optional[str] = None
    datos: Optional[dict] = None  # Datos estructurados para lab
    fecha_resultado: date


class ResultadoEstudioResponse(BaseModel):
    id: int
    orden_id: int
    cargado_por_id: int
    nombre_estudio: str
    interpretacion: Optional[str]
    observaciones: Optional[str]
    archivo_url: Optional[str]
    archivo_nombre: Optional[str]
    archivo_tipo: Optional[str]
    datos: Optional[dict]
    fecha_resultado: date
    fecha_carga: datetime
    notificado_medico: bool
    notificado_paciente: bool
    fecha_notificacion: Optional[datetime]
    validado_por_id: Optional[int]
    fecha_validacion: Optional[datetime]

    class Config:
        from_attributes = True


# ============================================================================
# CATÁLOGO
# ============================================================================

@router.get("/catalogo")
async def get_catalogo_estudios():
    """
    Obtiene el catálogo completo de estudios disponibles
    Organizado por tipo (laboratorio, imagen, gabinete) y categorías
    """
    return CATALOGO_ESTUDIOS


@router.get("/catalogo/{tipo}")
async def get_catalogo_por_tipo(tipo: str):
    """
    Obtiene el catálogo de estudios de un tipo específico
    """
    if tipo not in CATALOGO_ESTUDIOS:
        raise HTTPException(status_code=404, detail=f"Tipo de estudio '{tipo}' no encontrado")

    return CATALOGO_ESTUDIOS[tipo]


@router.get("/catalogo/{tipo}/{categoria}")
async def get_estudios_por_categoria(tipo: str, categoria: str):
    """
    Obtiene los estudios de una categoría específica
    """
    if tipo not in CATALOGO_ESTUDIOS:
        raise HTTPException(status_code=404, detail=f"Tipo '{tipo}' no encontrado")

    if categoria not in CATALOGO_ESTUDIOS[tipo]["categorias"]:
        raise HTTPException(status_code=404, detail=f"Categoría '{categoria}' no encontrada")

    return CATALOGO_ESTUDIOS[tipo]["categorias"][categoria]


# ============================================================================
# ÓRDENES DE ESTUDIOS CRUD
# ============================================================================

@router.get("/", response_model=List[OrdenEstudioResponse])
async def list_ordenes(
    skip: int = 0,
    limit: int = 100,
    paciente_id: Optional[int] = None,
    medico_id: Optional[int] = None,
    tipo: Optional[str] = None,
    estado: Optional[str] = None,
    urgente: Optional[bool] = None,
    fecha_desde: Optional[str] = None,
    fecha_hasta: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Lista órdenes de estudios con filtros"""
    query = select(OrdenEstudio).options(
        selectinload(OrdenEstudio.paciente),
        selectinload(OrdenEstudio.medico_solicitante),
        selectinload(OrdenEstudio.resultados)
    )

    # Filtros
    conditions = []

    if paciente_id:
        conditions.append(OrdenEstudio.paciente_id == paciente_id)

    if medico_id:
        conditions.append(OrdenEstudio.medico_solicitante_id == medico_id)

    if tipo:
        conditions.append(OrdenEstudio.tipo == tipo)

    if estado:
        conditions.append(OrdenEstudio.estado == estado)

    if urgente is not None:
        conditions.append(OrdenEstudio.urgente == urgente)

    if fecha_desde:
        conditions.append(OrdenEstudio.fecha_solicitud >= fecha_desde)

    if fecha_hasta:
        conditions.append(OrdenEstudio.fecha_solicitud <= fecha_hasta)

    if conditions:
        query = query.where(and_(*conditions))

    query = query.offset(skip).limit(limit).order_by(OrdenEstudio.created_at.desc())

    result = await db.execute(query)
    ordenes = result.scalars().all()

    return ordenes


@router.get("/{orden_id}", response_model=OrdenEstudioResponse)
async def get_orden(
    orden_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Obtiene una orden de estudio por ID"""
    query = select(OrdenEstudio).options(
        selectinload(OrdenEstudio.paciente),
        selectinload(OrdenEstudio.medico_solicitante),
        selectinload(OrdenEstudio.resultados)
    ).where(OrdenEstudio.id == orden_id)

    result = await db.execute(query)
    orden = result.scalar_one_or_none()

    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    return orden


@router.post("/", response_model=OrdenEstudioResponse)
async def create_orden(
    orden_data: OrdenEstudioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Crea una nueva orden de estudios
    """
    try:
        # Generar folio único
        tipo_prefix = {
            "laboratorio": "LAB",
            "imagen": "IMG",
            "gabinete": "GAB",
        }.get(orden_data.tipo, "EST")

        folio = f"{tipo_prefix}-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"

        # Crear orden
        nueva_orden = OrdenEstudio(
            empresa_id=current_user.get("empresa_id", 1),
            paciente_id=orden_data.paciente_id,
            encuentro_id=orden_data.encuentro_id,
            medico_solicitante_id=current_user["id"],
            folio=folio,
            tipo=orden_data.tipo,
            categoria=orden_data.categoria,
            estudios=orden_data.estudios,
            indicaciones_clinicas=orden_data.indicaciones_clinicas,
            preparacion=orden_data.preparacion,
            fecha_solicitud=date.today(),
            fecha_programada=orden_data.fecha_programada,
            urgente=orden_data.urgente,
            estado=EstadoOrden.PENDIENTE
        )

        db.add(nueva_orden)
        await db.commit()
        await db.refresh(nueva_orden)

        # Reload with relationships
        query = select(OrdenEstudio).options(
            selectinload(OrdenEstudio.paciente),
            selectinload(OrdenEstudio.medico_solicitante),
            selectinload(OrdenEstudio.resultados)
        ).where(OrdenEstudio.id == nueva_orden.id)

        result = await db.execute(query)
        orden_completa = result.scalar_one()

        return orden_completa

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creando orden: {str(e)}")


@router.put("/{orden_id}", response_model=OrdenEstudioResponse)
async def update_orden(
    orden_id: int,
    orden_data: OrdenEstudioUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Actualiza una orden de estudios"""
    query = select(OrdenEstudio).where(OrdenEstudio.id == orden_id)
    result = await db.execute(query)
    orden = result.scalar_one_or_none()

    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    # Actualizar campos
    for key, value in orden_data.model_dump(exclude_unset=True).items():
        setattr(orden, key, value)

    await db.commit()
    await db.refresh(orden)

    # Reload with relationships
    query = select(OrdenEstudio).options(
        selectinload(OrdenEstudio.paciente),
        selectinload(OrdenEstudio.medico_solicitante),
        selectinload(OrdenEstudio.resultados)
    ).where(OrdenEstudio.id == orden_id)

    result = await db.execute(query)
    orden_completa = result.scalar_one()

    return orden_completa


@router.delete("/{orden_id}")
async def cancel_orden(
    orden_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Cancela una orden de estudios"""
    query = select(OrdenEstudio).where(OrdenEstudio.id == orden_id)
    result = await db.execute(query)
    orden = result.scalar_one_or_none()

    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    # Cambiar estado a cancelada
    orden.estado = EstadoOrden.CANCELADA

    await db.commit()

    return {"message": "Orden cancelada"}


# ============================================================================
# RESULTADOS DE ESTUDIOS
# ============================================================================

@router.get("/{orden_id}/resultados", response_model=List[ResultadoEstudioResponse])
async def get_resultados(
    orden_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Obtiene todos los resultados de una orden"""
    query = select(ResultadoEstudio).where(ResultadoEstudio.orden_id == orden_id)

    result = await db.execute(query)
    resultados = result.scalars().all()

    return resultados


@router.post("/{orden_id}/resultados", response_model=ResultadoEstudioResponse)
async def create_resultado(
    orden_id: int,
    resultado_data: ResultadoEstudioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Agrega un resultado a una orden de estudios"""
    # Verificar que la orden existe
    query = select(OrdenEstudio).where(OrdenEstudio.id == orden_id)
    result = await db.execute(query)
    orden = result.scalar_one_or_none()

    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    # Crear resultado
    nuevo_resultado = ResultadoEstudio(
        orden_id=orden_id,
        cargado_por_id=current_user["id"],
        nombre_estudio=resultado_data.nombre_estudio,
        interpretacion=resultado_data.interpretacion,
        observaciones=resultado_data.observaciones,
        datos=resultado_data.datos,
        fecha_resultado=resultado_data.fecha_resultado,
        fecha_carga=datetime.utcnow(),
        notificado_medico=False,
        notificado_paciente=False,
    )

    db.add(nuevo_resultado)

    # Actualizar estado de la orden si todos los estudios tienen resultado
    # Por ahora, simplemente marcamos como EN_PROCESO
    if orden.estado == EstadoOrden.PENDIENTE:
        orden.estado = EstadoOrden.EN_PROCESO

    await db.commit()
    await db.refresh(nuevo_resultado)

    return nuevo_resultado


@router.post("/{orden_id}/resultados/{resultado_id}/archivo")
async def upload_archivo_resultado(
    orden_id: int,
    resultado_id: int,
    archivo: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """
    Carga un archivo (PDF, imagen) como resultado de un estudio
    """
    # Verificar que el resultado existe
    query = select(ResultadoEstudio).where(
        ResultadoEstudio.id == resultado_id,
        ResultadoEstudio.orden_id == orden_id
    )
    result = await db.execute(query)
    resultado = result.scalar_one_or_none()

    if not resultado:
        raise HTTPException(status_code=404, detail="Resultado no encontrado")

    # Por ahora, guardamos la información del archivo
    # En producción, subirías a S3 o almacenamiento similar
    resultado.archivo_nombre = archivo.filename
    resultado.archivo_tipo = archivo.content_type
    resultado.archivo_url = f"/uploads/resultados/{resultado_id}/{archivo.filename}"

    await db.commit()

    return {
        "message": "Archivo cargado exitosamente",
        "archivo_url": resultado.archivo_url
    }


@router.post("/{orden_id}/completar")
async def completar_orden(
    orden_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Marca una orden como completada"""
    query = select(OrdenEstudio).where(OrdenEstudio.id == orden_id)
    result = await db.execute(query)
    orden = result.scalar_one_or_none()

    if not orden:
        raise HTTPException(status_code=404, detail="Orden no encontrada")

    orden.estado = EstadoOrden.COMPLETADA
    orden.fecha_realizacion = datetime.utcnow()

    await db.commit()

    return {"message": "Orden completada"}


@router.get("/paciente/{paciente_id}/historial")
async def get_historial_estudios(
    paciente_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Obtiene historial de estudios de un paciente"""
    query = select(OrdenEstudio).options(
        selectinload(OrdenEstudio.medico_solicitante),
        selectinload(OrdenEstudio.resultados)
    ).where(OrdenEstudio.paciente_id == paciente_id).order_by(OrdenEstudio.fecha_solicitud.desc())

    result = await db.execute(query)
    ordenes = result.scalars().all()

    return ordenes
