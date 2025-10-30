"""Patient schemas"""

from typing import Optional, List
from datetime import date, datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class PacienteBase(BaseModel):
    """Base patient schema"""
    nombre: str
    apellido_paterno: str
    apellido_materno: Optional[str] = None
    fecha_nacimiento: date
    genero: str
    tipo_sangre: Optional[str] = None
    curp: Optional[str] = None
    rfc: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    celular: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    codigo_postal: Optional[str] = None


class PacienteCreate(PacienteBase):
    """Create patient schema"""
    empresa_id: int


class PacienteUpdate(BaseModel):
    """Update patient schema"""
    nombre: Optional[str] = None
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    telefono: Optional[str] = None
    celular: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    codigo_postal: Optional[str] = None
    activo: Optional[bool] = None


class Paciente(PacienteBase):
    """Patient response schema"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    empresa_id: int
    numero_expediente: Optional[str] = None
    foto_url: Optional[str] = None
    activo: bool
    created_at: datetime
    updated_at: datetime


class ContactoEmergenciaCreate(BaseModel):
    """Emergency contact create"""
    nombre: str
    parentesco: str
    telefono: str
    celular: Optional[str] = None
    email: Optional[EmailStr] = None
    direccion: Optional[str] = None
    es_principal: bool = False


class AlergiaCreate(BaseModel):
    """Allergy create"""
    tipo: str
    sustancia: str
    reaccion: Optional[str] = None
    severidad: Optional[str] = None
    fecha_deteccion: Optional[date] = None
    notas: Optional[str] = None
