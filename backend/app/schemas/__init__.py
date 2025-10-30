"""Pydantic schemas"""

from app.schemas.auth import Token, TokenData, Login
from app.schemas.user import Usuario, UsuarioCreate, UsuarioUpdate
from app.schemas.patient import Paciente, PacienteCreate, PacienteUpdate
from app.schemas.appointment import Cita, CitaCreate, CitaUpdate

__all__ = [
    "Token",
    "TokenData",
    "Login",
    "Usuario",
    "UsuarioCreate",
    "UsuarioUpdate",
    "Paciente",
    "PacienteCreate",
    "PacienteUpdate",
    "Cita",
    "CitaCreate",
    "CitaUpdate",
]
