"""User schemas"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class UsuarioBase(BaseModel):
    """Base user schema"""
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
    """Create user schema"""
    password: str = Field(..., min_length=8)
    empresa_id: int


class UsuarioUpdate(BaseModel):
    """Update user schema"""
    nombre: Optional[str] = None
    apellido_paterno: Optional[str] = None
    apellido_materno: Optional[str] = None
    telefono: Optional[str] = None
    celular: Optional[str] = None
    especialidad: Optional[str] = None
    subespecialidad: Optional[str] = None
    is_active: Optional[bool] = None


class Usuario(UsuarioBase):
    """User response schema"""
    model_config = ConfigDict(from_attributes=True)

    id: int
    empresa_id: int
    is_active: bool
    is_superuser: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class UsuarioWithRoles(Usuario):
    """User with roles"""
    roles: List[str] = []
    permisos: List[str] = []
