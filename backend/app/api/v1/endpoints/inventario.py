"""
Inventario y Farmacia endpoints
Gestión completa de inventario, productos, lotes, movimientos y proveedores
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from app.core.database import async_session
from app.models.inventory import (
    Producto,
    Lote,
    MovimientoInventario,
    Proveedor,
    TipoProducto,
    TipoMovimiento,
)

router = APIRouter()

# ============================================================================
# SCHEMAS - PRODUCTOS
# ============================================================================

class ProductoBase(BaseModel):
    codigo: str
    nombre: str
    nombre_generico: Optional[str] = None
    descripcion: Optional[str] = None
    tipo: TipoProducto
    categoria: Optional[str] = None
    subcategoria: Optional[str] = None
    principio_activo: Optional[str] = None
    concentracion: Optional[str] = None
    presentacion: Optional[str] = None
    via_administracion: Optional[str] = None
    laboratorio: Optional[str] = None
    fabricante: Optional[str] = None
    codigo_barras: Optional[str] = None
    registro_sanitario: Optional[str] = None
    requiere_lote: bool = True
    requiere_caducidad: bool = True
    manejo_controlado: bool = False
    requiere_refrigeracion: bool = False
    stock_minimo: int = 0
    stock_maximo: Optional[int] = None
    punto_reorden: Optional[int] = None
    precio_compra: Optional[float] = None
    precio_venta: Optional[float] = None
    iva: float = 16.0
    unidad_medida: str = "pieza"
    imagen_url: Optional[str] = None
    activo: bool = True


class ProductoCreate(ProductoBase):
    empresa_id: int


class ProductoUpdate(BaseModel):
    nombre: Optional[str] = None
    nombre_generico: Optional[str] = None
    descripcion: Optional[str] = None
    categoria: Optional[str] = None
    subcategoria: Optional[str] = None
    stock_minimo: Optional[int] = None
    stock_maximo: Optional[int] = None
    punto_reorden: Optional[int] = None
    precio_compra: Optional[float] = None
    precio_venta: Optional[float] = None
    iva: Optional[float] = None
    activo: Optional[bool] = None


class ProductoResponse(ProductoBase):
    id: int
    empresa_id: int
    stock_actual: float = 0
    lotes_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS - LOTES
# ============================================================================

class LoteBase(BaseModel):
    numero_lote: str
    fecha_fabricacion: Optional[date] = None
    fecha_caducidad: Optional[date] = None
    cantidad_inicial: float
    fecha_compra: Optional[date] = None
    precio_compra_unitario: Optional[float] = None
    numero_factura_compra: Optional[str] = None
    ubicacion: Optional[str] = None
    activo: bool = True


class LoteCreate(LoteBase):
    producto_id: int
    proveedor_id: Optional[int] = None


class LoteUpdate(BaseModel):
    ubicacion: Optional[str] = None
    activo: Optional[bool] = None
    bloqueado: Optional[bool] = None
    motivo_bloqueo: Optional[str] = None


class LoteResponse(LoteBase):
    id: int
    producto_id: int
    proveedor_id: Optional[int] = None
    cantidad_actual: float
    bloqueado: bool
    motivo_bloqueo: Optional[str] = None
    dias_para_caducar: Optional[int] = None
    estado_caducidad: str  # "vigente", "proximo", "caducado"
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS - MOVIMIENTOS
# ============================================================================

class MovimientoBase(BaseModel):
    producto_id: int
    lote_id: Optional[int] = None
    tipo: TipoMovimiento
    cantidad: float
    referencia: Optional[str] = None
    motivo: Optional[str] = None
    notas: Optional[str] = None


class MovimientoCreate(MovimientoBase):
    empresa_id: int
    usuario_id: int


class MovimientoResponse(MovimientoBase):
    id: int
    empresa_id: int
    usuario_id: int
    cantidad_anterior: Optional[float] = None
    cantidad_nueva: Optional[float] = None
    fecha_movimiento: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS - PROVEEDORES
# ============================================================================

class ProveedorBase(BaseModel):
    nombre: str
    razon_social: Optional[str] = None
    rfc: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    sitio_web: Optional[str] = None
    contacto_nombre: Optional[str] = None
    contacto_telefono: Optional[str] = None
    contacto_email: Optional[str] = None
    direccion: Optional[str] = None
    ciudad: Optional[str] = None
    estado: Optional[str] = None
    codigo_postal: Optional[str] = None
    pais: str = "MX"
    cuenta_bancaria: Optional[str] = None
    banco: Optional[str] = None
    clabe: Optional[str] = None
    dias_credito: int = 0
    descuento_pronto_pago: float = 0
    activo: bool = True
    notas: Optional[str] = None


class ProveedorCreate(ProveedorBase):
    empresa_id: int


class ProveedorUpdate(BaseModel):
    nombre: Optional[str] = None
    razon_social: Optional[str] = None
    email: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    activo: Optional[bool] = None


class ProveedorResponse(ProveedorBase):
    id: int
    empresa_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# PRODUCTOS ENDPOINTS
# ============================================================================

@router.get("/productos", response_model=List[ProductoResponse])
async def list_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    search: Optional[str] = None,
    tipo: Optional[TipoProducto] = None,
    categoria: Optional[str] = None,
    activo: Optional[bool] = None,
    solo_bajo_stock: bool = False,
):
    """Lista todos los productos con filtros opcionales"""
    async with async_session() as session:
        query = select(Producto).options(selectinload(Producto.lotes))

        # Filtros
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Producto.nombre.ilike(search_pattern),
                    Producto.codigo.ilike(search_pattern),
                    Producto.codigo_barras.ilike(search_pattern),
                    Producto.nombre_generico.ilike(search_pattern),
                )
            )

        if tipo:
            query = query.where(Producto.tipo == tipo)

        if categoria:
            query = query.where(Producto.categoria == categoria)

        if activo is not None:
            query = query.where(Producto.activo == activo)

        # Ordenar por nombre
        query = query.order_by(Producto.nombre).offset(skip).limit(limit)

        result = await session.execute(query)
        productos = result.scalars().all()

        # Calcular stock actual y enriquecer respuesta
        response = []
        for producto in productos:
            # Calcular stock actual sumando cantidad_actual de todos los lotes activos
            stock_actual = sum(
                lote.cantidad_actual for lote in producto.lotes if lote.activo
            )

            # Filtro de bajo stock
            if solo_bajo_stock and stock_actual > producto.stock_minimo:
                continue

            producto_dict = {
                "id": producto.id,
                "empresa_id": producto.empresa_id,
                "codigo": producto.codigo,
                "nombre": producto.nombre,
                "nombre_generico": producto.nombre_generico,
                "descripcion": producto.descripcion,
                "tipo": producto.tipo,
                "categoria": producto.categoria,
                "subcategoria": producto.subcategoria,
                "principio_activo": producto.principio_activo,
                "concentracion": producto.concentracion,
                "presentacion": producto.presentacion,
                "via_administracion": producto.via_administracion,
                "laboratorio": producto.laboratorio,
                "fabricante": producto.fabricante,
                "codigo_barras": producto.codigo_barras,
                "registro_sanitario": producto.registro_sanitario,
                "requiere_lote": producto.requiere_lote,
                "requiere_caducidad": producto.requiere_caducidad,
                "manejo_controlado": producto.manejo_controlado,
                "requiere_refrigeracion": producto.requiere_refrigeracion,
                "stock_minimo": producto.stock_minimo,
                "stock_maximo": producto.stock_maximo,
                "punto_reorden": producto.punto_reorden,
                "precio_compra": producto.precio_compra,
                "precio_venta": producto.precio_venta,
                "iva": producto.iva,
                "unidad_medida": producto.unidad_medida,
                "imagen_url": producto.imagen_url,
                "activo": producto.activo,
                "stock_actual": stock_actual,
                "lotes_count": len([l for l in producto.lotes if l.activo]),
                "created_at": producto.created_at,
                "updated_at": producto.updated_at,
            }
            response.append(ProductoResponse(**producto_dict))

        return response


@router.get("/productos/{producto_id}", response_model=ProductoResponse)
async def get_producto(producto_id: int):
    """Obtiene un producto por ID con su stock actual"""
    async with async_session() as session:
        query = select(Producto).options(selectinload(Producto.lotes)).where(Producto.id == producto_id)
        result = await session.execute(query)
        producto = result.scalar_one_or_none()

        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        stock_actual = sum(lote.cantidad_actual for lote in producto.lotes if lote.activo)

        producto_dict = {
            "id": producto.id,
            "empresa_id": producto.empresa_id,
            "codigo": producto.codigo,
            "nombre": producto.nombre,
            "nombre_generico": producto.nombre_generico,
            "descripcion": producto.descripcion,
            "tipo": producto.tipo,
            "categoria": producto.categoria,
            "subcategoria": producto.subcategoria,
            "principio_activo": producto.principio_activo,
            "concentracion": producto.concentracion,
            "presentacion": producto.presentacion,
            "via_administracion": producto.via_administracion,
            "laboratorio": producto.laboratorio,
            "fabricante": producto.fabricante,
            "codigo_barras": producto.codigo_barras,
            "registro_sanitario": producto.registro_sanitario,
            "requiere_lote": producto.requiere_lote,
            "requiere_caducidad": producto.requiere_caducidad,
            "manejo_controlado": producto.manejo_controlado,
            "requiere_refrigeracion": producto.requiere_refrigeracion,
            "stock_minimo": producto.stock_minimo,
            "stock_maximo": producto.stock_maximo,
            "punto_reorden": producto.punto_reorden,
            "precio_compra": producto.precio_compra,
            "precio_venta": producto.precio_venta,
            "iva": producto.iva,
            "unidad_medida": producto.unidad_medida,
            "imagen_url": producto.imagen_url,
            "activo": producto.activo,
            "stock_actual": stock_actual,
            "lotes_count": len([l for l in producto.lotes if l.activo]),
            "created_at": producto.created_at,
            "updated_at": producto.updated_at,
        }

        return ProductoResponse(**producto_dict)


@router.post("/productos", response_model=ProductoResponse)
async def create_producto(producto_data: ProductoCreate):
    """Crea un nuevo producto"""
    async with async_session() as session:
        # Verificar si el código ya existe
        query = select(Producto).where(
            and_(
                Producto.codigo == producto_data.codigo,
                Producto.empresa_id == producto_data.empresa_id,
            )
        )
        result = await session.execute(query)
        existing = result.scalar_one_or_none()

        if existing:
            raise HTTPException(
                status_code=400, detail=f"Ya existe un producto con el código '{producto_data.codigo}'"
            )

        # Crear producto
        producto = Producto(**producto_data.model_dump())
        session.add(producto)
        await session.commit()
        await session.refresh(producto)

        # Preparar respuesta
        producto_dict = {
            **producto_data.model_dump(),
            "id": producto.id,
            "stock_actual": 0,
            "lotes_count": 0,
            "created_at": producto.created_at,
            "updated_at": producto.updated_at,
        }

        return ProductoResponse(**producto_dict)


@router.put("/productos/{producto_id}", response_model=ProductoResponse)
async def update_producto(producto_id: int, producto_data: ProductoUpdate):
    """Actualiza un producto existente"""
    async with async_session() as session:
        query = select(Producto).options(selectinload(Producto.lotes)).where(Producto.id == producto_id)
        result = await session.execute(query)
        producto = result.scalar_one_or_none()

        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        # Actualizar campos
        for field, value in producto_data.model_dump(exclude_unset=True).items():
            setattr(producto, field, value)

        await session.commit()
        await session.refresh(producto)

        stock_actual = sum(lote.cantidad_actual for lote in producto.lotes if lote.activo)

        producto_dict = {
            "id": producto.id,
            "empresa_id": producto.empresa_id,
            "codigo": producto.codigo,
            "nombre": producto.nombre,
            "nombre_generico": producto.nombre_generico,
            "descripcion": producto.descripcion,
            "tipo": producto.tipo,
            "categoria": producto.categoria,
            "subcategoria": producto.subcategoria,
            "principio_activo": producto.principio_activo,
            "concentracion": producto.concentracion,
            "presentacion": producto.presentacion,
            "via_administracion": producto.via_administracion,
            "laboratorio": producto.laboratorio,
            "fabricante": producto.fabricante,
            "codigo_barras": producto.codigo_barras,
            "registro_sanitario": producto.registro_sanitario,
            "requiere_lote": producto.requiere_lote,
            "requiere_caducidad": producto.requiere_caducidad,
            "manejo_controlado": producto.manejo_controlado,
            "requiere_refrigeracion": producto.requiere_refrigeracion,
            "stock_minimo": producto.stock_minimo,
            "stock_maximo": producto.stock_maximo,
            "punto_reorden": producto.punto_reorden,
            "precio_compra": producto.precio_compra,
            "precio_venta": producto.precio_venta,
            "iva": producto.iva,
            "unidad_medida": producto.unidad_medida,
            "imagen_url": producto.imagen_url,
            "activo": producto.activo,
            "stock_actual": stock_actual,
            "lotes_count": len([l for l in producto.lotes if l.activo]),
            "created_at": producto.created_at,
            "updated_at": producto.updated_at,
        }

        return ProductoResponse(**producto_dict)


@router.delete("/productos/{producto_id}")
async def delete_producto(producto_id: int):
    """Desactiva un producto (soft delete)"""
    async with async_session() as session:
        query = select(Producto).where(Producto.id == producto_id)
        result = await session.execute(query)
        producto = result.scalar_one_or_none()

        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        producto.activo = False
        await session.commit()

        return {"message": "Producto desactivado exitosamente"}


# ============================================================================
# LOTES ENDPOINTS
# ============================================================================

@router.get("/lotes", response_model=List[LoteResponse])
async def list_lotes(
    producto_id: Optional[int] = None,
    activo: Optional[bool] = None,
    proximo_a_caducar: bool = False,
    dias_alerta: int = 90,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
):
    """Lista todos los lotes con filtros opcionales"""
    async with async_session() as session:
        query = select(Lote)

        # Filtros
        if producto_id:
            query = query.where(Lote.producto_id == producto_id)

        if activo is not None:
            query = query.where(Lote.activo == activo)

        # Ordenar por fecha de caducidad
        query = query.order_by(Lote.fecha_caducidad.asc()).offset(skip).limit(limit)

        result = await session.execute(query)
        lotes = result.scalars().all()

        # Enriquecer respuesta con información de caducidad
        response = []
        hoy = date.today()
        for lote in lotes:
            dias_para_caducar = None
            estado_caducidad = "vigente"

            if lote.fecha_caducidad:
                dias_para_caducar = (lote.fecha_caducidad - hoy).days

                if dias_para_caducar < 0:
                    estado_caducidad = "caducado"
                elif dias_para_caducar <= dias_alerta:
                    estado_caducidad = "proximo"
                else:
                    estado_caducidad = "vigente"

            # Filtro de próximo a caducar
            if proximo_a_caducar and estado_caducidad != "proximo":
                continue

            lote_dict = {
                "id": lote.id,
                "producto_id": lote.producto_id,
                "proveedor_id": lote.proveedor_id,
                "numero_lote": lote.numero_lote,
                "fecha_fabricacion": lote.fecha_fabricacion,
                "fecha_caducidad": lote.fecha_caducidad,
                "cantidad_inicial": lote.cantidad_inicial,
                "cantidad_actual": lote.cantidad_actual,
                "fecha_compra": lote.fecha_compra,
                "precio_compra_unitario": lote.precio_compra_unitario,
                "numero_factura_compra": lote.numero_factura_compra,
                "ubicacion": lote.ubicacion,
                "activo": lote.activo,
                "bloqueado": lote.bloqueado,
                "motivo_bloqueo": lote.motivo_bloqueo,
                "dias_para_caducar": dias_para_caducar,
                "estado_caducidad": estado_caducidad,
                "created_at": lote.created_at,
                "updated_at": lote.updated_at,
            }
            response.append(LoteResponse(**lote_dict))

        return response


@router.post("/lotes", response_model=LoteResponse)
async def create_lote(lote_data: LoteCreate):
    """Crea un nuevo lote y registra entrada en Kardex"""
    async with async_session() as session:
        # Verificar que el producto existe
        query = select(Producto).where(Producto.id == lote_data.producto_id)
        result = await session.execute(query)
        producto = result.scalar_one_or_none()

        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        # Crear lote
        lote = Lote(
            **lote_data.model_dump(),
            cantidad_actual=lote_data.cantidad_inicial,
        )
        session.add(lote)
        await session.flush()

        # Registrar movimiento de entrada
        movimiento = MovimientoInventario(
            empresa_id=producto.empresa_id,
            producto_id=lote_data.producto_id,
            lote_id=lote.id,
            usuario_id=1,  # TODO: Get from auth context
            tipo=TipoMovimiento.ENTRADA_COMPRA,
            cantidad=lote_data.cantidad_inicial,
            cantidad_anterior=0,
            cantidad_nueva=lote_data.cantidad_inicial,
            fecha_movimiento=datetime.utcnow(),
            referencia=lote_data.numero_factura_compra,
            motivo="Entrada de nuevo lote",
        )
        session.add(movimiento)

        await session.commit()
        await session.refresh(lote)

        # Preparar respuesta
        hoy = date.today()
        dias_para_caducar = None
        estado_caducidad = "vigente"

        if lote.fecha_caducidad:
            dias_para_caducar = (lote.fecha_caducidad - hoy).days
            if dias_para_caducar < 0:
                estado_caducidad = "caducado"
            elif dias_para_caducar <= 90:
                estado_caducidad = "proximo"

        lote_dict = {
            **lote_data.model_dump(),
            "id": lote.id,
            "cantidad_actual": lote.cantidad_actual,
            "bloqueado": lote.bloqueado,
            "motivo_bloqueo": lote.motivo_bloqueo,
            "dias_para_caducar": dias_para_caducar,
            "estado_caducidad": estado_caducidad,
            "created_at": lote.created_at,
            "updated_at": lote.updated_at,
        }

        return LoteResponse(**lote_dict)


@router.put("/lotes/{lote_id}", response_model=LoteResponse)
async def update_lote(lote_id: int, lote_data: LoteUpdate):
    """Actualiza un lote existente"""
    async with async_session() as session:
        query = select(Lote).where(Lote.id == lote_id)
        result = await session.execute(query)
        lote = result.scalar_one_or_none()

        if not lote:
            raise HTTPException(status_code=404, detail="Lote no encontrado")

        # Actualizar campos
        for field, value in lote_data.model_dump(exclude_unset=True).items():
            setattr(lote, field, value)

        await session.commit()
        await session.refresh(lote)

        # Preparar respuesta
        hoy = date.today()
        dias_para_caducar = None
        estado_caducidad = "vigente"

        if lote.fecha_caducidad:
            dias_para_caducar = (lote.fecha_caducidad - hoy).days
            if dias_para_caducar < 0:
                estado_caducidad = "caducado"
            elif dias_para_caducar <= 90:
                estado_caducidad = "proximo"

        lote_dict = {
            "id": lote.id,
            "producto_id": lote.producto_id,
            "proveedor_id": lote.proveedor_id,
            "numero_lote": lote.numero_lote,
            "fecha_fabricacion": lote.fecha_fabricacion,
            "fecha_caducidad": lote.fecha_caducidad,
            "cantidad_inicial": lote.cantidad_inicial,
            "cantidad_actual": lote.cantidad_actual,
            "fecha_compra": lote.fecha_compra,
            "precio_compra_unitario": lote.precio_compra_unitario,
            "numero_factura_compra": lote.numero_factura_compra,
            "ubicacion": lote.ubicacion,
            "activo": lote.activo,
            "bloqueado": lote.bloqueado,
            "motivo_bloqueo": lote.motivo_bloqueo,
            "dias_para_caducar": dias_para_caducar,
            "estado_caducidad": estado_caducidad,
            "created_at": lote.created_at,
            "updated_at": lote.updated_at,
        }

        return LoteResponse(**lote_dict)


# ============================================================================
# MOVIMIENTOS (KARDEX) ENDPOINTS
# ============================================================================

@router.get("/movimientos", response_model=List[MovimientoResponse])
async def list_movimientos(
    producto_id: Optional[int] = None,
    tipo: Optional[TipoMovimiento] = None,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
):
    """Lista movimientos de inventario (Kardex) con filtros"""
    async with async_session() as session:
        query = select(MovimientoInventario)

        # Filtros
        if producto_id:
            query = query.where(MovimientoInventario.producto_id == producto_id)

        if tipo:
            query = query.where(MovimientoInventario.tipo == tipo)

        if fecha_desde:
            query = query.where(MovimientoInventario.fecha_movimiento >= fecha_desde)

        if fecha_hasta:
            fecha_hasta_dt = datetime.combine(fecha_hasta, datetime.max.time())
            query = query.where(MovimientoInventario.fecha_movimiento <= fecha_hasta_dt)

        # Ordenar por fecha descendente (más recientes primero)
        query = query.order_by(MovimientoInventario.fecha_movimiento.desc()).offset(skip).limit(limit)

        result = await session.execute(query)
        movimientos = result.scalars().all()

        return [MovimientoResponse.model_validate(mov) for mov in movimientos]


@router.post("/movimientos", response_model=MovimientoResponse)
async def create_movimiento(movimiento_data: MovimientoCreate):
    """Registra un movimiento de inventario y actualiza el stock del lote"""
    async with async_session() as session:
        # Verificar producto
        query = select(Producto).where(Producto.id == movimiento_data.producto_id)
        result = await session.execute(query)
        producto = result.scalar_one_or_none()

        if not producto:
            raise HTTPException(status_code=404, detail="Producto no encontrado")

        # Obtener lote si se especificó
        lote = None
        if movimiento_data.lote_id:
            query = select(Lote).where(Lote.id == movimiento_data.lote_id)
            result = await session.execute(query)
            lote = result.scalar_one_or_none()

            if not lote:
                raise HTTPException(status_code=404, detail="Lote no encontrado")

            if lote.producto_id != movimiento_data.producto_id:
                raise HTTPException(status_code=400, detail="El lote no pertenece al producto especificado")

            if lote.bloqueado:
                raise HTTPException(status_code=400, detail="El lote está bloqueado")

            # Calcular cantidades
            cantidad_anterior = lote.cantidad_actual

            # Determinar si es entrada o salida
            if movimiento_data.tipo in [
                TipoMovimiento.ENTRADA_COMPRA,
                TipoMovimiento.ENTRADA_DEVOLUCION,
                TipoMovimiento.ENTRADA_AJUSTE,
            ]:
                cantidad_nueva = cantidad_anterior + movimiento_data.cantidad
            else:  # Salidas
                cantidad_nueva = cantidad_anterior - movimiento_data.cantidad

            # Verificar stock suficiente para salidas
            if cantidad_nueva < 0:
                raise HTTPException(
                    status_code=400,
                    detail=f"Stock insuficiente. Disponible: {cantidad_anterior}, Solicitado: {movimiento_data.cantidad}",
                )

            # Actualizar cantidad del lote
            lote.cantidad_actual = cantidad_nueva
        else:
            cantidad_anterior = None
            cantidad_nueva = None

        # Crear movimiento
        movimiento = MovimientoInventario(
            **movimiento_data.model_dump(),
            cantidad_anterior=cantidad_anterior,
            cantidad_nueva=cantidad_nueva,
            fecha_movimiento=datetime.utcnow(),
        )
        session.add(movimiento)

        await session.commit()
        await session.refresh(movimiento)

        return MovimientoResponse.model_validate(movimiento)


# ============================================================================
# PROVEEDORES ENDPOINTS
# ============================================================================

@router.get("/proveedores", response_model=List[ProveedorResponse])
async def list_proveedores(
    search: Optional[str] = None,
    activo: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
):
    """Lista todos los proveedores con filtros opcionales"""
    async with async_session() as session:
        query = select(Proveedor)

        # Filtros
        if search:
            search_pattern = f"%{search}%"
            query = query.where(
                or_(
                    Proveedor.nombre.ilike(search_pattern),
                    Proveedor.razon_social.ilike(search_pattern),
                    Proveedor.rfc.ilike(search_pattern),
                )
            )

        if activo is not None:
            query = query.where(Proveedor.activo == activo)

        query = query.order_by(Proveedor.nombre).offset(skip).limit(limit)

        result = await session.execute(query)
        proveedores = result.scalars().all()

        return [ProveedorResponse.model_validate(p) for p in proveedores]


@router.post("/proveedores", response_model=ProveedorResponse)
async def create_proveedor(proveedor_data: ProveedorCreate):
    """Crea un nuevo proveedor"""
    async with async_session() as session:
        proveedor = Proveedor(**proveedor_data.model_dump())
        session.add(proveedor)
        await session.commit()
        await session.refresh(proveedor)

        return ProveedorResponse.model_validate(proveedor)


@router.put("/proveedores/{proveedor_id}", response_model=ProveedorResponse)
async def update_proveedor(proveedor_id: int, proveedor_data: ProveedorUpdate):
    """Actualiza un proveedor existente"""
    async with async_session() as session:
        query = select(Proveedor).where(Proveedor.id == proveedor_id)
        result = await session.execute(query)
        proveedor = result.scalar_one_or_none()

        if not proveedor:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")

        # Actualizar campos
        for field, value in proveedor_data.model_dump(exclude_unset=True).items():
            setattr(proveedor, field, value)

        await session.commit()
        await session.refresh(proveedor)

        return ProveedorResponse.model_validate(proveedor)


@router.delete("/proveedores/{proveedor_id}")
async def delete_proveedor(proveedor_id: int):
    """Desactiva un proveedor (soft delete)"""
    async with async_session() as session:
        query = select(Proveedor).where(Proveedor.id == proveedor_id)
        result = await session.execute(query)
        proveedor = result.scalar_one_or_none()

        if not proveedor:
            raise HTTPException(status_code=404, detail="Proveedor no encontrado")

        proveedor.activo = False
        await session.commit()

        return {"message": "Proveedor desactivado exitosamente"}


# ============================================================================
# ALERTAS Y REPORTES
# ============================================================================

@router.get("/alertas/stock-bajo")
async def get_alertas_stock_bajo():
    """Obtiene productos con stock bajo (por debajo del mínimo)"""
    async with async_session() as session:
        query = select(Producto).options(selectinload(Producto.lotes)).where(Producto.activo == True)

        result = await session.execute(query)
        productos = result.scalars().all()

        alertas = []
        for producto in productos:
            stock_actual = sum(lote.cantidad_actual for lote in producto.lotes if lote.activo)

            if stock_actual <= producto.stock_minimo:
                alertas.append(
                    {
                        "producto_id": producto.id,
                        "codigo": producto.codigo,
                        "nombre": producto.nombre,
                        "stock_actual": stock_actual,
                        "stock_minimo": producto.stock_minimo,
                        "diferencia": producto.stock_minimo - stock_actual,
                        "nivel_criticidad": "critico" if stock_actual == 0 else "bajo",
                    }
                )

        return {"total": len(alertas), "alertas": alertas}


@router.get("/alertas/caducidad")
async def get_alertas_caducidad(dias_alerta: int = Query(90, ge=1, le=365)):
    """Obtiene lotes próximos a caducar o caducados"""
    async with async_session() as session:
        query = (
            select(Lote)
            .options(selectinload(Lote.producto))
            .where(and_(Lote.activo == True, Lote.cantidad_actual > 0, Lote.fecha_caducidad.isnot(None)))
            .order_by(Lote.fecha_caducidad.asc())
        )

        result = await session.execute(query)
        lotes = result.scalars().all()

        hoy = date.today()
        fecha_limite = hoy + timedelta(days=dias_alerta)

        caducados = []
        proximos = []

        for lote in lotes:
            if lote.fecha_caducidad:
                dias_para_caducar = (lote.fecha_caducidad - hoy).days

                lote_info = {
                    "lote_id": lote.id,
                    "producto_id": lote.producto_id,
                    "producto_nombre": lote.producto.nombre,
                    "numero_lote": lote.numero_lote,
                    "fecha_caducidad": lote.fecha_caducidad.isoformat(),
                    "dias_para_caducar": dias_para_caducar,
                    "cantidad_actual": lote.cantidad_actual,
                }

                if dias_para_caducar < 0:
                    lote_info["nivel_criticidad"] = "caducado"
                    caducados.append(lote_info)
                elif lote.fecha_caducidad <= fecha_limite:
                    if dias_para_caducar <= 30:
                        lote_info["nivel_criticidad"] = "critico"
                    elif dias_para_caducar <= 60:
                        lote_info["nivel_criticidad"] = "urgente"
                    else:
                        lote_info["nivel_criticidad"] = "advertencia"
                    proximos.append(lote_info)

        return {
            "total": len(caducados) + len(proximos),
            "caducados": {"total": len(caducados), "lotes": caducados},
            "proximos_a_caducar": {"total": len(proximos), "lotes": proximos},
        }


@router.get("/estadisticas/inventario")
async def get_estadisticas_inventario():
    """Obtiene estadísticas generales del inventario"""
    async with async_session() as session:
        # Total de productos
        query = select(func.count(Producto.id)).where(Producto.activo == True)
        result = await session.execute(query)
        total_productos = result.scalar()

        # Productos por tipo
        query = select(Producto.tipo, func.count(Producto.id)).where(Producto.activo == True).group_by(Producto.tipo)
        result = await session.execute(query)
        productos_por_tipo = {tipo: count for tipo, count in result.all()}

        # Total de lotes activos
        query = select(func.count(Lote.id)).where(Lote.activo == True)
        result = await session.execute(query)
        total_lotes = result.scalar()

        # Valor total del inventario
        query = select(Lote).options(selectinload(Lote.producto)).where(Lote.activo == True)
        result = await session.execute(query)
        lotes = result.scalars().all()

        valor_inventario = sum(
            lote.cantidad_actual * (lote.producto.precio_compra or 0) for lote in lotes
        )

        # Total de movimientos (último mes)
        fecha_inicio = datetime.utcnow() - timedelta(days=30)
        query = select(func.count(MovimientoInventario.id)).where(
            MovimientoInventario.fecha_movimiento >= fecha_inicio
        )
        result = await session.execute(query)
        movimientos_mes = result.scalar()

        return {
            "total_productos": total_productos,
            "productos_por_tipo": productos_por_tipo,
            "total_lotes": total_lotes,
            "valor_inventario": round(valor_inventario, 2),
            "movimientos_ultimo_mes": movimientos_mes,
        }
