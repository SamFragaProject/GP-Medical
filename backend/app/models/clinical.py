"""
Clinical encounter and medical record models
"""

from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, Float, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class EstadoEncuentro(str, enum.Enum):
    """Clinical encounter status"""
    EN_PROGRESO = "en_progreso"
    COMPLETADO = "completado"
    CERRADO = "cerrado"


class TipoDiagnostico(str, enum.Enum):
    """Diagnosis type"""
    PRESUNTIVO = "presuntivo"
    CONFIRMADO = "confirmado"
    DIFERENCIAL = "diferencial"


class EncuentroClinico(Base):
    """
    EncuentroClinico - Clinical encounter
    Represents a patient visit
    """

    __tablename__ = "encuentros_clinicos"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, index=True)
    cita_id = Column(Integer, ForeignKey("citas.id"), index=True)
    medico_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)

    # Timing
    fecha_hora_inicio = Column(DateTime, nullable=False, index=True)
    fecha_hora_fin = Column(DateTime)
    duracion_minutos = Column(Integer)

    # Type
    tipo_encuentro = Column(String(100), nullable=False)  # consulta, urgencia, procedimiento, etc.
    motivo_consulta = Column(Text, nullable=False)

    # Status
    estado = Column(Enum(EstadoEncuentro), nullable=False, default=EstadoEncuentro.EN_PROGRESO)

    # Summary (auto-generated or AI-assisted)
    resumen = Column(Text)

    # Relationships
    paciente = relationship("Paciente", back_populates="encuentros_clinicos")
    cita = relationship("Cita", back_populates="encuentro_clinico")
    medico = relationship("Usuario")
    notas_clinicas = relationship("NotaClinica", back_populates="encuentro", cascade="all, delete-orphan")
    signos_vitales = relationship("SignoVital", back_populates="encuentro", cascade="all, delete-orphan")
    diagnosticos = relationship("Diagnostico", back_populates="encuentro", cascade="all, delete-orphan")
    procedimientos = relationship("Procedimiento", back_populates="encuentro", cascade="all, delete-orphan")
    recetas = relationship("Receta", back_populates="encuentro")
    ordenes_estudio = relationship("OrdenEstudio", back_populates="encuentro")

    def __repr__(self):
        return f"<EncuentroClinico(id={self.id}, paciente_id={self.paciente_id}, fecha={self.fecha_hora_inicio})>"


class NotaClinica(Base):
    """
    NotaClinica - Clinical note (SOAP format)
    """

    __tablename__ = "notas_clinicas"

    # Foreign Keys
    encuentro_id = Column(Integer, ForeignKey("encuentros_clinicos.id"), nullable=False, index=True)
    medico_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False, index=True)

    # SOAP Format
    subjetivo = Column(Text)  # S - Subjective (patient's complaints)
    objetivo = Column(Text)   # O - Objective (exam findings, vitals)
    analisis = Column(Text)   # A - Assessment (diagnosis)
    plan = Column(Text)       # P - Plan (treatment plan)

    # Additional sections
    exploracion_fisica = Column(Text)
    estudios_gabinete = Column(Text)
    impresion_diagnostica = Column(Text)
    tratamiento = Column(Text)
    recomendaciones = Column(Text)

    # Signature and validation
    fecha_firma = Column(DateTime)
    firma_digital_url = Column(String(500))
    firmada = Column(Boolean, default=False)
    bloqueada = Column(Boolean, default=False)  # Locked after signing

    # Version control
    version = Column(Integer, default=1)
    nota_anterior_id = Column(Integer, ForeignKey("notas_clinicas.id"))

    # Template used
    plantilla_id = Column(Integer)  # Reference to template

    # Relationships
    encuentro = relationship("EncuentroClinico", back_populates="notas_clinicas")
    medico = relationship("Usuario", back_populates="notas_clinicas")

    def __repr__(self):
        return f"<NotaClinica(id={self.id}, encuentro_id={self.encuentro_id}, firmada={self.firmada})>"


class SignoVital(Base):
    """
    SignoVital - Vital signs
    """

    __tablename__ = "signos_vitales"

    # Foreign Keys
    encuentro_id = Column(Integer, ForeignKey("encuentros_clinicos.id"), nullable=False, index=True)
    registrado_por_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    # Vital signs
    temperatura = Column(Float)  # Celsius
    frecuencia_cardiaca = Column(Integer)  # bpm
    frecuencia_respiratoria = Column(Integer)  # rpm
    presion_sistolica = Column(Integer)  # mmHg
    presion_diastolica = Column(Integer)  # mmHg
    saturacion_oxigeno = Column(Float)  # %
    peso = Column(Float)  # kg
    altura = Column(Float)  # cm
    imc = Column(Float)  # Calculated BMI
    glucosa = Column(Float)  # mg/dL

    # Pain scale
    escala_dolor = Column(Integer)  # 0-10

    # Timestamp
    fecha_hora_registro = Column(DateTime, nullable=False)

    # Notes
    notas = Column(Text)

    # Relationships
    encuentro = relationship("EncuentroClinico", back_populates="signos_vitales")

    def __repr__(self):
        return f"<SignoVital(id={self.id}, encuentro_id={self.encuentro_id})>"


class Diagnostico(Base):
    """
    Diagnostico - Diagnosis (CIE-10)
    """

    __tablename__ = "diagnosticos"

    # Foreign Keys
    encuentro_id = Column(Integer, ForeignKey("encuentros_clinicos.id"), nullable=False, index=True)

    # CIE-10 (ICD-10)
    codigo_cie10 = Column(String(10), nullable=False, index=True)
    descripcion = Column(Text, nullable=False)

    # Type
    tipo = Column(Enum(TipoDiagnostico), nullable=False, default=TipoDiagnostico.PRESUNTIVO)
    es_principal = Column(Boolean, default=False)

    # Notes
    notas = Column(Text)

    # Relationships
    encuentro = relationship("EncuentroClinico", back_populates="diagnosticos")

    def __repr__(self):
        return f"<Diagnostico(id={self.id}, codigo_cie10='{self.codigo_cie10}')>"


class Procedimiento(Base):
    """
    Procedimiento - Procedure performed
    """

    __tablename__ = "procedimientos"

    # Foreign Keys
    encuentro_id = Column(Integer, ForeignKey("encuentros_clinicos.id"), nullable=False, index=True)

    # Procedure details
    codigo = Column(String(50), index=True)
    nombre = Column(String(255), nullable=False)
    descripcion = Column(Text)

    # Execution
    fecha_hora_inicio = Column(DateTime, nullable=False)
    fecha_hora_fin = Column(DateTime)
    realizado_por_id = Column(Integer, ForeignKey("usuarios.id"))

    # Results
    resultado = Column(Text)
    complicaciones = Column(Text)

    # Billing
    precio = Column(Float)

    # Relationships
    encuentro = relationship("EncuentroClinico", back_populates="procedimientos")

    def __repr__(self):
        return f"<Procedimiento(id={self.id}, nombre='{self.nombre}')>"
