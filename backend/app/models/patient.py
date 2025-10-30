"""
Patient-related models
"""

from sqlalchemy import Column, Integer, String, Boolean, Text, Date, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class TipoSangre(str, enum.Enum):
    """Blood types"""
    A_POSITIVO = "A+"
    A_NEGATIVO = "A-"
    B_POSITIVO = "B+"
    B_NEGATIVO = "B-"
    AB_POSITIVO = "AB+"
    AB_NEGATIVO = "AB-"
    O_POSITIVO = "O+"
    O_NEGATIVO = "O-"


class Genero(str, enum.Enum):
    """Gender options"""
    MASCULINO = "masculino"
    FEMENINO = "femenino"
    OTRO = "otro"
    PREFIERO_NO_DECIR = "prefiero_no_decir"


class Paciente(Base):
    """
    Paciente - Patient master record
    """

    __tablename__ = "pacientes"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)

    # Personal Information
    nombre = Column(String(100), nullable=False)
    apellido_paterno = Column(String(100), nullable=False)
    apellido_materno = Column(String(100))
    fecha_nacimiento = Column(Date, nullable=False)
    genero = Column(Enum(Genero), nullable=False)
    tipo_sangre = Column(Enum(TipoSangre))

    # Identification
    curp = Column(String(18), unique=True, index=True)
    rfc = Column(String(13), index=True)
    nss = Column(String(11), index=True)  # Número de Seguro Social
    numero_expediente = Column(String(50), unique=True, index=True)

    # Contact
    email = Column(String(255), index=True)
    telefono = Column(String(20))
    celular = Column(String(20))

    # Address
    direccion = Column(Text)
    colonia = Column(String(100))
    ciudad = Column(String(100))
    estado = Column(String(100))
    codigo_postal = Column(String(10))
    pais = Column(String(2), default="MX")

    # Insurance
    aseguradora = Column(String(255))
    numero_poliza = Column(String(100))
    vigencia_poliza = Column(Date)

    # Additional Info
    ocupacion = Column(String(100))
    estado_civil = Column(String(50))
    foto_url = Column(String(500))

    # Medical Info (summary)
    grupo_sanguineo = Column(String(10))
    factor_rh = Column(String(10))
    donador_organos = Column(Boolean, default=False)

    # Tags and Notes
    etiquetas = Column(JSON, default=[])  # ["diabetes", "hipertension", etc.]
    notas_generales = Column(Text)

    # Status
    activo = Column(Boolean, default=True, nullable=False)

    # Relationships
    empresa = relationship("Empresa", back_populates="pacientes")
    contactos_emergencia = relationship("ContactoEmergencia", back_populates="paciente", cascade="all, delete-orphan")
    alergias = relationship("Alergia", back_populates="paciente", cascade="all, delete-orphan")
    antecedentes = relationship("Antecedente", back_populates="paciente", cascade="all, delete-orphan")
    consentimientos = relationship("Consentimiento", back_populates="paciente", cascade="all, delete-orphan")
    documentos = relationship("DocumentoPaciente", back_populates="paciente", cascade="all, delete-orphan")
    citas = relationship("Cita", back_populates="paciente")
    encuentros_clinicos = relationship("EncuentroClinico", back_populates="paciente")

    def __repr__(self):
        return f"<Paciente(id={self.id}, nombre='{self.nombre} {self.apellido_paterno}')>"


class ContactoEmergencia(Base):
    """Emergency contact for a patient"""

    __tablename__ = "contactos_emergencia"

    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, index=True)

    nombre = Column(String(255), nullable=False)
    parentesco = Column(String(50), nullable=False)
    telefono = Column(String(20), nullable=False)
    celular = Column(String(20))
    email = Column(String(255))
    direccion = Column(Text)
    es_principal = Column(Boolean, default=False)

    paciente = relationship("Paciente", back_populates="contactos_emergencia")


class Alergia(Base):
    """Patient allergies"""

    __tablename__ = "alergias"

    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, index=True)

    tipo = Column(String(50), nullable=False)  # medicamento, alimento, ambiental, otro
    sustancia = Column(String(255), nullable=False)
    reaccion = Column(Text)
    severidad = Column(String(20))  # leve, moderada, severa
    fecha_deteccion = Column(Date)
    notas = Column(Text)
    activo = Column(Boolean, default=True)

    paciente = relationship("Paciente", back_populates="alergias")


class Antecedente(Base):
    """Patient medical history"""

    __tablename__ = "antecedentes"

    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, index=True)

    tipo = Column(String(50), nullable=False)  # personal, familiar, quirurgico, traumatico, etc.
    categoria = Column(String(100))
    descripcion = Column(Text, nullable=False)
    fecha = Column(Date)
    notas = Column(Text)
    activo = Column(Boolean, default=True)

    paciente = relationship("Paciente", back_populates="antecedentes")


class Consentimiento(Base):
    """Patient consents"""

    __tablename__ = "consentimientos"

    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, index=True)

    tipo = Column(String(100), nullable=False)
    titulo = Column(String(255), nullable=False)
    contenido = Column(Text, nullable=False)
    fecha_firma = Column(Date, nullable=False)
    firma_paciente_url = Column(String(500))  # Signature image
    testigo_nombre = Column(String(255))
    testigo_firma_url = Column(String(500))
    documento_url = Column(String(500))  # PDF del consentimiento firmado
    activo = Column(Boolean, default=True)

    paciente = relationship("Paciente", back_populates="consentimientos")


class DocumentoPaciente(Base):
    """Patient documents (PDFs, images, etc.)"""

    __tablename__ = "documentos_paciente"

    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, index=True)

    tipo = Column(String(50), nullable=False)  # identificacion, estudio, receta, factura, otro
    titulo = Column(String(255), nullable=False)
    descripcion = Column(Text)
    archivo_url = Column(String(500), nullable=False)
    archivo_nombre = Column(String(255), nullable=False)
    archivo_tipo = Column(String(50))  # MIME type
    archivo_tamano = Column(Integer)  # bytes
    fecha_documento = Column(Date)
    etiquetas = Column(JSON, default=[])

    paciente = relationship("Paciente", back_populates="documentos")
