"""Database models package"""

from app.models.tenant import Empresa, Sede
from app.models.user import Usuario, Rol, Permiso, UsuarioRol, RolPermiso
from app.models.patient import (
    Paciente,
    ContactoEmergencia,
    Alergia,
    Antecedente,
    Consentimiento,
    DocumentoPaciente,
)
from app.models.appointment import Cita, Recurso, BloqueoHorario
from app.models.clinical import (
    EncuentroClinico,
    NotaClinica,
    SignoVital,
    Diagnostico,
    Procedimiento,
)
from app.models.prescription import Receta, DetalleReceta, OrdenEstudio, ResultadoEstudio
from app.models.inventory import Producto, Lote, MovimientoInventario, Proveedor
from app.models.billing import OrdenCobro, Pago, Factura, ComplementoPago
from app.models.crm import Campana, Mensaje, TareaCRM
from app.models.audit import EventoAuditoria

__all__ = [
    # Tenant
    "Empresa",
    "Sede",
    # User
    "Usuario",
    "Rol",
    "Permiso",
    "UsuarioRol",
    "RolPermiso",
    # Patient
    "Paciente",
    "ContactoEmergencia",
    "Alergia",
    "Antecedente",
    "Consentimiento",
    "DocumentoPaciente",
    # Appointment
    "Cita",
    "Recurso",
    "BloqueoHorario",
    # Clinical
    "EncuentroClinico",
    "NotaClinica",
    "SignoVital",
    "Diagnostico",
    "Procedimiento",
    # Prescription
    "Receta",
    "DetalleReceta",
    "OrdenEstudio",
    "ResultadoEstudio",
    # Inventory
    "Producto",
    "Lote",
    "MovimientoInventario",
    "Proveedor",
    # Billing
    "OrdenCobro",
    "Pago",
    "Factura",
    "ComplementoPago",
    # CRM
    "Campana",
    "Mensaje",
    "TareaCRM",
    # Audit
    "EventoAuditoria",
]
