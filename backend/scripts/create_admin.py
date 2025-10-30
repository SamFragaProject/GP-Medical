#!/usr/bin/env python3
"""
Script para crear usuario administrador inicial
Usage: python scripts/create_admin.py
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import engine
from app.core.security import get_password_hash
from app.models.tenant import Empresa
from app.models.user import Usuario, Rol, UsuarioRol


async def create_initial_data():
    """Crear empresa, rol y usuario administrador inicial"""

    print("🚀 Creando datos iniciales...")

    async with AsyncSession(engine) as db:
        try:
            # Crear empresa por defecto
            print("\n📋 Creando empresa...")
            empresa = Empresa(
                nombre="Mi Clínica",
                razon_social="Mi Clínica S.A. de C.V.",
                rfc="XAXX010101000",
                slug="mi-clinica",
                email="admin@miclinica.com",
                pais="MX",
                color_primario="#3B82F6",
                color_secundario="#10B981",
                serie_factura="F",
                serie_nota_credito="NC",
                folio_actual_factura=1,
                folio_actual_nota_credito=1,
                activo=True,
                plan="premium",
            )
            db.add(empresa)
            await db.flush()
            print(f"✅ Empresa creada: {empresa.nombre} (ID: {empresa.id})")

            # Crear rol admin
            print("\n👤 Creando rol administrador...")
            rol_admin = Rol(
                empresa_id=empresa.id,
                nombre="Administrador",
                codigo="ADMIN",
                descripcion="Administrador del sistema con acceso completo",
                es_sistema=True,
                es_medico=False,
                activo=True,
            )
            db.add(rol_admin)
            await db.flush()
            print(f"✅ Rol creado: {rol_admin.nombre} (ID: {rol_admin.id})")

            # Crear usuario admin
            print("\n🔐 Creando usuario administrador...")
            admin_password = "admin123"  # CAMBIAR EN PRODUCCIÓN
            admin_user = Usuario(
                empresa_id=empresa.id,
                email="admin@miclinica.com",
                username="admin",
                hashed_password=get_password_hash(admin_password),
                nombre="Administrador",
                apellido_paterno="Sistema",
                apellido_materno="",
                is_superuser=True,
                is_active=True,
                require_password_change=True,  # Forzar cambio en primer login
            )
            db.add(admin_user)
            await db.flush()
            print(f"✅ Usuario creado: {admin_user.email} (ID: {admin_user.id})")

            # Asignar rol al usuario
            print("\n🔗 Asignando rol a usuario...")
            usuario_rol = UsuarioRol(
                usuario_id=admin_user.id,
                rol_id=rol_admin.id,
                sede_id=None,  # Aplica a todas las sedes
            )
            db.add(usuario_rol)

            # Commit de todos los cambios
            await db.commit()

            # Resumen
            print("\n" + "="*60)
            print("✅ DATOS INICIALES CREADOS EXITOSAMENTE")
            print("="*60)
            print(f"\n🏥 Empresa: {empresa.nombre}")
            print(f"   RFC: {empresa.rfc}")
            print(f"   Email: {empresa.email}")
            print(f"\n👤 Usuario Administrador:")
            print(f"   📧 Email: {admin_user.email}")
            print(f"   👤 Username: {admin_user.username}")
            print(f"   🔑 Password: {admin_password}")
            print(f"\n⚠️  IMPORTANTE:")
            print(f"   1. CAMBIAR el password en el primer login")
            print(f"   2. Actualizar los datos de la empresa en Configuración")
            print(f"   3. Crear sedes adicionales si es necesario")
            print(f"   4. Crear usuarios adicionales con roles apropiados")
            print("\n" + "="*60)

        except Exception as e:
            await db.rollback()
            print(f"\n❌ Error al crear datos iniciales: {e}")
            raise


async def main():
    """Main function"""
    try:
        await create_initial_data()
    except KeyboardInterrupt:
        print("\n\n⚠️  Proceso cancelado por el usuario")
    except Exception as e:
        print(f"\n❌ Error fatal: {e}")
        sys.exit(1)


if __name__ == "__main__":
    print("""
╔═══════════════════════════════════════════════════════════╗
║                  GP-MEDICAL                               ║
║           Setup de Datos Iniciales                        ║
╚═══════════════════════════════════════════════════════════╝
""")

    print("Este script creará:")
    print("  • Una empresa de ejemplo")
    print("  • Un rol de Administrador")
    print("  • Un usuario administrador inicial")
    print("\n⚠️  Asegúrate de tener configurado DATABASE_URL en .env")

    response = input("\n¿Continuar? (s/n): ")
    if response.lower() in ['s', 'si', 'y', 'yes']:
        asyncio.run(main())
    else:
        print("❌ Proceso cancelado")
