"""
Billing and invoicing models (CFDI 4.0 México)
"""

from sqlalchemy import Column, Integer, String, Boolean, Text, Date, DateTime, Float, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class EstadoOrdenCobro(str, enum.Enum):
    """Payment order status"""
    PENDIENTE = "pendiente"
    PARCIALMENTE_PAGADA = "parcialmente_pagada"
    PAGADA = "pagada"
    CANCELADA = "cancelada"


class MetodoPago(str, enum.Enum):
    """Payment method"""
    EFECTIVO = "efectivo"
    TARJETA = "tarjeta"
    TRANSFERENCIA = "transferencia"
    CHEQUE = "cheque"
    DEPOSITO = "deposito"
    OTRO = "otro"


class EstadoFactura(str, enum.Enum):
    """Invoice status"""
    BORRADOR = "borrador"
    TIMBRADA = "timbrada"
    CANCELADA = "cancelada"


class TipoComprobante(str, enum.Enum):
    """CFDI document type"""
    INGRESO = "I"  # Income
    EGRESO = "E"  # Credit note
    TRASLADO = "T"  # Transfer
    PAGO = "P"  # Payment complement


class OrdenCobro(Base):
    """
    OrdenCobro - Payment order
    """

    __tablename__ = "ordenes_cobro"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), nullable=False, index=True)
    cita_id = Column(Integer, ForeignKey("citas.id"), index=True)
    usuario_cobro_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    # Reference
    folio = Column(String(50), unique=True, nullable=False, index=True)

    # Status
    estado = Column(Enum(EstadoOrdenCobro), nullable=False, default=EstadoOrdenCobro.PENDIENTE)

    # Amounts
    subtotal = Column(Float, nullable=False)
    descuento = Column(Float, default=0)
    iva = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    pagado = Column(Float, default=0)
    saldo = Column(Float, nullable=False)

    # Items (JSON for flexibility)
    conceptos = Column(JSON, nullable=False)  # List of items with description, qty, price

    # Dates
    fecha_emision = Column(Date, nullable=False)
    fecha_vencimiento = Column(Date)

    # Notes
    notas = Column(Text)

    # Relationships
    paciente = relationship("Paciente")
    pagos = relationship("Pago", back_populates="orden_cobro", cascade="all, delete-orphan")
    facturas = relationship("Factura", back_populates="orden_cobro")

    def __repr__(self):
        return f"<OrdenCobro(id={self.id}, folio='{self.folio}', total={self.total})>"


class Pago(Base):
    """
    Pago - Payment
    """

    __tablename__ = "pagos"

    # Foreign Keys
    orden_cobro_id = Column(Integer, ForeignKey("ordenes_cobro.id"), nullable=False, index=True)
    usuario_cobro_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    # Reference
    folio = Column(String(50), unique=True, nullable=False, index=True)

    # Payment details
    monto = Column(Float, nullable=False)
    metodo_pago = Column(Enum(MetodoPago), nullable=False)

    # Date
    fecha_pago = Column(DateTime, nullable=False)

    # Payment details
    referencia = Column(String(100))  # Check number, transfer reference, etc.
    autorizacion = Column(String(100))  # Card authorization
    ultimos_digitos_tarjeta = Column(String(4))

    # Cash register
    turno_caja = Column(String(50))
    corte_caja_id = Column(Integer)  # Reference to cash register close

    # Status
    confirmado = Column(Boolean, default=True)
    cancelado = Column(Boolean, default=False)
    fecha_cancelacion = Column(DateTime)
    motivo_cancelacion = Column(Text)

    # Notes
    notas = Column(Text)

    # Relationships
    orden_cobro = relationship("OrdenCobro", back_populates="pagos")

    def __repr__(self):
        return f"<Pago(id={self.id}, folio='{self.folio}', monto={self.monto})>"


