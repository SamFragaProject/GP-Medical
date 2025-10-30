"""
Encuentros Clínicos endpoints - Medicina del Trabajo
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload

from app.core.database import get_db
from app.models.clinical import (
    EncuentroClinico,
    NotaClinica,
    SignoVital,
    Diagnostico,
    Procedimiento,
    EstadoEncuentro,
    TipoDiagnostico,
)

router = APIRouter()


# ============================================================================
# ENCUENTROS CLÍNICOS
# ============================================================================

@router.get("/")
async def list_encuentros(
    skip: int = 0,
    limit: int = 100,
    paciente_id: Optional[int] = None,
    medico_id: Optional[int] = None,
    estado: Optional[str] = None,
    fecha_desde: Optional[str] = None,
    fecha_hasta: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Lista encuentros clínicos con filtros"""
    query = select(EncuentroClinico).options(
        joinedload(EncuentroClinico.paciente),
        joinedload(EncuentroClinico.medico),
    )

    # Filters
    conditions = []
    if paciente_id:
        conditions.append(EncuentroClinico.paciente_id == paciente_id)
    if medico_id:
        conditions.append(EncuentroClinico.medico_id == medico_id)
    if estado:
        conditions.append(EncuentroClinico.estado == estado)
    if fecha_desde:
        conditions.append(EncuentroClinico.fecha_hora_inicio >= fecha_desde)
    if fecha_hasta:
        conditions.append(EncuentroClinico.fecha_hora_inicio <= fecha_hasta)

    if conditions:
        query = query.where(and_(*conditions))

    query = query.order_by(EncuentroClinico.fecha_hora_inicio.desc())
    query = query.offset(skip).limit(limit)

    result = await db.execute(query)
    encuentros = result.scalars().all()

    return encuentros


@router.post("/")
async def create_encuentro(
    encuentro_data: dict,
    db: AsyncSession = Depends(get_db),
):
    """Crea un nuevo encuentro clínico"""
    encuentro = EncuentroClinico(
        empresa_id=encuentro_data.get("empresa_id", 1),
        paciente_id=encuentro_data["paciente_id"],
        cita_id=encuentro_data.get("cita_id"),
        medico_id=encuentro_data["medico_id"],
        fecha_hora_inicio=datetime.fromisoformat(encuentro_data["fecha_hora_inicio"]),
        tipo_encuentro=encuentro_data.get("tipo_encuentro", "consulta"),
        motivo_consulta=encuentro_data["motivo_consulta"],
        estado=encuentro_data.get("estado", EstadoEncuentro.EN_PROGRESO),
    )

    db.add(encuentro)
    await db.commit()
    await db.refresh(encuentro)

    return encuentro


@router.get("/{encuentro_id}")
async def get_encuentro(
    encuentro_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Obtiene un encuentro clínico con todos sus detalles"""
    query = select(EncuentroClinico).options(
        joinedload(EncuentroClinico.paciente),
        joinedload(EncuentroClinico.medico),
        joinedload(EncuentroClinico.notas_clinicas),
        joinedload(EncuentroClinico.signos_vitales),
        joinedload(EncuentroClinico.diagnosticos),
        joinedload(EncuentroClinico.procedimientos),
    ).where(EncuentroClinico.id == encuentro_id)

    result = await db.execute(query)
    encuentro = result.scalar_one_or_none()

    if not encuentro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encuentro no encontrado"
        )

    return encuentro


@router.put("/{encuentro_id}")
async def update_encuentro(
    encuentro_id: int,
    encuentro_data: dict,
    db: AsyncSession = Depends(get_db),
):
    """Actualiza un encuentro clínico"""
    result = await db.execute(
        select(EncuentroClinico).where(EncuentroClinico.id == encuentro_id)
    )
    encuentro = result.scalar_one_or_none()

    if not encuentro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encuentro no encontrado"
        )

    # Update fields
    for key, value in encuentro_data.items():
        if hasattr(encuentro, key) and value is not None:
            if key == "fecha_hora_inicio" or key == "fecha_hora_fin":
                value = datetime.fromisoformat(value)
            setattr(encuentro, key, value)

    encuentro.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(encuentro)

    return encuentro


@router.post("/{encuentro_id}/cerrar")
async def cerrar_encuentro(
    encuentro_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Cierra un encuentro clínico"""
    result = await db.execute(
        select(EncuentroClinico).where(EncuentroClinico.id == encuentro_id)
    )
    encuentro = result.scalar_one_or_none()

    if not encuentro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encuentro no encontrado"
        )

    encuentro.estado = EstadoEncuentro.CERRADO
    encuentro.fecha_hora_fin = datetime.utcnow()

    # Calculate duration
    if encuentro.fecha_hora_inicio:
        duracion = encuentro.fecha_hora_fin - encuentro.fecha_hora_inicio
        encuentro.duracion_minutos = int(duracion.total_seconds() / 60)

    await db.commit()
    await db.refresh(encuentro)

    return encuentro


