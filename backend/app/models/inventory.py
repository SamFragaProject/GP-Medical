"""
Inventory and pharmacy models
"""

from sqlalchemy import Column, Integer, String, Boolean, Text, Date, DateTime, Float, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class TipoProducto(str, enum.Enum):
    """Product type"""
    MEDICAMENTO = "medicamento"
    MATERIAL_CURACION = "material_curacion"
    INSUMO_MEDICO = "insumo_medico"
    EQUIPO = "equipo"
    OTRO = "otro"


class TipoMovimiento(str, enum.Enum):
    """Inventory movement type"""
    ENTRADA_COMPRA = "entrada_compra"
    ENTRADA_DEVOLUCION = "entrada_devolucion"
    ENTRADA_AJUSTE = "entrada_ajuste"
    SALIDA_VENTA = "salida_venta"
    SALIDA_USO = "salida_uso"
    SALIDA_MERMA = "salida_merma"
    SALIDA_AJUSTE = "salida_ajuste"
    TRANSFERENCIA = "transferencia"


class Producto(Base):
    """
    Producto - Product/medication catalog
    """

    __tablename__ = "productos"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)

    # Basic Information
    codigo = Column(String(50), nullable=False, index=True)
    nombre = Column(String(255), nullable=False, index=True)
    nombre_generico = Column(String(255))
    descripcion = Column(Text)

    # Classification
    tipo = Column(Enum(TipoProducto), nullable=False, index=True)
    categoria = Column(String(100), index=True)
    subcategoria = Column(String(100))

    # Medical Information (for medications)
    principio_activo = Column(String(255))
    concentracion = Column(String(100))
    presentacion = Column(String(100))
    via_administracion = Column(String(50))

    # Manufacturer
    laboratorio = Column(String(255))
    fabricante = Column(String(255))

    # Identifiers
    codigo_barras = Column(String(50), unique=True, index=True)
    registro_sanitario = Column(String(100))

    # Inventory Control
    requiere_lote = Column(Boolean, default=True)
    requiere_caducidad = Column(Boolean, default=True)
    manejo_controlado = Column(Boolean, default=False)  # Controlled substance
    requiere_refrigeracion = Column(Boolean, default=False)

    # Stock Levels
    stock_minimo = Column(Integer, default=0)
    stock_maximo = Column(Integer)
    punto_reorden = Column(Integer)

    # Pricing
    precio_compra = Column(Float)
    precio_venta = Column(Float)
    iva = Column(Float, default=16.0)

    # Unit
    unidad_medida = Column(String(50), default="pieza")  # pieza, caja, frasco, etc.

    # Images
    imagen_url = Column(String(500))

    # Status
    activo = Column(Boolean, default=True, nullable=False)

    # Relationships
    lotes = relationship("Lote", back_populates="producto", cascade="all, delete-orphan")
    movimientos = relationship("MovimientoInventario", back_populates="producto")

    def __repr__(self):
        return f"<Producto(id={self.id}, codigo='{self.codigo}', nombre='{self.nombre}')>"


class Lote(Base):
    """
    Lote - Product batch/lot
    """

    __tablename__ = "lotes"

    # Foreign Keys
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False, index=True)
    proveedor_id = Column(Integer, ForeignKey("proveedores.id"), index=True)

    # Lot Information
    numero_lote = Column(String(100), nullable=False, index=True)
    fecha_fabricacion = Column(Date)
    fecha_caducidad = Column(Date, index=True)

    # Stock
    cantidad_inicial = Column(Float, nullable=False)
    cantidad_actual = Column(Float, nullable=False)

    # Purchase
    fecha_compra = Column(Date)
    precio_compra_unitario = Column(Float)
    numero_factura_compra = Column(String(100))

    # Location
    ubicacion = Column(String(100))  # Warehouse location

    # Status
    activo = Column(Boolean, default=True, nullable=False)
    bloqueado = Column(Boolean, default=False)  # Blocked (e.g., recall)
    motivo_bloqueo = Column(Text)

    # Relationships
    producto = relationship("Producto", back_populates="lotes")
    proveedor = relationship("Proveedor", back_populates="lotes")

    def __repr__(self):
        return f"<Lote(id={self.id}, numero_lote='{self.numero_lote}', producto_id={self.producto_id})>"


class MovimientoInventario(Base):
    """
    MovimientoInventario - Inventory movement (Kardex)
    """

    __tablename__ = "movimientos_inventario"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)
    producto_id = Column(Integer, ForeignKey("productos.id"), nullable=False, index=True)
    lote_id = Column(Integer, ForeignKey("lotes.id"), index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"), nullable=False)

    # Movement Type
    tipo = Column(Enum(TipoMovimiento), nullable=False, index=True)

    # Quantity
    cantidad = Column(Float, nullable=False)
    cantidad_anterior = Column(Float)
    cantidad_nueva = Column(Float)

    # Reference
    referencia = Column(String(255))  # Reference to source document
    receta_detalle_id = Column(Integer, ForeignKey("detalle_receta.id"))
    orden_cobro_id = Column(Integer, ForeignKey("ordenes_cobro.id"))

    # Date
    fecha_movimiento = Column(DateTime, nullable=False, index=True)

    # Details
    motivo = Column(String(255))
    notas = Column(Text)

    # Relationships
    producto = relationship("Producto", back_populates="movimientos")
    lote = relationship("Lote")

    def __repr__(self):
        return f"<MovimientoInventario(id={self.id}, tipo='{self.tipo}', cantidad={self.cantidad})>"


class Proveedor(Base):
    """
    Proveedor - Supplier
    """

    __tablename__ = "proveedores"

    # Foreign Keys
    empresa_id = Column(Integer, ForeignKey("empresas.id"), nullable=False, index=True)

    # Basic Information
    nombre = Column(String(255), nullable=False)
    razon_social = Column(String(255))
    rfc = Column(String(13), index=True)

    # Contact
    email = Column(String(255))
    telefono = Column(String(20))
    sitio_web = Column(String(255))

    # Contact Person
    contacto_nombre = Column(String(255))
    contacto_telefono = Column(String(20))
    contacto_email = Column(String(255))

    # Address
    direccion = Column(Text)
    ciudad = Column(String(100))
    estado = Column(String(100))
    codigo_postal = Column(String(10))
    pais = Column(String(2), default="MX")

    # Banking
    cuenta_bancaria = Column(String(50))
    banco = Column(String(100))
    clabe = Column(String(18))

    # Terms
    dias_credito = Column(Integer, default=0)
    descuento_pronto_pago = Column(Float, default=0)

    # Status
    activo = Column(Boolean, default=True, nullable=False)

    # Notes
    notas = Column(Text)

    # Relationships
    lotes = relationship("Lote", back_populates="proveedor")

    def __repr__(self):
        return f"<Proveedor(id={self.id}, nombre='{self.nombre}')>"
