"""Appointment schemas"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class CitaBase(BaseModel):
    """Base appointment schema"""
    paciente_id: int
    medico_id: int
    sede_id: int
    recurso_id: Optional[int] = None
    fecha_hora_inicio: datetime
    fecha_hora_fin: datetime
    duracion_minutos: int = 30
    motivo: str
    notas: Optional[str] = None
    tipo_cita: Optional[str] = None
    especialidad: Optional[str] = None
    es_primera_vez: bool = False
    es_urgencia: bool = False


class CitaCreate(CitaBase):
    """Create appointment schema"""
    empresa_id: int


class CitaUpdate(BaseModel):
    """Update appointment schema"""
    fecha_hora_inicio: Optional[datetime] = None
    fecha_hora_fin: Optional[datetime] = None
    duracion_minutos: Optional[int] = None
    motivo: Optional[str] = None
    notas: Optional[str] = None
    estado: Optional[str] = None


class Cita(CitaBase):
    """Appointment response schema"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    empresa_id: int
    estado: str
    confirmada_por_paciente: bool
    recordatorio_enviado: bool
    fecha_hora_checkin: Optional[datetime] = None
    fecha_hora_checkout: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime


class CitaCheckIn(BaseModel):
    """Check-in request"""
    signos_vitales: Optional[dict] = None


class CitaCancelacion(BaseModel):
    """Cancellation request"""
    motivo_cancelacion: str