# ============================================================================
# NOTAS CLÍNICAS (SOAP)
# ============================================================================

@router.get("/{encuentro_id}/notas")
async def list_notas(
    encuentro_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Lista notas clínicas de un encuentro"""
    result = await db.execute(
        select(NotaClinica)
        .where(NotaClinica.encuentro_id == encuentro_id)
        .order_by(NotaClinica.created_at.desc())
    )
    notas = result.scalars().all()
    return notas


@router.post("/{encuentro_id}/notas")
async def create_nota(
    encuentro_id: int,
    nota_data: dict,
    db: AsyncSession = Depends(get_db),
):
    """Crea una nueva nota clínica SOAP"""
    nota = NotaClinica(
        encuentro_id=encuentro_id,
        medico_id=nota_data["medico_id"],
        subjetivo=nota_data.get("subjetivo"),
        objetivo=nota_data.get("objetivo"),
        analisis=nota_data.get("analisis"),
        plan=nota_data.get("plan"),
        exploracion_fisica=nota_data.get("exploracion_fisica"),
        estudios_gabinete=nota_data.get("estudios_gabinete"),
        impresion_diagnostica=nota_data.get("impresion_diagnostica"),
        tratamiento=nota_data.get("tratamiento"),
        recomendaciones=nota_data.get("recomendaciones"),
    )

    db.add(nota)
    await db.commit()
    await db.refresh(nota)

    return nota


@router.put("/notas/{nota_id}")
async def update_nota(
    nota_id: int,
    nota_data: dict,
    db: AsyncSession = Depends(get_db),
):
    """Actualiza una nota clínica (solo si no está firmada)"""
    result = await db.execute(
        select(NotaClinica).where(NotaClinica.id == nota_id)
    )
    nota = result.scalar_one_or_none()

    if not nota:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota no encontrada"
        )

    if nota.firmada or nota.bloqueada:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se puede editar una nota firmada o bloqueada"
        )

    # Update fields
    for key, value in nota_data.items():
        if hasattr(nota, key) and value is not None:
            setattr(nota, key, value)

    nota.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(nota)

    return nota


@router.post("/notas/{nota_id}/firmar")
async def firmar_nota(
    nota_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Firma y bloquea una nota clínica"""
    result = await db.execute(
        select(NotaClinica).where(NotaClinica.id == nota_id)
    )
    nota = result.scalar_one_or_none()

    if not nota:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nota no encontrada"
        )

    if nota.firmada:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La nota ya está firmada"
        )

    nota.firmada = True
    nota.bloqueada = True
    nota.fecha_firma = datetime.utcnow()

    await db.commit()
    await db.refresh(nota)

    return nota


# ============================================================================
# SIGNOS VITALES
# ============================================================================

