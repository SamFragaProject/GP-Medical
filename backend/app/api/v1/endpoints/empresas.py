"""
Empresas (Tenants) and Configuration endpoints
Gestión de empresas, sedes y configuración del sistema
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from pydantic import BaseModel, Field, EmailStr

from app.core.database import get_db
from app.models.tenant import Empresa, Sede

router = APIRouter()

# ============================================================================
# SCHEMAS - EMPRESAS
# ============================================================================

class EmpresaBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    razon_social: str = Field(..., min_length=1, max_length=255)
    rfc: str = Field(..., min_length=12, max_length=13)
    slug: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    telefono: Optional[str] = None
    sitio_web: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    codigo_postal: Optional[str] = None
    pais: str = "MX"
    logotipo_url: Optional[str] = None
    color_primario: str = "#3B82F6"
    color_secundario: str = "#10B981"
    regimen_fiscal: Optional[str] = None
    serie_factura: str = "F"
    serie_nota_credito: str = "NC"
    configuracion: Optional[dict] = None
    plan: str = "trial"


class EmpresaCreate(EmpresaBase):
    pass


class EmpresaUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=255)
    razon_social: Optional[str] = Field(None, min_length=1, max_length=255)
    rfc: Optional[str] = Field(None, min_length=12, max_length=13)
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    sitio_web: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    codigo_postal: Optional[str] = None
    logotipo_url: Optional[str] = None
    color_primario: Optional[str] = None
    color_secundario: Optional[str] = None
    regimen_fiscal: Optional[str] = None
    serie_factura: Optional[str] = None
    serie_nota_credito: Optional[str] = None
    configuracion: Optional[dict] = None
    plan: Optional[str] = None
    activo: Optional[bool] = None


class EmpresaResponse(EmpresaBase):
    id: int
    folio_actual_factura: int
    folio_actual_nota_credito: int
    activo: bool
    fecha_vencimiento_plan: Optional[str]
    fecha_creacion: str
    fecha_actualizacion: str

    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS - SEDES
# ============================================================================

class SedeBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=255)
    codigo: str = Field(..., min_length=1, max_length=50)
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    codigo_postal: Optional[str] = None
    horario: Optional[dict] = None
    configuracion: Optional[dict] = None


class SedeCreate(SedeBase):
    empresa_id: int


class SedeUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=1, max_length=255)
    codigo: Optional[str] = Field(None, min_length=1, max_length=50)
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    codigo_postal: Optional[str] = None
    horario: Optional[dict] = None
    configuracion: Optional[dict] = None
    activo: Optional[bool] = None


class SedeResponse(SedeBase):
    id: int
    empresa_id: int
    activo: bool
    fecha_creacion: str
    fecha_actualizacion: str

    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS - CONFIGURACIÓN
# ============================================================================

class ConfiguracionGeneral(BaseModel):
    """Configuración general del sistema"""
    # Notificaciones
    notificaciones_email: bool = True
    notificaciones_sms: bool = False
    notificaciones_whatsapp: bool = False

    # Citas
    duracion_cita_default: int = 30  # minutos
    recordatorio_citas_horas: int = 24
    permitir_cancelacion_horas: int = 12

    # Facturación
    iva_default: float = 0.16
    retencion_isr: float = 0.0
    retencion_iva: float = 0.0

    # Inventario
    alerta_stock_minimo: bool = True
    alerta_caducidad_dias: int = 90

    # Seguridad
    sesion_timeout_minutos: int = 120
    requiere_2fa: bool = False

    # Idioma y formato
    idioma: str = "es-MX"
    zona_horaria: str = "America/Mexico_City"
    formato_fecha: str = "DD/MM/YYYY"
    formato_moneda: str = "MXN"


# ============================================================================
# ENDPOINTS - EMPRESAS
# ============================================================================

@router.get("/", response_model=List[EmpresaResponse])
async def list_empresas(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    activo: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Lista todas las empresas (tenants)
    """
    query = select(Empresa).order_by(Empresa.nombre)

    # Filters
    filters = []
    if activo is not None:
        filters.append(Empresa.activo == activo)
    if search:
        search_filter = f"%{search}%"
        filters.append(
            (Empresa.nombre.ilike(search_filter)) |
            (Empresa.razon_social.ilike(search_filter)) |
            (Empresa.rfc.ilike(search_filter))
        )

    if filters:
        query = query.where(and_(*filters))

    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    empresas = result.scalars().all()

    return empresas


@router.post("/", response_model=EmpresaResponse, status_code=status.HTTP_201_CREATED)
async def create_empresa(
    empresa_data: EmpresaCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Crea una nueva empresa (tenant)
    """
    # Check if RFC already exists
    existing = await db.execute(
        select(Empresa).where(Empresa.rfc == empresa_data.rfc)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una empresa con este RFC"
        )

    # Check if slug already exists
    existing_slug = await db.execute(
        select(Empresa).where(Empresa.slug == empresa_data.slug)
    )
    if existing_slug.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una empresa con este slug"
        )

    empresa = Empresa(**empresa_data.model_dump())

    db.add(empresa)
    await db.commit()
    await db.refresh(empresa)

    return empresa


@router.get("/{empresa_id}", response_model=EmpresaResponse)
async def get_empresa(
    empresa_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene una empresa por ID
    """
    result = await db.execute(
        select(Empresa).where(Empresa.id == empresa_id)
    )
    empresa = result.scalar_one_or_none()

    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa no encontrada"
        )

    return empresa


