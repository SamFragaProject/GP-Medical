"""
Appointment and scheduling models
"""

from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class EstadoCita(str, enum.Enum):
    """Appointment status"""
    NUEVA = "nueva"
    CONFIRMADA = "confirmada"
    EN_ESPERA = "en_espera"
    ATENDIDA = "atendida"
    NO_ASISTIO = "no_asistio"
    CANCELADA = "cancelada"
    REAGENDADA = "reagendada"


class TipoRecurso(str, enum.Enum):
    """Resource types"""
    CONSULTORIO = "consultorio"
    SALA_CIRUGIA = "sala_cirugia"
    SALA_PROCEDIMIENTOS = "sala_procedimientos"
    EQUIPO_MEDICO = "equipo_medico"
    OTRO = "otro"


class Cita(Base):
    """
    Cita - Medical appointment
    """

    __tablename__ = "citas"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    sede_id = Column(Integer, ForeignKey("sedes.id"), nullable=False, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, index=True)
    medico_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)
    recurso_id = Column(Integer, ForeignKey("recursos.id"), index=True)

    # Scheduling
    fecha_hora_inicio = Column(DateTime, nullable=False, index=True)
    fecha_hora_fin = Column(DateTime, nullable=False)
    duracion_minutos = Column(Integer, nullable=False, default=30)

    # Status
    estado = Column(Enum(EstadoCita), nullable=False, default=EstadoCita.NUEVA, index=True)
    es_primera_vez = Column(Boolean, default=False)
    es_urgencia = Column(Boolean, default=False)

    # Details
    motivo = Column(Text, nullable=False)
    notas = Column(Text)
    tipo_cita = Column(String(100))  # consulta, seguimiento, procedimiento, etc.
    especialidad = Column(String(100))

    # Check-in / Check-out
    fecha_hora_checkin = Column(DateTime)
    fecha_hora_checkout = Column(DateTime)
    tiempo_espera_minutos = Column(Integer)

    # Reminders
    recordatorio_enviado = Column(Boolean, default=False)
    confirmada_por_paciente = Column(Boolean, default=False)
    fecha_confirmacion = Column(DateTime)

    # Cancellation
    fecha_cancelacion = Column(DateTime)
    motivo_cancelacion = Column(Text)
    cancelada_por_usuario_id = Column(Integer, ForeignKey("usuarios.id"))

    # Relationships
    sede = relationship("Sede", back_populates="citas")
    paciente = relationship("Paciente", back_populates="citas")
    medico = relationship("Usuario", foreign_keys=[medico_id], back_populates="citas_medico")
    recurso = relationship("Recurso", back_populates="citas")
    encuentro_clinico = relationship("EncuentroClinico", back_populates="cita", uselist=False)

    def __repr__(self):
        return f"<Cita(id={self.id}, paciente_id={self.paciente_id}, fecha={self.fecha_hora_inicio})>"


class Recurso(Base):
    """
    Recurso - Resource for appointments (rooms, equipment, etc.)
    """

    __tablename__ = "recursos"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    sede_id = Column(Integer, ForeignKey("sedes.id"), nullable=False, index=True)

    # Basic Information
    nombre = Column(String(255), nullable=False)
    codigo = Column(String(50), nullable=False, index=True)
    tipo = Column(Enum(TipoRecurso), nullable=False)
    descripcion = Column(Text)

    # Capacity
    capacidad = Column(Integer, default=1)
    permite_overbooking = Column(Boolean, default=False)
    porcentaje_overbooking = Column(Integer, default=0)

    # Settings
    configuracion = Column(JSON, default={})
    color = Column(String(7), default="#3B82F6")  # For calendar display

    # Status
    activo = Column(Boolean, default=True, nullable=False)

    # Relationships
    sede = relationship("Sede", back_populates="recursos")
    citas = relationship("Cita", back_populates="recurso")
    bloqueos = relationship("BloqueoHorario", back_populates="recurso", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Recurso(id={self.id}, nombre='{self.nombre}', tipo='{self.tipo}')>"


class BloqueoHorario(Base):
    """
    BloqueoHorario - Time blocks for resources (maintenance, holidays, etc.)
    """

    __tablename__ = "bloqueos_horario"

    # Foreign Keys
    recurso_id = Column(Integer, ForeignKey("recursos.id"), index=True)
    medico_id = Column(Integer, ForeignKey("usuarios.id"), index=True)

    # Can block either a resource or a doctor's time

    # Time block
    fecha_hora_inicio = Column(DateTime, nullable=False, index=True)
    fecha_hora_fin = Column(DateTime, nullable=False)

    # Details
    motivo = Column(String(255), nullable=False)
    descripcion = Column(Text)
    es_recurrente = Column(Boolean, default=False)
    patron_recurrencia = Column(JSON)  # For recurring blocks

    # Status
    activo = Column(Boolean, default=True)

    # Relationships
    recurso = relationship("Recurso", back_populates="bloqueos")

    def __repr__(self):
        return f"<BloqueoHorario(id={self.id}, motivo='{self.motivo}')>"