@router.get("/{encuentro_id}/signos-vitales")
async def list_signos_vitales(
    encuentro_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Lista signos vitales de un encuentro"""
    result = await db.execute(
        select(SignoVital)
        .where(SignoVital.encuentro_id == encuentro_id)
        .order_by(SignoVital.fecha_hora_registro.desc())
    )
    signos = result.scalars().all()
    return signos


@router.post("/{encuentro_id}/signos-vitales")
async def create_signos_vitales(
    encuentro_id: int,
    signos_data: dict,
    db: AsyncSession = Depends(get_db),
):
    """Registra signos vitales"""
    # Calculate IMC if peso and altura are provided
    imc = None
    if signos_data.get("peso") and signos_data.get("altura"):
        altura_m = signos_data["altura"] / 100
        imc = signos_data["peso"] / (altura_m ** 2)

    signos = SignoVital(
        encuentro_id=encuentro_id,
        registrado_por_id=signos_data["registrado_por_id"],
        temperatura=signos_data.get("temperatura"),
        frecuencia_cardiaca=signos_data.get("frecuencia_cardiaca"),
        frecuencia_respiratoria=signos_data.get("frecuencia_respiratoria"),
        presion_sistolica=signos_data.get("presion_sistolica"),
        presion_diastolica=signos_data.get("presion_diastolica"),
        saturacion_oxigeno=signos_data.get("saturacion_oxigeno"),
        peso=signos_data.get("peso"),
        altura=signos_data.get("altura"),
        imc=imc,
        glucosa=signos_data.get("glucosa"),
        escala_dolor=signos_data.get("escala_dolor"),
        notas=signos_data.get("notas"),
        fecha_hora_registro=datetime.utcnow(),
    )

    db.add(signos)
    await db.commit()
    await db.refresh(signos)

    return signos


# ============================================================================
# DIAGNÓSTICOS
# ============================================================================

@router.get("/{encuentro_id}/diagnosticos")
async def list_diagnosticos(
    encuentro_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Lista diagnósticos de un encuentro"""
    result = await db.execute(
        select(Diagnostico)
        .where(Diagnostico.encuentro_id == encuentro_id)
        .order_by(Diagnostico.es_principal.desc(), Diagnostico.created_at.desc())
    )
    diagnosticos = result.scalars().all()
    return diagnosticos


@router.post("/{encuentro_id}/diagnosticos")
async def create_diagnostico(
    encuentro_id: int,
    diagnostico_data: dict,
    db: AsyncSession = Depends(get_db),
):
    """Agrega un diagnóstico (CIE-10)"""
    diagnostico = Diagnostico(
        encuentro_id=encuentro_id,
        codigo_cie10=diagnostico_data["codigo_cie10"],
        descripcion=diagnostico_data["descripcion"],
        tipo=diagnostico_data.get("tipo", TipoDiagnostico.PRESUNTIVO),
        es_principal=diagnostico_data.get("es_principal", False),
        notas=diagnostico_data.get("notas"),
    )

    db.add(diagnostico)
    await db.commit()
    await db.refresh(diagnostico)

    return diagnostico


@router.delete("/diagnosticos/{diagnostico_id}")
async def delete_diagnostico(
    diagnostico_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Elimina un diagnóstico"""
    result = await db.execute(
        select(Diagnostico).where(Diagnostico.id == diagnostico_id)
    )
    diagnostico = result.scalar_one_or_none()

    if not diagnostico:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Diagnóstico no encontrado"
        )

    await db.delete(diagnostico)
    await db.commit()

    return {"message": "Diagnóstico eliminado"}


# ============================================================================
# PROCEDIMIENTOS
# ============================================================================

@router.get("/{encuentro_id}/procedimientos")
async def list_procedimientos(
    encuentro_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Lista procedimientos de un encuentro"""
    result = await db.execute(
        select(Procedimiento)
        .where(Procedimiento.encuentro_id == encuentro_id)
        .order_by(Procedimiento.fecha_hora_inicio.desc())
    )
    procedimientos = result.scalars().all()
    return procedimientos


@router.post("/{encuentro_id}/procedimientos")
async def create_procedimiento(
    encuentro_id: int,
    procedimiento_data: dict,
    db: AsyncSession = Depends(get_db),
):
    """Registra un procedimiento realizado"""
    procedimiento = Procedimiento(
        encuentro_id=encuentro_id,
        codigo=procedimiento_data.get("codigo"),
        nombre=procedimiento_data["nombre"],
        descripcion=procedimiento_data.get("descripcion"),
        fecha_hora_inicio=datetime.fromisoformat(procedimiento_data["fecha_hora_inicio"]),
        fecha_hora_fin=datetime.fromisoformat(procedimiento_data["fecha_hora_fin"]) if procedimiento_data.get("fecha_hora_fin") else None,
        realizado_por_id=procedimiento_data.get("realizado_por_id"),
        resultado=procedimiento_data.get("resultado"),
        complicaciones=procedimiento_data.get("complicaciones"),
        precio=procedimiento_data.get("precio"),
    )

    db.add(procedimiento)
    await db.commit()
    await db.refresh(procedimiento)

    return procedimiento


# ============================================================================
# CERTIFICADOS DE APTITUD LABORAL
# ============================================================================

@router.get("/{encuentro_id}/certificado-aptitud")
async def generar_certificado_aptitud(
    encuentro_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Genera certificado de aptitud laboral
    TODO: Implementar generación de PDF
    """
    query = select(EncuentroClinico).options(
        joinedload(EncuentroClinico.paciente),
        joinedload(EncuentroClinico.medico),
        joinedload(EncuentroClinico.diagnosticos),
    ).where(EncuentroClinico.id == encuentro_id)

    result = await db.execute(query)
    encuentro = result.scalar_one_or_none()

    if not encuentro:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Encuentro no encontrado"
        )

    # Determinar aptitud basado en diagnósticos
    # TODO: Lógica más sofisticada
    apto = len(encuentro.diagnosticos) == 0

    return {
        "encuentro_id": encuentro_id,
        "paciente": {
            "nombre": f"{encuentro.paciente.nombre} {encuentro.paciente.apellido_paterno}",
            "empresa": encuentro.paciente.empresa,
            "puesto": encuentro.paciente.puesto,
        },
        "medico": f"Dr. {encuentro.medico.nombre} {encuentro.medico.apellido_paterno}",
        "fecha": encuentro.fecha_hora_inicio,
        "tipo_examen": encuentro.tipo_encuentro,
        "apto": apto,
        "restricciones": [] if apto else ["Requiere evaluación especializada"],
        "vigencia_dias": 365 if apto else 0,
    }
