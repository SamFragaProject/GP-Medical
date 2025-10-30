"""
User, Role, and Permission models
RBAC (Role-Based Access Control) implementation
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Text,
    ForeignKey,
    Table,
    JSON,
    DateTime,
)
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


# Association table for Usuario-Rol (many-to-many)
class UsuarioRol(Base):
    """Association between Usuario and Rol"""

    __tablename__ = "usuario_rol"

    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    rol_id = Column(Integer, ForeignKey("roles.id"), nullable=False, index=True)
    sede_id = Column(Integer, ForeignKey("sedes.id"), nullable=True, index=True)

    # A user can have different roles in different sedes
    # If sede_id is NULL, the role applies to all sedes

    usuario = relationship("Usuario", back_populates="usuario_roles")
    rol = relationship("Rol", back_populates="usuario_roles")


# Association table for Rol-Permiso (many-to-many)
class RolPermiso(Base):
    """Association between Rol and Permiso"""

    __tablename__ = "rol_permiso"

    rol_id = Column(Integer, ForeignKey("roles.id"), nullable=False, index=True)
    permiso_id = Column(Integer, ForeignKey("permisos.id"), nullable=False, index=True)

    rol = relationship("Rol", back_populates="rol_permisos")
    permiso = relationship("Permiso", back_populates="rol_permisos")


class Usuario(Base):
    """
    Usuario del sistema
    Puede tener múltiples roles en diferentes sedes
    """

    __tablename__ = "usuarios"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)

    # Basic Information
    email = Column(String(255), nullable=False, unique=True, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)

    # Personal Information
    nombre = Column(String(100), nullable=False)
    apellido_paterno = Column(String(100), nullable=False)
    apellido_materno = Column(String(100))
    telefono = Column(String(20))
    celular = Column(String(20))

    # Professional Information (for doctors)
    cedula_profesional = Column(String(50), unique=True, index=True)
    especialidad = Column(String(100))
    subespecialidad = Column(String(100))

    # Profile
    avatar_url = Column(String(500))
    firma_digital_url = Column(String(500))  # For digital signatures on prescriptions

    # Settings
    preferencias = Column(JSON, default={})
    notificaciones = Column(JSON, default={})

    # Security
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    require_password_change = Column(Boolean, default=False)
    two_factor_enabled = Column(Boolean, default=False)
    two_factor_secret = Column(String(100))

    # Session
    last_login = Column(DateTime)
    last_activity = Column(DateTime)

    # Relationships
    empresa = relationship("Empresa", back_populates="usuarios")
    usuario_roles = relationship("UsuarioRol", back_populates="usuario", cascade="all, delete-orphan")
    citas_medico = relationship("Cita", foreign_keys="Cita.medico_id", back_populates="medico")
    notas_clinicas = relationship("NotaClinica", back_populates="medico")
    recetas = relationship("Receta", back_populates="medico")

    def __repr__(self):
        return f"<Usuario(id={self.id}, email='{self.email}', nombre='{self.nombre}')>"


class Rol(Base):
    """
    Rol de usuario
    Roles configurables con permisos específicos
    """

    __tablename__ = "roles"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)

    # Basic Information
    nombre = Column(String(100), nullable=False, index=True)
    codigo = Column(String(50), nullable=False, index=True)  # e.g., "ADMIN", "MEDICO", "RECEPCION"
    descripcion = Column(Text)

    # Configuration
    es_sistema = Column(Boolean, default=False)  # System role (cannot be deleted)
    es_medico = Column(Boolean, default=False)  # Is this a doctor role?

    # Settings
    configuracion = Column(JSON, default={})

    # Status
    activo = Column(Boolean, default=True, nullable=False)

    # Relationships
    usuario_roles = relationship("UsuarioRol", back_populates="rol")
    rol_permisos = relationship("RolPermiso", back_populates="rol", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Rol(id={self.id}, nombre='{self.nombre}', codigo='{self.codigo}')>"


class Permiso(Base):
    """
    Permiso del sistema
    Define acciones específicas que un rol puede realizar
    """

    __tablename__ = "permisos"

    # Basic Information
    nombre = Column(String(100), nullable=False, unique=True, index=True)
    codigo = Column(String(100), nullable=False, unique=True, index=True)
    descripcion = Column(Text)

    # Categorization
    modulo = Column(String(50), nullable=False, index=True)  # e.g., "pacientes", "agenda", "facturacion"
    accion = Column(String(50), nullable=False)  # e.g., "crear", "leer", "actualizar", "eliminar"

    # Full permission code: modulo:accion (e.g., "pacientes:crear", "agenda:leer")

    # Relationships
    rol_permisos = relationship("RolPermiso", back_populates="permiso")

    def __repr__(self):
        return f"<Permiso(id={self.id}, codigo='{self.codigo}')>"
