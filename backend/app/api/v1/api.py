"""
Main API Router - v1
"""

from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    empresas,
    usuarios,
    roles,
    pacientes,
    citas,
    encuentros,
    recetas,
    inventario,
    facturacion,
    crm,
    upload,
)

api_router = APIRouter()

# Authentication
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

# Tenant Management
api_router.include_router(empresas.router, prefix="/empresas", tags=["Empresas"])

# User Management
api_router.include_router(usuarios.router, prefix="/usuarios", tags=["Usuarios"])
api_router.include_router(roles.router, prefix="/roles", tags=["Roles"])

# Patient Management
api_router.include_router(pacientes.router, prefix="/pacientes", tags=["Pacientes"])

# Appointments
api_router.include_router(citas.router, prefix="/citas", tags=["Citas"])

# Clinical
api_router.include_router(encuentros.router, prefix="/encuentros", tags=["Encuentros Clínicos"])
api_router.include_router(recetas.router, prefix="/recetas", tags=["Recetas"])

# Inventory
api_router.include_router(inventario.router, prefix="/inventario", tags=["Inventario"])

# Billing
api_router.include_router(facturacion.router, prefix="/facturacion", tags=["Facturación"])

# CRM
api_router.include_router(crm.router, prefix="/crm", tags=["CRM"])

# File Upload
api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])