class Factura(Base):
    """
    Factura - CFDI 4.0 Invoice (México)
    """

    __tablename__ = "facturas"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    paciente_id = Column(Integer, ForeignKey("pacientes.id"), index=True)
    orden_cobro_id = Column(Integer, ForeignKey("ordenes_cobro.id"), index=True)
    usuario_genera_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    # CFDI
    tipo_comprobante = Column(Enum(TipoComprobante), nullable=False)
    serie = Column(String(10), nullable=False)
    folio = Column(String(50), nullable=False, index=True)
    uuid = Column(String(36), unique=True, index=True)  # Folio fiscal

    # Status
    estado = Column(Enum(EstadoFactura), nullable=False, default=EstadoFactura.BORRADOR)

    # Dates
    fecha_emision = Column(DateTime, nullable=False)
    fecha_timbrado = Column(DateTime)
    fecha_cancelacion = Column(DateTime)

    # Emisor (from Empresa)
    emisor_rfc = Column(String(13), nullable=False)
    emisor_nombre = Column(String(255), nullable=False)
    emisor_regimen_fiscal = Column(String(10), nullable=False)

    # Receptor (Patient or customer)
    receptor_rfc = Column(String(13), nullable=False)
    receptor_nombre = Column(String(255), nullable=False)
    receptor_uso_cfdi = Column(String(10), nullable=False)  # G01, G03, etc.
    receptor_regimen_fiscal = Column(String(10))
    receptor_domicilio_fiscal = Column(String(10))  # ZIP code

    # Amounts
    subtotal = Column(Float, nullable=False)
    descuento = Column(Float, default=0)
    total_impuestos_trasladados = Column(Float, default=0)
    total_impuestos_retenidos = Column(Float, default=0)
    total = Column(Float, nullable=False)

    # Payment
    forma_pago = Column(String(10))  # 01=Efectivo, 03=Transferencia, etc.
    metodo_pago = Column(String(10))  # PUE=Pago en una exhibición, PPD=Pago diferido
    moneda = Column(String(10), default="MXN")

    # Conceptos (items)
    conceptos = Column(JSON, nullable=False)

    # PAC (Proveedor Autorizado de Certificación)
    pac_proveedor = Column(String(50))
    pac_certificado = Column(String(100))
    sello_digital_cfdi = Column(Text)
    sello_digital_sat = Column(Text)
    cadena_original = Column(Text)
    numero_certificado_sat = Column(String(100))
    fecha_certificacion = Column(DateTime)

    # Files
    xml_url = Column(String(500))
    pdf_url = Column(String(500))

    # Cancellation
    motivo_cancelacion = Column(Text)
    uuid_sustitucion = Column(String(36))  # If replacing another invoice

    # Related documents
    cfdi_relacionado_uuid = Column(String(36))  # For credit notes
    tipo_relacion = Column(String(10))  # 01=Nota de crédito, etc.

    # Notes
    notas = Column(Text)

    # Relationships
    paciente = relationship("Paciente")
    orden_cobro = relationship("OrdenCobro", back_populates="facturas")
    complementos_pago = relationship("ComplementoPago", back_populates="factura", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Factura(id={self.id}, serie='{self.serie}', folio='{self.folio}', uuid='{self.uuid}')>"


class ComplementoPago(Base):
    """
    ComplementoPago - Payment complement (CFDI Pago 2.0)
    """

    __tablename__ = "complementos_pago"

    # Foreign Keys
    factura_id = Column(Integer, ForeignKey("facturas.id"), nullable=False, index=True)
    pago_id = Column(Integer, ForeignKey("pagos.id"), index=True)

    # CFDI
    uuid = Column(String(36), unique=True, index=True)

    # Payment details
    fecha_pago = Column(Date, nullable=False)
    forma_pago = Column(String(10), nullable=False)
    moneda = Column(String(10), default="MXN")
    monto = Column(Float, nullable=False)

    # Related documents
    documentos_relacionados = Column(JSON)  # List of related invoices

    # Status
    estado = Column(Enum(EstadoFactura), nullable=False, default=EstadoFactura.BORRADOR)
    fecha_timbrado = Column(DateTime)
    fecha_cancelacion = Column(DateTime)

    # Files
    xml_url = Column(String(500))
    pdf_url = Column(String(500))

    # Relationships
    factura = relationship("Factura", back_populates="complementos_pago")

    def __repr__(self):
        return f"<ComplementoPago(id={self.id}, uuid='{self.uuid}')>"
