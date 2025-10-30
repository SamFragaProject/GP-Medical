"""
Prescription and study order models
"""

from sqlalchemy import Column, Integer, String, Boolean, Text, Date, DateTime, Float, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class EstadoReceta(str, enum.Enum):
    """Prescription status"""
    ACTIVA = "activa"
    DISPENSADA = "dispensada"
    PARCIALMENTE_DISPENSADA = "parcialmente_dispensada"
    CANCELADA = "cancelada"
    VENCIDA = "vencida"


class EstadoOrden(str, enum.Enum):
    """Study order status"""
    PENDIENTE = "pendiente"
    EN_PROCESO = "en_proceso"
    COMPLETADA = "completada"
    CANCELADA = "cancelada"


class Receta(Base):
    """
    Receta - Medical prescription
    """

    __tablename__ = "recetas"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, index=True)
    encuentro_id = Column(Integer, ForeignKey("encuentros_clinicos.id"), index=True)
    medico_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)

    # Reference
    folio = Column(String(50), unique=True, nullable=False, index=True)
    codigo_qr = Column(Text)  # QR code data for validation

    # Status
    estado = Column(Enum(EstadoReceta), nullable=False, default=EstadoReceta.ACTIVA)

    # Date
    fecha_emision = Column(Date, nullable=False)
    fecha_vigencia = Column(Date)  # Expiration date

    # Diagnosis context
    diagnostico = Column(Text)
    indicaciones_generales = Column(Text)

    # Signature
    firma_digital_url = Column(String(500))
    firmada = Column(Boolean, default=False)
    fecha_firma = Column(DateTime)

    # PDF
    pdf_url = Column(String(500))

    # Relationships
    paciente = relationship("Paciente")
    encuentro = relationship("EncuentroClinico", back_populates="recetas")
    medico = relationship("Usuario", back_populates="recetas")
    detalles = relationship("DetalleReceta", back_populates="receta", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Receta(id={self.id}, folio='{self.folio}', paciente_id={self.paciente_id})>"


class DetalleReceta(Base):
    """
    DetalleReceta - Prescription line item
    """

    __tablename__ = "detalle_receta"

    # Foreign Keys
    receta_id = Column(Integer, ForeignKey("recetas.id"), nullable=False, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), index=True)

    # Medication
    medicamento = Column(String(255), nullable=False)
    presentacion = Column(String(100))  # tableta, capsula, jarabe, etc.
    concentracion = Column(String(100))

    # Dosage
    dosis = Column(String(100), nullable=False)  # e.g., "1 tableta"
    via_administracion = Column(String(50))  # oral, topica, intravenosa, etc.
    frecuencia = Column(String(100), nullable=False)  # e.g., "cada 8 horas"
    duracion = Column(String(100))  # e.g., "7 dias"

    # Instructions
    indicaciones = Column(Text, nullable=False)

    # Dispensing
    cantidad = Column(Float, nullable=False)
    cantidad_dispensada = Column(Float, default=0)
    dispensada = Column(Boolean, default=False)
    fecha_dispensacion = Column(DateTime)

    # Relationships
    receta = relationship("Receta", back_populates="detalles")
    producto = relationship("Producto")

    def __repr__(self):
        return f"<DetalleReceta(id={self.id}, medicamento='{self.medicamento}')>"


class OrdenEstudio(Base):
    """
    OrdenEstudio - Laboratory/imaging study order
    """

    __tablename__ = "ordenes_estudio"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, index=True)
    encuentro_id = Column(Integer, ForeignKey("encuentros_clinicos.id"), index=True)
    medico_solicitante_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)

    # Reference
    folio = Column(String(50), unique=True, nullable=False, index=True)

    # Type
    tipo = Column(String(50), nullable=False)  # laboratorio, imagen, gabinete
    categoria = Column(String(100))  # quimica_sanguinea, radiografia, ultrasonido, etc.

    # Study details
    estudios = Column(JSON, nullable=False)  # List of studies requested
    indicaciones_clinicas = Column(Text)
    preparacion = Column(Text)  # Patient preparation instructions

    # Status
    estado = Column(Enum(EstadoOrden), nullable=False, default=EstadoOrden.PENDIENTE)

    # Dates
    fecha_solicitud = Column(Date, nullable=False)
    fecha_programada = Column(DateTime)
    fecha_realizacion = Column(DateTime)

    # Priority
    urgente = Column(Boolean, default=False)

    # PDF
    pdf_url = Column(String(500))

    # Relationships
    paciente = relationship("Paciente")
    encuentro = relationship("EncuentroClinico", back_populates="ordenes_estudio")
    medico_solicitante = relationship("Usuario")
    resultados = relationship("ResultadoEstudio", back_populates="orden", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<OrdenEstudio(id={self.id}, folio='{self.folio}', tipo='{self.tipo}')>"


class ResultadoEstudio(Base):
    """
    ResultadoEstudio - Study results
    """

    __tablename__ = "resultados_estudio"

    # Foreign Keys
    orden_id = Column(Integer, ForeignKey("ordenes_estudio.id"), nullable=False, index=True)
    cargado_por_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    # Result details
    nombre_estudio = Column(String(255), nullable=False)
    interpretacion = Column(Text)
    observaciones = Column(Text)

    # Files
    archivo_url = Column(String(500))  # PDF or image
    archivo_nombre = Column(String(255))
    archivo_tipo = Column(String(50))

    # Results data (structured)
    datos = Column(JSON)  # For lab results with multiple parameters

    # Dates
    fecha_resultado = Column(Date, nullable=False)
    fecha_carga = Column(DateTime, nullable=False)

    # Notification
    notificado_medico = Column(Boolean, default=False)
    notificado_paciente = Column(Boolean, default=False)
    fecha_notificacion = Column(DateTime)

    # Validation
    validado_por_id = Column(Integer, ForeignKey("usuarios.id"))
    fecha_validacion = Column(DateTime)

    # Relationships
    orden = relationship("OrdenEstudio", back_populates="resultados")

    def __repr__(self):
        return f"<ResultadoEstudio(id={self.id}, orden_id={self.orden_id})>"