@router.put("/{empresa_id}", response_model=EmpresaResponse)
async def update_empresa(
    empresa_id: int,
    empresa_data: EmpresaUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Actualiza una empresa
    """
    result = await db.execute(
        select(Empresa).where(Empresa.id == empresa_id)
    )
    empresa = result.scalar_one_or_none()

    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa no encontrada"
        )

    # Update fields
    update_data = empresa_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(empresa, field, value)

    await db.commit()
    await db.refresh(empresa)

    return empresa


@router.delete("/{empresa_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_empresa(
    empresa_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Elimina (desactiva) una empresa
    """
    result = await db.execute(
        select(Empresa).where(Empresa.id == empresa_id)
    )
    empresa = result.scalar_one_or_none()

    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa no encontrada"
        )

    # Soft delete - just deactivate
    empresa.activo = False
    await db.commit()


# ============================================================================
# ENDPOINTS - SEDES
# ============================================================================

@router.get("/{empresa_id}/sedes", response_model=List[SedeResponse])
async def list_sedes(
    empresa_id: int,
    activo: Optional[bool] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Lista todas las sedes de una empresa
    """
    query = select(Sede).where(Sede.empresa_id == empresa_id).order_by(Sede.nombre)

    if activo is not None:
        query = query.where(Sede.activo == activo)

    result = await db.execute(query)
    sedes = result.scalars().all()

    return sedes


@router.post("/sedes", response_model=SedeResponse, status_code=status.HTTP_201_CREATED)
async def create_sede(
    sede_data: SedeCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Crea una nueva sede
    """
    # Verify empresa exists
    empresa_result = await db.execute(
        select(Empresa).where(Empresa.id == sede_data.empresa_id)
    )
    if not empresa_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa no encontrada"
        )

    # Check if codigo already exists for this empresa
    existing = await db.execute(
        select(Sede).where(
            and_(
                Sede.empresa_id == sede_data.empresa_id,
                Sede.codigo == sede_data.codigo
            )
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ya existe una sede con este código en la empresa"
        )

    sede = Sede(**sede_data.model_dump())

    db.add(sede)
    await db.commit()
    await db.refresh(sede)

    return sede


@router.get("/sedes/{sede_id}", response_model=SedeResponse)
async def get_sede(
    sede_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene una sede por ID
    """
    result = await db.execute(
        select(Sede).where(Sede.id == sede_id)
    )
    sede = result.scalar_one_or_none()

    if not sede:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sede no encontrada"
        )

    return sede


@router.put("/sedes/{sede_id}", response_model=SedeResponse)
async def update_sede(
    sede_id: int,
    sede_data: SedeUpdate,
    db: AsyncSession = Depends(get_db)
):
    """
    Actualiza una sede
    """
    result = await db.execute(
        select(Sede).where(Sede.id == sede_id)
    )
    sede = result.scalar_one_or_none()

    if not sede:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sede no encontrada"
        )

    # Update fields
    update_data = sede_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(sede, field, value)

    await db.commit()
    await db.refresh(sede)

    return sede


@router.delete("/sedes/{sede_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sede(
    sede_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Elimina (desactiva) una sede
    """
    result = await db.execute(
        select(Sede).where(Sede.id == sede_id)
    )
    sede = result.scalar_one_or_none()

    if not sede:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sede no encontrada"
        )

    # Soft delete - just deactivate
    sede.activo = False
    await db.commit()


# ============================================================================
# ENDPOINTS - CONFIGURACIÓN
# ============================================================================

@router.get("/{empresa_id}/configuracion", response_model=ConfiguracionGeneral)
async def get_configuracion(
    empresa_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtiene la configuración general de una empresa
    """
    result = await db.execute(
        select(Empresa).where(Empresa.id == empresa_id)
    )
    empresa = result.scalar_one_or_none()

    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa no encontrada"
        )

    # Return current config or defaults
    config = empresa.configuracion or {}
    return ConfiguracionGeneral(**config)


@router.put("/{empresa_id}/configuracion", response_model=ConfiguracionGeneral)
async def update_configuracion(
    empresa_id: int,
    config_data: ConfiguracionGeneral,
    db: AsyncSession = Depends(get_db)
):
    """
    Actualiza la configuración general de una empresa
    """
    result = await db.execute(
        select(Empresa).where(Empresa.id == empresa_id)
    )
    empresa = result.scalar_one_or_none()

    if not empresa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Empresa no encontrada"
        )

    # Update configuration
    empresa.configuracion = config_data.model_dump()
    await db.commit()
    await db.refresh(empresa)

    return ConfiguracionGeneral(**empresa.configuracion)
