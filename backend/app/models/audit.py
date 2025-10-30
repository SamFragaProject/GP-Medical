"""
Audit trail models
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base


class EventoAuditoria(Base):
    """
    EventoAuditoria - Audit trail event
    Logs all important actions in the system
    """

    __tablename__ = "eventos_auditoria"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), index=True)

    # Event details
    accion = Column(String(100), nullable=False, index=True)  # crear, leer, actualizar, eliminar
    modulo = Column(String(100), nullable=False, index=True)  # paciente, cita, factura, etc.
    entidad_tipo = Column(String(100), nullable=False)  # Model name
    entidad_id = Column(Integer, nullable=False, index=True)

    # Description
    descripcion = Column(Text)

    # Data (before and after for updates)
    datos_anteriores = Column(JSON)
    datos_nuevos = Column(JSON)

    # Metadata
    ip_address = Column(String(50))
    user_agent = Column(String(500))
    metadatos = Column(JSON)

    # Timestamp
    fecha_hora = Column(DateTime, nullable=False, index=True)

    # Relationships
    usuario = relationship("Usuario")

    def __repr__(self):
        return f"<EventoAuditoria(id={self.id}, accion='{self.accion}', modulo='{self.modulo}')>"
