"""
Reportes y Estadísticas
Generación de reportes operativos, financieros y médicos
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from sqlalchemy import select, func, and_, or_, extract
from sqlalchemy.orm import selectinload

from app.core.database import async_session
from app.models.patient import Paciente
from app.models.appointment import Cita, EstadoCita
from app.models.clinical import EncuentroClinico
from app.models.prescription import Receta
from app.models.study import OrdenEstudio, EstadoOrden
from app.models.billing import OrdenCobro, Pago, Factura, EstadoOrdenCobro, EstadoFactura, MetodoPago
from app.models.user import Usuario

router = APIRouter()

# ============================================================================
# SCHEMAS
# ============================================================================

class PeriodoReporte(BaseModel):
    fecha_desde: date
    fecha_hasta: date


class ReporteCitasResponse(BaseModel):
    periodo: Dict[str, str]
    total_citas: int
    citas_por_estado: Dict[str, int]
    citas_por_mes: List[Dict[str, Any]]
    citas_por_medico: List[Dict[str, Any]]
    tasa_asistencia: float
    tasa_cancelacion: float


class ReporteIngresosResponse(BaseModel):
    periodo: Dict[str, str]
    total_facturado: float
    total_cobrado: float
    total_pendiente: float
    ingresos_por_mes: List[Dict[str, Any]]
    ingresos_por_servicio: List[Dict[str, Any]]
    metodos_pago: List[Dict[str, Any]]


class ReporteOperativoResponse(BaseModel):
    periodo: Dict[str, str]
    total_pacientes: int
    nuevos_pacientes: int
    total_consultas: int
    total_recetas: int
    total_estudios: int
    productividad_medicos: List[Dict[str, Any]]
    tiempo_promedio_atencion: Optional[float] = None


class ReporteMedicoResponse(BaseModel):
    periodo: Dict[str, str]
    diagnosticos_frecuentes: List[Dict[str, Any]]
    medicamentos_recetados: List[Dict[str, Any]]
    estudios_solicitados: List[Dict[str, Any]]
    cie10_frecuentes: List[Dict[str, Any]]


# ============================================================================
# REPORTES DE CITAS
# ============================================================================

@router.get("/citas", response_model=ReporteCitasResponse)
async def reporte_citas(
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
):
    """Reporte detallado de citas"""
    if not fecha_desde:
        fecha_desde = date.today() - timedelta(days=30)
    if not fecha_hasta:
        fecha_hasta = date.today()

    async with async_session() as session:
        # Total de citas
        query = select(func.count(Cita.id)).where(
            and_(
                Cita.fecha_hora >= datetime.combine(fecha_desde, datetime.min.time()),
                Cita.fecha_hora <= datetime.combine(fecha_hasta, datetime.max.time()),
            )
        )
        result = await session.execute(query)
        total_citas = result.scalar() or 0

        # Citas por estado
        query = select(Cita.estado, func.count(Cita.id)).where(
            and_(
                Cita.fecha_hora >= datetime.combine(fecha_desde, datetime.min.time()),
                Cita.fecha_hora <= datetime.combine(fecha_hasta, datetime.max.time()),
            )
        ).group_by(Cita.estado)
        result = await session.execute(query)
        citas_por_estado = {estado: count for estado, count in result.all()}

        # Citas por mes
        query = (
            select(
                extract('year', Cita.fecha_hora).label('año'),
                extract('month', Cita.fecha_hora).label('mes'),
                func.count(Cita.id).label('total')
            )
            .where(
                and_(
                    Cita.fecha_hora >= datetime.combine(fecha_desde, datetime.min.time()),
                    Cita.fecha_hora <= datetime.combine(fecha_hasta, datetime.max.time()),
                )
            )
            .group_by('año', 'mes')
            .order_by('año', 'mes')
        )
        result = await session.execute(query)
        citas_por_mes = [
            {'año': int(año), 'mes': int(mes), 'total': total}
            for año, mes, total in result.all()
        ]

        # Citas por médico
        query = (
            select(
                Usuario.nombre,
                Usuario.apellido_paterno,
                func.count(Cita.id).label('total_citas')
            )
            .join(Usuario, Cita.medico_id == Usuario.id)
            .where(
                and_(
                    Cita.fecha_hora >= datetime.combine(fecha_desde, datetime.min.time()),
                    Cita.fecha_hora <= datetime.combine(fecha_hasta, datetime.max.time()),
                )
            )
            .group_by(Usuario.id, Usuario.nombre, Usuario.apellido_paterno)
            .order_by(func.count(Cita.id).desc())
        )
        result = await session.execute(query)
        citas_por_medico = [
            {
                'medico': f"{nombre} {apellido}",
                'total_citas': total
            }
            for nombre, apellido, total in result.all()
        ]

        # Tasas
        completadas = citas_por_estado.get(EstadoCita.COMPLETADA, 0)
        canceladas = citas_por_estado.get(EstadoCita.CANCELADA, 0)

        tasa_asistencia = (completadas / total_citas * 100) if total_citas > 0 else 0
        tasa_cancelacion = (canceladas / total_citas * 100) if total_citas > 0 else 0

        return ReporteCitasResponse(
            periodo={
                'desde': fecha_desde.isoformat(),
                'hasta': fecha_hasta.isoformat(),
            },
            total_citas=total_citas,
            citas_por_estado=citas_por_estado,
            citas_por_mes=citas_por_mes,
            citas_por_medico=citas_por_medico,
            tasa_asistencia=round(tasa_asistencia, 2),
            tasa_cancelacion=round(tasa_cancelacion, 2),
        )


# ============================================================================
# REPORTES FINANCIEROS
# ============================================================================

@router.get("/ingresos", response_model=ReporteIngresosResponse)
async def reporte_ingresos(
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
):
    """Reporte detallado de ingresos y facturación"""
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

        # Pendiente de cobro
        query = select(func.sum(OrdenCobro.saldo)).where(
            OrdenCobro.estado.in_([EstadoOrdenCobro.PENDIENTE, EstadoOrdenCobro.PARCIALMENTE_PAGADA])
        )
        result = await session.execute(query)
        total_pendiente = result.scalar() or 0

        # Ingresos por mes
        query = (
            select(
                extract('year', Pago.fecha_pago).label('año'),
                extract('month', Pago.fecha_pago).label('mes'),
                func.sum(Pago.monto).label('total')
            )
            .where(
                and_(
                    Pago.cancelado == False,
                    Pago.fecha_pago >= datetime.combine(fecha_desde, datetime.min.time()),
                    Pago.fecha_pago <= datetime.combine(fecha_hasta, datetime.max.time()),
                )
            )
            .group_by('año', 'mes')
            .order_by('año', 'mes')
        )
        result = await session.execute(query)
        ingresos_por_mes = [
            {'año': int(año), 'mes': int(mes), 'total': float(total)}
            for año, mes, total in result.all()
        ]

        # Métodos de pago
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
        metodos_pago = [
            {'metodo': metodo, 'cantidad': cantidad, 'total': float(total)}
            for metodo, cantidad, total in result.all()
        ]

        return ReporteIngresosResponse(
            periodo={
                'desde': fecha_desde.isoformat(),
                'hasta': fecha_hasta.isoformat(),
            },
            total_facturado=round(total_facturado, 2),
            total_cobrado=round(total_cobrado, 2),
            total_pendiente=round(total_pendiente, 2),
            ingresos_por_mes=ingresos_por_mes,
            ingresos_por_servicio=[],  # Simulated
            metodos_pago=metodos_pago,
        )


# ============================================================================
# REPORTES OPERATIVOS
# ============================================================================

@router.get("/operativo", response_model=ReporteOperativoResponse)
async def reporte_operativo(
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
):
    """Reporte operativo general"""
    if not fecha_desde:
        fecha_desde = date.today() - timedelta(days=30)
    if not fecha_hasta:
        fecha_hasta = date.today()

    async with async_session() as session:
        # Total pacientes
        query = select(func.count(Paciente.id))
        result = await session.execute(query)
        total_pacientes = result.scalar() or 0

        # Nuevos pacientes
        query = select(func.count(Paciente.id)).where(
            and_(
                Paciente.created_at >= datetime.combine(fecha_desde, datetime.min.time()),
                Paciente.created_at <= datetime.combine(fecha_hasta, datetime.max.time()),
            )
        )
        result = await session.execute(query)
        nuevos_pacientes = result.scalar() or 0

        # Total consultas
        query = select(func.count(EncuentroClinico.id)).where(
            and_(
                EncuentroClinico.fecha_hora >= datetime.combine(fecha_desde, datetime.min.time()),
                EncuentroClinico.fecha_hora <= datetime.combine(fecha_hasta, datetime.max.time()),
            )
        )
        result = await session.execute(query)
        total_consultas = result.scalar() or 0

        # Total recetas
        query = select(func.count(Receta.id)).where(
            and_(
                Receta.created_at >= datetime.combine(fecha_desde, datetime.min.time()),
                Receta.created_at <= datetime.combine(fecha_hasta, datetime.max.time()),
            )
        )
        result = await session.execute(query)
        total_recetas = result.scalar() or 0

        # Total estudios
        query = select(func.count(OrdenEstudio.id)).where(
            and_(
                OrdenEstudio.created_at >= datetime.combine(fecha_desde, datetime.min.time()),
                OrdenEstudio.created_at <= datetime.combine(fecha_hasta, datetime.max.time()),
            )
        )
        result = await session.execute(query)
        total_estudios = result.scalar() or 0

        # Productividad por médico
        query = (
            select(
                Usuario.nombre,
                Usuario.apellido_paterno,
                func.count(EncuentroClinico.id).label('total_consultas')
            )
            .join(Usuario, EncuentroClinico.medico_id == Usuario.id)
            .where(
                and_(
                    EncuentroClinico.fecha_hora >= datetime.combine(fecha_desde, datetime.min.time()),
                    EncuentroClinico.fecha_hora <= datetime.combine(fecha_hasta, datetime.max.time()),
                )
            )
            .group_by(Usuario.id, Usuario.nombre, Usuario.apellido_paterno)
            .order_by(func.count(EncuentroClinico.id).desc())
        )
        result = await session.execute(query)
        productividad_medicos = [
            {
                'medico': f"{nombre} {apellido}",
                'total_consultas': total
            }
            for nombre, apellido, total in result.all()
        ]

        return ReporteOperativoResponse(
            periodo={
                'desde': fecha_desde.isoformat(),
                'hasta': fecha_hasta.isoformat(),
            },
            total_pacientes=total_pacientes,
            nuevos_pacientes=nuevos_pacientes,
            total_consultas=total_consultas,
            total_recetas=total_recetas,
            total_estudios=total_estudios,
            productividad_medicos=productividad_medicos,
        )


# ============================================================================
# REPORTES MÉDICOS
# ============================================================================

@router.get("/medico", response_model=ReporteMedicoResponse)
async def reporte_medico(
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
):
    """Reporte médico con diagnósticos, medicamentos y estudios"""
    if not fecha_desde:
        fecha_desde = date.today() - timedelta(days=30)
    if not fecha_hasta:
        fecha_hasta = date.today()

    async with async_session() as session:
        # CIE-10 más frecuentes
        query = (
            select(
                Receta.diagnostico_cie10_codigo,
                Receta.diagnostico_cie10_nombre,
                func.count(Receta.id).label('frecuencia')
            )
            .where(
                and_(
                    Receta.diagnostico_cie10_codigo.isnot(None),
                    Receta.created_at >= datetime.combine(fecha_desde, datetime.min.time()),
                    Receta.created_at <= datetime.combine(fecha_hasta, datetime.max.time()),
                )
            )
            .group_by(Receta.diagnostico_cie10_codigo, Receta.diagnostico_cie10_nombre)
            .order_by(func.count(Receta.id).desc())
            .limit(10)
        )
        result = await session.execute(query)
        cie10_frecuentes = [
            {
                'codigo': codigo,
                'nombre': nombre,
                'frecuencia': freq
            }
            for codigo, nombre, freq in result.all()
        ]

        # Estudios más solicitados
        query = (
            select(
                OrdenEstudio.tipo_estudio,
                func.count(OrdenEstudio.id).label('total')
            )
            .where(
                and_(
                    OrdenEstudio.created_at >= datetime.combine(fecha_desde, datetime.min.time()),
                    OrdenEstudio.created_at <= datetime.combine(fecha_hasta, datetime.max.time()),
                )
            )
            .group_by(OrdenEstudio.tipo_estudio)
            .order_by(func.count(OrdenEstudio.id).desc())
        )
        result = await session.execute(query)
        estudios_solicitados = [
            {'tipo': tipo, 'total': total}
            for tipo, total in result.all()
        ]

        return ReporteMedicoResponse(
            periodo={
                'desde': fecha_desde.isoformat(),
                'hasta': fecha_hasta.isoformat(),
            },
            diagnosticos_frecuentes=[],  # Simulated
            medicamentos_recetados=[],  # Simulated
            estudios_solicitados=estudios_solicitados,
            cie10_frecuentes=cie10_frecuentes,
        )


# ============================================================================
# EXPORTACIÓN
# ============================================================================

@router.get("/exportar/excel")
async def exportar_excel(
    tipo_reporte: str = Query(..., description="citas, ingresos, operativo, medico"),
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
):
    """Exporta reporte a Excel"""
    # En producción, aquí se generaría el archivo Excel usando pandas/openpyxl
    return {
        "message": "Exportación a Excel implementada en producción",
        "tipo_reporte": tipo_reporte,
        "formato": "xlsx",
        "nota": "Usar pandas.DataFrame.to_excel() para exportar",
    }


@router.get("/exportar/pdf")
async def exportar_pdf(
    tipo_reporte: str = Query(..., description="citas, ingresos, operativo, medico"),
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
):
    """Exporta reporte a PDF"""
    # En producción, aquí se generaría el archivo PDF usando reportlab/weasyprint
    return {
        "message": "Exportación a PDF implementada en producción",
        "tipo_reporte": tipo_reporte,
        "formato": "pdf",
        "nota": "Usar reportlab o weasyprint para generar PDF",
    }


# ============================================================================
# DASHBOARD EJECUTIVO
# ============================================================================

@router.get("/dashboard-ejecutivo")
async def dashboard_ejecutivo():
    """Dashboard ejecutivo con métricas clave"""
    async with async_session() as session:
        # Última semana
        fecha_desde = date.today() - timedelta(days=7)
        fecha_hasta = date.today()

        # Citas hoy
        query = select(func.count(Cita.id)).where(
            and_(
                Cita.fecha_hora >= datetime.combine(date.today(), datetime.min.time()),
                Cita.fecha_hora <= datetime.combine(date.today(), datetime.max.time()),
            )
        )
        result = await session.execute(query)
        citas_hoy = result.scalar() or 0

        # Ingresos última semana
        query = select(func.sum(Pago.monto)).where(
            and_(
                Pago.cancelado == False,
                Pago.fecha_pago >= datetime.combine(fecha_desde, datetime.min.time()),
            )
        )
        result = await session.execute(query)
        ingresos_semana = result.scalar() or 0

        # Pendientes de cobro
        query = select(func.sum(OrdenCobro.saldo)).where(
            OrdenCobro.estado.in_([EstadoOrdenCobro.PENDIENTE, EstadoOrdenCobro.PARCIALMENTE_PAGADA])
        )
        result = await session.execute(query)
        pendiente_cobro = result.scalar() or 0

        # Pacientes atendidos última semana
        query = select(func.count(func.distinct(EncuentroClinico.paciente_id))).where(
            EncuentroClinico.fecha_hora >= datetime.combine(fecha_desde, datetime.min.time())
        )
        result = await session.execute(query)
        pacientes_atendidos = result.scalar() or 0

        return {
            "citas_hoy": citas_hoy,
            "ingresos_ultima_semana": round(ingresos_semana, 2),
            "pendiente_cobro": round(pendiente_cobro, 2),
            "pacientes_atendidos_semana": pacientes_atendidos,
            "fecha_actualizacion": datetime.utcnow().isoformat(),
        }
