"""
Facturación CFDI 4.0 con integración de Stripe
Gestión de órdenes de cobro, pagos, facturas y timbrado
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload
import uuid as uuid_lib
import os

from app.core.database import async_session
from app.models.billing import (
    OrdenCobro,
    Pago,
    Factura,
    ComplementoPago,
    EstadoOrdenCobro,
    MetodoPago,
    EstadoFactura,
    TipoComprobante,
)

router = APIRouter()

# Stripe integration (will be initialized with API key from environment)
try:
    import stripe
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_dummy_key")
    STRIPE_ENABLED = bool(os.getenv("STRIPE_SECRET_KEY"))
except ImportError:
    STRIPE_ENABLED = False
    print("Warning: Stripe not installed. Payment processing will be simulated.")

# ============================================================================
# SCHEMAS - ÓRDENES DE COBRO
# ============================================================================

class ConceptoOrden(BaseModel):
    clave_producto: str = Field(..., description="Clave del producto/servicio")
    descripcion: str
    cantidad: float
    precio_unitario: float
    descuento: float = 0
    iva_porcentaje: float = 16.0
    subtotal: float
    iva: float
    total: float


class OrdenCobroBase(BaseModel):
    paciente_id: int
    cita_id: Optional[int] = None
    conceptos: List[Dict[str, Any]]
    descuento: float = 0
    notas: Optional[str] = None
    fecha_vencimiento: Optional[date] = None


class OrdenCobroCreate(OrdenCobroBase):
    empresa_id: int
    usuario_cobro_id: int


class OrdenCobroUpdate(BaseModel):
    estado: Optional[EstadoOrdenCobro] = None
    notas: Optional[str] = None


class OrdenCobroResponse(OrdenCobroBase):
    id: int
    empresa_id: int
    usuario_cobro_id: int
    folio: str
    estado: EstadoOrdenCobro
    subtotal: float
    iva: float
    total: float
    pagado: float
    saldo: float
    fecha_emision: date
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# SCHEMAS - PAGOS
# ============================================================================

class PagoBase(BaseModel):
    orden_cobro_id: int
    monto: float
    metodo_pago: MetodoPago
    referencia: Optional[str] = None
    notas: Optional[str] = None


class PagoCreate(PagoBase):
    usuario_cobro_id: int


class PagoStripeCreate(BaseModel):
    """Crear pago con Stripe"""
    orden_cobro_id: int
    usuario_cobro_id: int
    amount: float
    currency: str = "mxn"
    payment_method_id: str
    customer_email: Optional[EmailStr] = None


class PagoResponse(PagoBase):
    id: int
    folio: str
    fecha_pago: datetime
    autorizacion: Optional[str] = None
    ultimos_digitos_tarjeta: Optional[str] = None
    confirmado: bool
    cancelado: bool
    created_at: datetime

    class Config:
        from_attributes = True


class StripePaymentIntentResponse(BaseModel):
    """Respuesta de Payment Intent de Stripe"""
    client_secret: str
    payment_intent_id: str
    amount: float
    currency: str
    status: str


# ============================================================================
# SCHEMAS - FACTURAS
# ============================================================================

class FacturaBase(BaseModel):
    orden_cobro_id: Optional[int] = None
    paciente_id: int
    tipo_comprobante: TipoComprobante = TipoComprobante.INGRESO
    serie: str
    receptor_rfc: str
    receptor_nombre: str
    receptor_uso_cfdi: str = "G03"
    receptor_domicilio_fiscal: Optional[str] = None
    forma_pago: str = "01"  # 01=Efectivo, 03=Transferencia, 04=Tarjeta
    metodo_pago: str = "PUE"  # PUE=Pago en una exhibición
    conceptos: List[Dict[str, Any]]
    notas: Optional[str] = None


class FacturaCreate(FacturaBase):
    empresa_id: int
    usuario_genera_id: int
    emisor_rfc: str
    emisor_nombre: str
    emisor_regimen_fiscal: str = "601"  # General de Ley Personas Morales


class FacturaUpdate(BaseModel):
    estado: Optional[EstadoFactura] = None
    notas: Optional[str] = None


class FacturaResponse(FacturaBase):
    id: int
    empresa_id: int
    usuario_genera_id: int
    folio: str
    uuid: Optional[str] = None
    estado: EstadoFactura
    emisor_rfc: str
    emisor_nombre: str
    emisor_regimen_fiscal: str
    subtotal: float
    descuento: float
    total_impuestos_trasladados: float
    total: float
    fecha_emision: datetime
    fecha_timbrado: Optional[datetime] = None
    xml_url: Optional[str] = None
    pdf_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================================
# ÓRDENES DE COBRO ENDPOINTS
# ============================================================================

@router.get("/ordenes-cobro", response_model=List[OrdenCobroResponse])
async def list_ordenes_cobro(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
    estado: Optional[EstadoOrdenCobro] = None,
    paciente_id: Optional[int] = None,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
):
    """Lista todas las órdenes de cobro con filtros opcionales"""
    async with async_session() as session:
        query = select(OrdenCobro)

        # Filtros
        if estado:
            query = query.where(OrdenCobro.estado == estado)

        if paciente_id:
            query = query.where(OrdenCobro.paciente_id == paciente_id)

        if fecha_desde:
            query = query.where(OrdenCobro.fecha_emision >= fecha_desde)

        if fecha_hasta:
            query = query.where(OrdenCobro.fecha_emision <= fecha_hasta)

        # Ordenar por fecha descendente
        query = query.order_by(OrdenCobro.fecha_emision.desc()).offset(skip).limit(limit)

        result = await session.execute(query)
        ordenes = result.scalars().all()

        return [OrdenCobroResponse.model_validate(orden) for orden in ordenes]


@router.get("/ordenes-cobro/{orden_id}", response_model=OrdenCobroResponse)
async def get_orden_cobro(orden_id: int):
    """Obtiene una orden de cobro por ID"""
    async with async_session() as session:
        query = select(OrdenCobro).where(OrdenCobro.id == orden_id)
        result = await session.execute(query)
        orden = result.scalar_one_or_none()

        if not orden:
            raise HTTPException(status_code=404, detail="Orden de cobro no encontrada")

        return OrdenCobroResponse.model_validate(orden)


@router.post("/ordenes-cobro", response_model=OrdenCobroResponse)
async def create_orden_cobro(orden_data: OrdenCobroCreate):
    """Crea una nueva orden de cobro"""
    async with async_session() as session:
        # Generar folio único
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        random_suffix = uuid_lib.uuid4().hex[:6].upper()
        folio = f"OC-{timestamp}-{random_suffix}"

        # Calcular totales
        subtotal = 0
        iva_total = 0

        for concepto in orden_data.conceptos:
            subtotal += concepto.get("subtotal", 0)
            iva_total += concepto.get("iva", 0)

        total = subtotal + iva_total - orden_data.descuento

        # Crear orden
        orden = OrdenCobro(
            empresa_id=orden_data.empresa_id,
            paciente_id=orden_data.paciente_id,
            cita_id=orden_data.cita_id,
            usuario_cobro_id=orden_data.usuario_cobro_id,
            folio=folio,
            estado=EstadoOrdenCobro.PENDIENTE,
            subtotal=subtotal,
            descuento=orden_data.descuento,
            iva=iva_total,
            total=total,
            pagado=0,
            saldo=total,
            conceptos=orden_data.conceptos,
            fecha_emision=date.today(),
            fecha_vencimiento=orden_data.fecha_vencimiento,
            notas=orden_data.notas,
        )

        session.add(orden)
        await session.commit()
        await session.refresh(orden)

        return OrdenCobroResponse.model_validate(orden)


@router.put("/ordenes-cobro/{orden_id}", response_model=OrdenCobroResponse)
async def update_orden_cobro(orden_id: int, orden_data: OrdenCobroUpdate):
    """Actualiza una orden de cobro"""
    async with async_session() as session:
        query = select(OrdenCobro).where(OrdenCobro.id == orden_id)
        result = await session.execute(query)
        orden = result.scalar_one_or_none()

        if not orden:
            raise HTTPException(status_code=404, detail="Orden de cobro no encontrada")

        # Actualizar campos
        for field, value in orden_data.model_dump(exclude_unset=True).items():
            setattr(orden, field, value)

        await session.commit()
        await session.refresh(orden)

        return OrdenCobroResponse.model_validate(orden)


@router.delete("/ordenes-cobro/{orden_id}")
async def cancel_orden_cobro(orden_id: int):
    """Cancela una orden de cobro"""
    async with async_session() as session:
        query = select(OrdenCobro).where(OrdenCobro.id == orden_id)
        result = await session.execute(query)
        orden = result.scalar_one_or_none()

        if not orden:
            raise HTTPException(status_code=404, detail="Orden de cobro no encontrada")

        if orden.pagado > 0:
            raise HTTPException(
                status_code=400, detail="No se puede cancelar una orden con pagos registrados"
            )

        orden.estado = EstadoOrdenCobro.CANCELADA
        await session.commit()

        return {"message": "Orden de cobro cancelada exitosamente"}


# ============================================================================
# PAGOS ENDPOINTS
# ============================================================================

@router.get("/pagos", response_model=List[PagoResponse])
async def list_pagos(
    orden_cobro_id: Optional[int] = None,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
):
    """Lista todos los pagos con filtros opcionales"""
    async with async_session() as session:
        query = select(Pago)

        # Filtros
        if orden_cobro_id:
            query = query.where(Pago.orden_cobro_id == orden_cobro_id)

        if fecha_desde:
            fecha_desde_dt = datetime.combine(fecha_desde, datetime.min.time())
            query = query.where(Pago.fecha_pago >= fecha_desde_dt)

        if fecha_hasta:
            fecha_hasta_dt = datetime.combine(fecha_hasta, datetime.max.time())
            query = query.where(Pago.fecha_pago <= fecha_hasta_dt)

        query = query.order_by(Pago.fecha_pago.desc()).offset(skip).limit(limit)

        result = await session.execute(query)
        pagos = result.scalars().all()

        return [PagoResponse.model_validate(pago) for pago in pagos]


@router.post("/pagos", response_model=PagoResponse)
async def create_pago(pago_data: PagoCreate):
    """Registra un nuevo pago (efectivo, transferencia, cheque)"""
    async with async_session() as session:
        # Verificar orden de cobro
        query = select(OrdenCobro).where(OrdenCobro.id == pago_data.orden_cobro_id)
        result = await session.execute(query)
        orden = result.scalar_one_or_none()

        if not orden:
            raise HTTPException(status_code=404, detail="Orden de cobro no encontrada")

        if orden.estado == EstadoOrdenCobro.CANCELADA:
            raise HTTPException(status_code=400, detail="La orden de cobro está cancelada")

        if pago_data.monto > orden.saldo:
            raise HTTPException(
                status_code=400,
                detail=f"El monto excede el saldo pendiente (${orden.saldo:.2f})",
            )

        # Generar folio
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        random_suffix = uuid_lib.uuid4().hex[:6].upper()
        folio = f"PAG-{timestamp}-{random_suffix}"

        # Crear pago
        pago = Pago(
            orden_cobro_id=pago_data.orden_cobro_id,
            usuario_cobro_id=pago_data.usuario_cobro_id,
            folio=folio,
            monto=pago_data.monto,
            metodo_pago=pago_data.metodo_pago,
            fecha_pago=datetime.utcnow(),
            referencia=pago_data.referencia,
            notas=pago_data.notas,
            confirmado=True,
        )

        session.add(pago)

        # Actualizar orden de cobro
        orden.pagado += pago_data.monto
        orden.saldo = orden.total - orden.pagado

        if orden.saldo <= 0.01:  # Threshold for rounding
            orden.estado = EstadoOrdenCobro.PAGADA
            orden.saldo = 0
        elif orden.pagado > 0:
            orden.estado = EstadoOrdenCobro.PARCIALMENTE_PAGADA

        await session.commit()
        await session.refresh(pago)

        return PagoResponse.model_validate(pago)


@router.post("/pagos/stripe/payment-intent", response_model=StripePaymentIntentResponse)
async def create_stripe_payment_intent(orden_cobro_id: int):
    """Crea un Payment Intent de Stripe para pagar una orden"""
    if not STRIPE_ENABLED:
        raise HTTPException(
            status_code=503,
            detail="Stripe no está configurado. Configure STRIPE_SECRET_KEY en variables de entorno.",
        )

    async with async_session() as session:
        # Verificar orden
        query = select(OrdenCobro).where(OrdenCobro.id == orden_cobro_id)
        result = await session.execute(query)
        orden = result.scalar_one_or_none()

        if not orden:
            raise HTTPException(status_code=404, detail="Orden de cobro no encontrada")

        if orden.saldo <= 0:
            raise HTTPException(status_code=400, detail="La orden ya está pagada")

        # Crear Payment Intent con Stripe
        try:
            # Convertir a centavos (Stripe usa centavos)
            amount_cents = int(orden.saldo * 100)

            payment_intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency="mxn",
                automatic_payment_methods={"enabled": True},
                metadata={
                    "orden_cobro_id": orden.id,
                    "folio": orden.folio,
                },
            )

            return StripePaymentIntentResponse(
                client_secret=payment_intent.client_secret,
                payment_intent_id=payment_intent.id,
                amount=orden.saldo,
                currency="mxn",
                status=payment_intent.status,
            )

        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=f"Error de Stripe: {str(e)}")


@router.post("/pagos/stripe/confirm", response_model=PagoResponse)
async def confirm_stripe_payment(pago_data: PagoStripeCreate):
    """Confirma un pago realizado con Stripe"""
    if not STRIPE_ENABLED:
        # Modo simulado cuando Stripe no está disponible
        return await create_pago(
            PagoCreate(
                orden_cobro_id=pago_data.orden_cobro_id,
                usuario_cobro_id=pago_data.usuario_cobro_id,
                monto=pago_data.amount,
                metodo_pago=MetodoPago.TARJETA,
                referencia=pago_data.payment_method_id[:20],
                notas="Pago con tarjeta (simulado)",
            )
        )

    async with async_session() as session:
        # Verificar orden
        query = select(OrdenCobro).where(OrdenCobro.id == pago_data.orden_cobro_id)
        result = await session.execute(query)
        orden = result.scalar_one_or_none()

        if not orden:
            raise HTTPException(status_code=404, detail="Orden de cobro no encontrada")

        try:
            # Verificar el pago con Stripe
            payment_intent = stripe.PaymentIntent.retrieve(pago_data.payment_method_id)

            if payment_intent.status != "succeeded":
                raise HTTPException(
                    status_code=400, detail=f"El pago no fue exitoso. Estado: {payment_intent.status}"
                )

            # Obtener últimos 4 dígitos de la tarjeta
            ultimos_digitos = None
            if payment_intent.charges and payment_intent.charges.data:
                charge = payment_intent.charges.data[0]
                if charge.payment_method_details.card:
                    ultimos_digitos = charge.payment_method_details.card.last4

            # Generar folio
            timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
            random_suffix = uuid_lib.uuid4().hex[:6].upper()
            folio = f"PAG-{timestamp}-{random_suffix}"

            # Crear pago
            pago = Pago(
                orden_cobro_id=pago_data.orden_cobro_id,
                usuario_cobro_id=pago_data.usuario_cobro_id,
                folio=folio,
                monto=pago_data.amount,
                metodo_pago=MetodoPago.TARJETA,
                fecha_pago=datetime.utcnow(),
                referencia=payment_intent.id,
                autorizacion=payment_intent.id,
                ultimos_digitos_tarjeta=ultimos_digitos,
                notas="Pago procesado con Stripe",
                confirmado=True,
            )

            session.add(pago)

            # Actualizar orden
            orden.pagado += pago_data.amount
            orden.saldo = orden.total - orden.pagado

            if orden.saldo <= 0.01:
                orden.estado = EstadoOrdenCobro.PAGADA
                orden.saldo = 0
            elif orden.pagado > 0:
                orden.estado = EstadoOrdenCobro.PARCIALMENTE_PAGADA

            await session.commit()
            await session.refresh(pago)

            return PagoResponse.model_validate(pago)

        except stripe.error.StripeError as e:
            raise HTTPException(status_code=400, detail=f"Error de Stripe: {str(e)}")


@router.post("/pagos/{pago_id}/cancel")
async def cancel_pago(pago_id: int, motivo: str):
    """Cancela un pago"""
    async with async_session() as session:
        query = select(Pago).options(selectinload(Pago.orden_cobro)).where(Pago.id == pago_id)
        result = await session.execute(query)
        pago = result.scalar_one_or_none()

        if not pago:
            raise HTTPException(status_code=404, detail="Pago no encontrado")

        if pago.cancelado:
            raise HTTPException(status_code=400, detail="El pago ya está cancelado")

        # Cancelar pago
        pago.cancelado = True
        pago.fecha_cancelacion = datetime.utcnow()
        pago.motivo_cancelacion = motivo

        # Actualizar orden de cobro
        orden = pago.orden_cobro
        orden.pagado -= pago.monto
        orden.saldo = orden.total - orden.pagado

        if orden.pagado <= 0:
            orden.estado = EstadoOrdenCobro.PENDIENTE
        else:
            orden.estado = EstadoOrdenCobro.PARCIALMENTE_PAGADA

        await session.commit()

        return {"message": "Pago cancelado exitosamente"}


# ============================================================================
# FACTURAS CFDI 4.0 ENDPOINTS
# ============================================================================

@router.get("/facturas", response_model=List[FacturaResponse])
async def list_facturas(
    estado: Optional[EstadoFactura] = None,
    paciente_id: Optional[int] = None,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=500),
):
    """Lista todas las facturas con filtros opcionales"""
    async with async_session() as session:
        query = select(Factura)

        # Filtros
        if estado:
            query = query.where(Factura.estado == estado)

        if paciente_id:
            query = query.where(Factura.paciente_id == paciente_id)

        if fecha_desde:
            fecha_desde_dt = datetime.combine(fecha_desde, datetime.min.time())
            query = query.where(Factura.fecha_emision >= fecha_desde_dt)

        if fecha_hasta:
            fecha_hasta_dt = datetime.combine(fecha_hasta, datetime.max.time())
            query = query.where(Factura.fecha_emision <= fecha_hasta_dt)

        query = query.order_by(Factura.fecha_emision.desc()).offset(skip).limit(limit)

        result = await session.execute(query)
        facturas = result.scalars().all()

        return [FacturaResponse.model_validate(factura) for factura in facturas]


@router.get("/facturas/{factura_id}", response_model=FacturaResponse)
async def get_factura(factura_id: int):
    """Obtiene una factura por ID"""
    async with async_session() as session:
        query = select(Factura).where(Factura.id == factura_id)
        result = await session.execute(query)
        factura = result.scalar_one_or_none()

        if not factura:
            raise HTTPException(status_code=404, detail="Factura no encontrada")

        return FacturaResponse.model_validate(factura)


@router.post("/facturas", response_model=FacturaResponse)
async def create_factura(factura_data: FacturaCreate):
    """Crea una nueva factura (borrador)"""
    async with async_session() as session:
        # Generar folio
        folio_number = await session.execute(
            select(func.count(Factura.id)).where(
                and_(Factura.serie == factura_data.serie, Factura.empresa_id == factura_data.empresa_id)
            )
        )
        next_folio = folio_number.scalar() + 1
        folio = str(next_folio).zfill(6)

        # Calcular totales
        subtotal = 0
        total_impuestos = 0
        descuento = 0

        for concepto in factura_data.conceptos:
            subtotal += concepto.get("subtotal", 0)
            total_impuestos += concepto.get("impuestos", 0)
            descuento += concepto.get("descuento", 0)

        total = subtotal + total_impuestos - descuento

        # Crear factura
        factura = Factura(
            empresa_id=factura_data.empresa_id,
            paciente_id=factura_data.paciente_id,
            orden_cobro_id=factura_data.orden_cobro_id,
            usuario_genera_id=factura_data.usuario_genera_id,
            tipo_comprobante=factura_data.tipo_comprobante,
            serie=factura_data.serie,
            folio=folio,
            estado=EstadoFactura.BORRADOR,
            fecha_emision=datetime.utcnow(),
            emisor_rfc=factura_data.emisor_rfc,
            emisor_nombre=factura_data.emisor_nombre,
            emisor_regimen_fiscal=factura_data.emisor_regimen_fiscal,
            receptor_rfc=factura_data.receptor_rfc,
            receptor_nombre=factura_data.receptor_nombre,
            receptor_uso_cfdi=factura_data.receptor_uso_cfdi,
            receptor_domicilio_fiscal=factura_data.receptor_domicilio_fiscal,
            forma_pago=factura_data.forma_pago,
            metodo_pago=factura_data.metodo_pago,
            subtotal=subtotal,
            descuento=descuento,
            total_impuestos_trasladados=total_impuestos,
            total=total,
            conceptos=factura_data.conceptos,
            notas=factura_data.notas,
        )

        session.add(factura)
        await session.commit()
        await session.refresh(factura)

        return FacturaResponse.model_validate(factura)


@router.post("/facturas/{factura_id}/timbrar")
async def timbrar_factura(factura_id: int):
    """Timbra una factura (genera UUID y sella digitalmente)"""
    async with async_session() as session:
        query = select(Factura).where(Factura.id == factura_id)
        result = await session.execute(query)
        factura = result.scalar_one_or_none()

        if not factura:
            raise HTTPException(status_code=404, detail="Factura no encontrada")

        if factura.estado != EstadoFactura.BORRADOR:
            raise HTTPException(status_code=400, detail="Solo se pueden timbrar facturas en borrador")

        # Simular timbrado (en producción se integraría con un PAC real)
        factura.uuid = str(uuid_lib.uuid4())
        factura.estado = EstadoFactura.TIMBRADA
        factura.fecha_timbrado = datetime.utcnow()
        factura.pac_proveedor = "PAC_SIMULADO"

        # Simular generación de archivos
        factura.xml_url = f"/facturas/{factura.serie}-{factura.folio}.xml"
        factura.pdf_url = f"/facturas/{factura.serie}-{factura.folio}.pdf"

        await session.commit()
        await session.refresh(factura)

        return FacturaResponse.model_validate(factura)


@router.post("/facturas/{factura_id}/cancelar")
async def cancelar_factura(factura_id: int, motivo: str):
    """Cancela una factura timbrada"""
    async with async_session() as session:
        query = select(Factura).where(Factura.id == factura_id)
        result = await session.execute(query)
        factura = result.scalar_one_or_none()

        if not factura:
            raise HTTPException(status_code=404, detail="Factura no encontrada")

        if factura.estado != EstadoFactura.TIMBRADA:
            raise HTTPException(status_code=400, detail="Solo se pueden cancelar facturas timbradas")

        factura.estado = EstadoFactura.CANCELADA
        factura.fecha_cancelacion = datetime.utcnow()
        factura.motivo_cancelacion = motivo

        await session.commit()

        return {"message": "Factura cancelada exitosamente"}


# ============================================================================
# REPORTES Y ESTADÍSTICAS
# ============================================================================

@router.get("/estadisticas/ingresos")
async def get_estadisticas_ingresos(
    fecha_desde: Optional[date] = None, fecha_hasta: Optional[date] = None
):
    """Obtiene estadísticas de ingresos"""
    if not fecha_desde:
        fecha_desde = date.today() - timedelta(days=30)
    if not fecha_hasta:
        fecha_hasta = date.today()

    async with async_session() as session:
        # Total facturado
        query = select(func.sum(Factura.total)).where(
            and_(
                Factura.estado == EstadoFactura.TIMBRADA,
                Factura.fecha_emision >= datetime.combine(fecha_desde, datetime.min.time()),
                Factura.fecha_emision <= datetime.combine(fecha_hasta, datetime.max.time()),
            )
        )
        result = await session.execute(query)
        total_facturado = result.scalar() or 0

        # Total cobrado
        query = select(func.sum(Pago.monto)).where(
            and_(
                Pago.cancelado == False,
                Pago.fecha_pago >= datetime.combine(fecha_desde, datetime.min.time()),
                Pago.fecha_pago <= datetime.combine(fecha_hasta, datetime.max.time()),
            )
        )
        result = await session.execute(query)
        total_cobrado = result.scalar() or 0

        # Pendientes de cobro
        query = select(func.sum(OrdenCobro.saldo)).where(
            and_(
                OrdenCobro.estado.in_([EstadoOrdenCobro.PENDIENTE, EstadoOrdenCobro.PARCIALMENTE_PAGADA])
            )
        )
        result = await session.execute(query)
        total_pendiente = result.scalar() or 0

        # Número de facturas
        query = select(func.count(Factura.id)).where(
            and_(
                Factura.estado == EstadoFactura.TIMBRADA,
                Factura.fecha_emision >= datetime.combine(fecha_desde, datetime.min.time()),
                Factura.fecha_emision <= datetime.combine(fecha_hasta, datetime.max.time()),
            )
        )
        result = await session.execute(query)
        num_facturas = result.scalar() or 0

        # Número de pagos
        query = select(func.count(Pago.id)).where(
            and_(
                Pago.cancelado == False,
                Pago.fecha_pago >= datetime.combine(fecha_desde, datetime.min.time()),
                Pago.fecha_pago <= datetime.combine(fecha_hasta, datetime.max.time()),
            )
        )
        result = await session.execute(query)
        num_pagos = result.scalar() or 0

        return {
            "periodo": {"desde": fecha_desde.isoformat(), "hasta": fecha_hasta.isoformat()},
            "total_facturado": round(total_facturado, 2),
            "total_cobrado": round(total_cobrado, 2),
            "total_pendiente": round(total_pendiente, 2),
            "num_facturas": num_facturas,
            "num_pagos": num_pagos,
        }


@router.get("/estadisticas/metodos-pago")
async def get_estadisticas_metodos_pago(
    fecha_desde: Optional[date] = None, fecha_hasta: Optional[date] = None
):
    """Obtiene estadísticas por método de pago"""
    if not fecha_desde:
        fecha_desde = date.today() - timedelta(days=30)
    if not fecha_hasta:
        fecha_hasta = date.today()

    async with async_session() as session:
        query = (
            select(Pago.metodo_pago, func.count(Pago.id), func.sum(Pago.monto))
            .where(
                and_(
                    Pago.cancelado == False,
                    Pago.fecha_pago >= datetime.combine(fecha_desde, datetime.min.time()),
                    Pago.fecha_pago <= datetime.combine(fecha_hasta, datetime.max.time()),
                )
            )
            .group_by(Pago.metodo_pago)
        )

        result = await session.execute(query)
        stats = result.all()

        return {
            "periodo": {"desde": fecha_desde.isoformat(), "hasta": fecha_hasta.isoformat()},
            "por_metodo": [
                {"metodo": metodo, "cantidad": cantidad, "total": round(total, 2)} for metodo, cantidad, total in stats
            ],
        }
