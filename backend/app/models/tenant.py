"""
Tenant models: Empresa and Sede
Multi-tenancy support
"""

from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


class Empresa(Base):
    """
    Empresa (Tenant) - Clínica, Hospital, Consultorio
    Cada empresa es un tenant independiente
    """

    __tablename__ = "empresas"

    # Basic Information
    nombre = Column(String(255), nullable=False, index=True)
    razon_social = Column(String(255), nullable=False)
    rfc = Column(String(13), nullable=False, unique=True, index=True)
    slug = Column(String(100), unique=True, nullable=False, index=True)

    # Contact
    email = Column(String(255), nullable=False)
    telefono = Column(String(20))
    sitio_web = Column(String(255))

    # Address
    direccion = Column(Text)
    ciudad = Column(String(100))
    estado = Column(String(100))
    codigo_postal = Column(String(10))
    pais = Column(String(2), default="MX")

    # Branding
    logotipo_url = Column(String(500))
    color_primario = Column(String(7), default="#3B82F6")  # Hex color
    color_secundario = Column(String(7), default="#10B981")

    # Billing Configuration
    regimen_fiscal = Column(String(10))  # e.g., "601", "612"
    serie_factura = Column(String(10), default="F")
    serie_nota_credito = Column(String(10), default="NC")
    folio_actual_factura = Column(Integer, default=1)
    folio_actual_nota_credito = Column(Integer, default=1)

    # Settings (JSON for flexibility)
    configuracion = Column(JSON, default={})

    # Status
    activo = Column(Boolean, default=True, nullable=False)
    plan = Column(String(50), default="trial")  # trial, basic, premium, enterprise
    fecha_vencimiento_plan = Column(String(50))

    # Relationships
    sedes = relationship("Sede", back_populates="empresa", cascade="all, delete-orphan")
    usuarios = relationship("Usuario", back_populates="empresa")
    pacientes = relationship("Paciente", back_populates="empresa")

    def __repr__(self):
        return f"<Empresa(id={self.id}, nombre='{self.nombre}', rfc='{self.rfc}')>"


class Sede(Base):
    """
    Sede - Sucursal de una empresa
    Una empresa puede tener múltiples sedes
    """

    __tablename__ = "sedes"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)

    # Basic Information
    nombre = Column(String(255), nullable=False)
    codigo = Column(String(50), nullable=False, index=True)

    # Contact
    email = Column(String(255))
    telefono = Column(String(20))

    # Address
    direccion = Column(Text)
    ciudad = Column(String(100))
    estado = Column(String(100))
    codigo_postal = Column(String(10))

    # Operating Hours (JSON)
    horario = Column(JSON, default={})  # {"lunes": {"inicio": "09:00", "fin": "18:00"}, ...}

    # Settings
    configuracion = Column(JSON, default={})

    # Status
    activo = Column(Boolean, default=True, nullable=False)

    # Relationships
    empresa = relationship("Empresa", back_populates="sedes")
    citas = relationship("Cita", back_populates="sede")
    recursos = relationship("Recurso", back_populates="sede")

    def __repr__(self):
        return f"<Sede(id={self.id}, nombre='{self.nombre}', empresa_id={self.empresa_id})>"
