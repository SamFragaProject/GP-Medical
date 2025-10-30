"""
CRM (Customer Relationship Management) models
"""

from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class TipoCampana(str, enum.Enum):
    """Campaign type"""
    SEGUIMIENTO = "seguimiento"
    RECORDATORIO = "recordatorio"
    VACUNACION = "vacunacion"
    CHEQUEO = "chequeo"
    PROMOCIONAL = "promocional"
    INFORMATIVA = "informativa"


class EstadoCampana(str, enum.Enum):
    """Campaign status"""
    BORRADOR = "borrador"
    ACTIVA = "activa"
    PAUSADA = "pausada"
    COMPLETADA = "completada"
    CANCELADA = "cancelada"


class CanalMensaje(str, enum.Enum):
    """Message channel"""
    EMAIL = "email"
    SMS = "sms"
    WHATSAPP = "whatsapp"
    NOTIFICACION = "notificacion"


class EstadoMensaje(str, enum.Enum):
    """Message status"""
    PENDIENTE = "pendiente"
    ENVIANDO = "enviando"
    ENVIADO = "enviado"
    ENTREGADO = "entregado"
    LEIDO = "leido"
    FALLIDO = "fallido"


class EstadoTarea(str, enum.Enum):
    """Task status"""
    PENDIENTE = "pendiente"
    EN_PROGRESO = "en_progreso"
    COMPLETADA = "completada"
    CANCELADA = "cancelada"


class PrioridadTarea(str, enum.Enum):
    """Task priority"""
    BAJA = "baja"
    MEDIA = "media"
    ALTA = "alta"
    URGENTE = "urgente"


class Campana(Base):
    """
    Campaña - Marketing/Communication campaign
    """

    __tablename__ = "campanas"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    creada_por_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    # Basic Information
    nombre = Column(String(255), nullable=False)
    tipo = Column(Enum(TipoCampana), nullable=False, index=True)
    descripcion = Column(Text)

    # Status
    estado = Column(Enum(EstadoCampana), nullable=False, default=EstadoCampana.BORRADOR)

    # Segmentation (JSON for flexibility)
    segmentacion = Column(JSON)  # Criteria for target audience
    # Example: {"edad_min": 40, "diagnosticos": ["diabetes"], "ultima_visita_dias": 90}

    # Schedule
    fecha_inicio = Column(DateTime)
    fecha_fin = Column(DateTime)
    programada = Column(Boolean, default=False)

    # Channel
    canal = Column(Enum(CanalMensaje), nullable=False)

    # Content
    asunto = Column(String(255))
    plantilla = Column(Text)  # Message template
    variables = Column(JSON)  # Template variables

    # Statistics
    total_destinatarios = Column(Integer, default=0)
    total_enviados = Column(Integer, default=0)
    total_entregados = Column(Integer, default=0)
    total_abiertos = Column(Integer, default=0)
    total_clicks = Column(Integer, default=0)

    # Relationships
    mensajes = relationship("Mensaje", back_populates="campana", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Campana(id={self.id}, nombre='{self.nombre}', tipo='{self.tipo}')>"


class Mensaje(Base):
    """
    Mensaje - Individual message (email, SMS, WhatsApp)
    """

    __tablename__ = "mensajes"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    campana_id = Column(Integer, ForeignKey("campanas.id"), index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), index=True)
    enviado_por_id = Column(Integer, ForeignKey("usuarios.id"))

    # Channel
    canal = Column(Enum(CanalMensaje), nullable=False, index=True)

    # Recipient
    destinatario = Column(String(255), nullable=False)  # Email or phone number

    # Content
    asunto = Column(String(255))
    contenido = Column(Text, nullable=False)

    # Status
    estado = Column(Enum(EstadoMensaje), nullable=False, default=EstadoMensaje.PENDIENTE, index=True)

    # Dates
    fecha_programada = Column(DateTime)
    fecha_envio = Column(DateTime)
    fecha_entrega = Column(DateTime)
    fecha_lectura = Column(DateTime)

    # Provider response
    proveedor = Column(String(50))  # twilio, sendgrid, etc.
    proveedor_id = Column(String(255))  # Provider's message ID
    proveedor_respuesta = Column(JSON)

    # Error handling
    intentos = Column(Integer, default=0)
    error = Column(Text)

    # Tracking
    abierto = Column(Boolean, default=False)
    clicks = Column(Integer, default=0)

    # Relationships
    campana = relationship("Campana", back_populates="mensajes")
    paciente = relationship("Paciente")

    def __repr__(self):
        return f"<Mensaje(id={self.id}, canal='{self.canal}', estado='{self.estado}')>"


class TareaCRM(Base):
    """
    TareaCRM - CRM Task (follow-ups, calls, etc.)
    """

    __tablename__ = "tareas_crm"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), index=True)
    asignada_a_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    creada_por_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    # Basic Information
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text)

    # Type
    tipo = Column(String(100), nullable=False)  # llamada, seguimiento, documento, etc.

    # Status
    estado = Column(Enum(EstadoTarea), nullable=False, default=EstadoTarea.PENDIENTE, index=True)
    prioridad = Column(Enum(PrioridadTarea), nullable=False, default=PrioridadTarea.MEDIA)

    # Dates
    fecha_vencimiento = Column(DateTime, index=True)
    fecha_completada = Column(DateTime)

    # Reminder
    recordatorio = Column(Boolean, default=False)
    fecha_recordatorio = Column(DateTime)

    # Result
    resultado = Column(Text)
    notas = Column(Text)

    # Relationships
    paciente = relationship("Paciente")

    def __repr__(self):
        return f"<TareaCRM(id={self.id}, titulo='{self.titulo}', estado='{self.estado}')>"
