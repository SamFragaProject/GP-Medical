"""
Seed data for development and testing
Creates initial data for all entities
"""

import asyncio
from datetime import datetime, date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import AsyncSessionLocal
from app.core.security import get_password_hash
from app.models import *


async def create_seed_data():
    """Create all seed data"""
    async with AsyncSessionLocal() as db:
        print("🌱 Starting seed data creation...")

        # 1. Create Empresa
        empresa = Empresa(
            nombre="Clínica San Rafael",
            razon_social="Clínica San Rafael S.A. de C.V.",
            rfc="CSR850101ABC",
            slug="clinica-san-rafael",
            email="contacto@clinicasanrafael.com",
            telefono="555-1234",
            direccion="Av. Principal 123",
            ciudad="Ciudad de México",
            estado="CDMX",
            codigo_postal="03100",
            color_primario="#3B82F6",
            color_secundario="#10B981",
            regimen_fiscal="601",
            activo=True,
            plan="premium"
        )
        db.add(empresa)
        await db.flush()
        print(f"✅ Empresa creada: {empresa.nombre}")

        # 2. Create Sede
        sede = Sede(
            empresa_id=empresa.id,
            nombre="Sede Principal",
            codigo="PRINCIPAL",
            email="principal@clinicasanrafael.com",
            telefono="555-1234",
            direccion="Av. Principal 123",
            ciudad="Ciudad de México",
            estado="CDMX",
            codigo_postal="03100",
            horario={
                "lunes": {"inicio": "08:00", "fin": "20:00"},
                "martes": {"inicio": "08:00", "fin": "20:00"},
                "miércoles": {"inicio": "08:00", "fin": "20:00"},
                "jueves": {"inicio": "08:00", "fin": "20:00"},
                "viernes": {"inicio": "08:00", "fin": "20:00"},
                "sábado": {"inicio": "09:00", "fin": "14:00"},
            },
            activo=True
        )
        db.add(sede)
        await db.flush()
        print(f"✅ Sede creada: {sede.nombre}")

        # 3. Create Roles
        roles_data = [
            {"nombre": "Super Admin", "codigo": "SUPER_ADMIN", "es_sistema": True},
            {"nombre": "Admin Clínico", "codigo": "ADMIN", "es_sistema": True},
            {"nombre": "Médico", "codigo": "MEDICO", "es_sistema": True, "es_medico": True},
            {"nombre": "Recepción", "codigo": "RECEPCION", "es_sistema": True},
            {"nombre": "Enfermería", "codigo": "ENFERMERIA", "es_sistema": True},
            {"nombre": "Caja", "codigo": "CAJA", "es_sistema": True},
            {"nombre": "Inventario", "codigo": "INVENTARIO", "es_sistema": True},
        ]

        roles = {}
        for role_data in roles_data:
            role = Rol(empresa_id=empresa.id, **role_data)
            db.add(role)
            await db.flush()
            roles[role.codigo] = role
            print(f"✅ Rol creado: {role.nombre}")

        # 4. Create Users
        users_data = [
            {
                "email": "admin@clinica.com",
                "username": "admin",
                "nombre": "Administrador",
                "apellido_paterno": "Sistema",
                "rol": "ADMIN",
                "password": "admin123"
            },
            {
                "email": "dr.perez@clinica.com",
                "username": "drperez",
                "nombre": "Juan",
                "apellido_paterno": "Pérez",
                "apellido_materno": "García",
                "cedula_profesional": "1234567",
                "especialidad": "Medicina General",
                "rol": "MEDICO",
                "password": "medico123"
            },
            {
                "email": "dra.martinez@clinica.com",
                "username": "dramartinez",
                "nombre": "María",
                "apellido_paterno": "Martínez",
                "apellido_materno": "López",
                "cedula_profesional": "2345678",
                "especialidad": "Pediatría",
                "rol": "MEDICO",
                "password": "medico123"
            },
            {
                "email": "recepcion@clinica.com",
                "username": "recepcion",
                "nombre": "Ana",
                "apellido_paterno": "González",
                "rol": "RECEPCION",
                "password": "recepcion123"
            },
            {
                "email": "enfermeria@clinica.com",
                "username": "enfermeria",
                "nombre": "Laura",
                "apellido_paterno": "Sánchez",
                "rol": "ENFERMERIA",
                "password": "enfermeria123"
            },
            {
                "email": "caja@clinica.com",
                "username": "caja",
                "nombre": "Carlos",
                "apellido_paterno": "Rodríguez",
                "rol": "CAJA",
                "password": "caja123"
            },
        ]

        users = {}
        for user_data in users_data:
            rol_codigo = user_data.pop("rol")
            password = user_data.pop("password")

            user = Usuario(
                empresa_id=empresa.id,
                hashed_password=get_password_hash(password),
                is_active=True,
                **user_data
            )
            db.add(user)
            await db.flush()

            # Assign role
            user_rol = UsuarioRol(
                usuario_id=user.id,
                rol_id=roles[rol_codigo].id,
                sede_id=sede.id
            )
            db.add(user_rol)

            users[user.username] = user
            print(f"✅ Usuario creado: {user.email} (password: {password})")

        # 5. Create Recursos (Consultorios)
        recursos_data = [
            {"nombre": "Consultorio 1", "codigo": "CONS-1", "tipo": "CONSULTORIO"},
            {"nombre": "Consultorio 2", "codigo": "CONS-2", "tipo": "CONSULTORIO"},
            {"nombre": "Sala de Procedimientos", "codigo": "PROC-1", "tipo": "SALA_PROCEDIMIENTOS"},
        ]

        recursos = {}
        for recurso_data in recursos_data:
            recurso = Recurso(
                empresa_id=empresa.id,
                sede_id=sede.id,
                activo=True,
                **recurso_data
            )
            db.add(recurso)
            await db.flush()
            recursos[recurso.codigo] = recurso
            print(f"✅ Recurso creado: {recurso.nombre}")

        # 6. Create Pacientes
        pacientes_data = [
            {
                "nombre": "María",
                "apellido_paterno": "García",
                "apellido_materno": "López",
                "fecha_nacimiento": date(1979, 3, 15),
                "genero": "FEMENINO",
                "email": "maria.garcia@email.com",
                "telefono": "555-1001",
                "celular": "555-2001",
                "curp": "GALM790315MDFRPR01",
                "numero_expediente": "EXP-001234"
            },
            {
                "nombre": "Juan",
                "apellido_paterno": "Martínez",
                "apellido_materno": "Rodríguez",
                "fecha_nacimiento": date(1992, 7, 22),
                "genero": "MASCULINO",
                "email": "juan.martinez@email.com",
                "telefono": "555-1002",
                "celular": "555-2002",
                "curp": "MARJ920722HDFRDN01",
                "numero_expediente": "EXP-001235"
            },
            {
                "nombre": "Ana",
                "apellido_paterno": "Sánchez",
                "apellido_materno": "Pérez",
                "fecha_nacimiento": date(1996, 11, 8),
                "genero": "FEMENINO",
                "email": "ana.sanchez@email.com",
                "telefono": "555-1003",
                "celular": "555-2003",
                "curp": "SAPA961108MDFRNN01",
                "numero_expediente": "EXP-001236"
            },
            {
                "nombre": "Carlos",
                "apellido_paterno": "Hernández",
                "apellido_materno": "Torres",
                "fecha_nacimiento": date(1969, 5, 30),
                "genero": "MASCULINO",
                "email": "carlos.hernandez@email.com",
                "telefono": "555-1004",
                "celular": "555-2004",
                "curp": "HETC690530HDFRRL01",
                "numero_expediente": "EXP-001237"
            },
            {
                "nombre": "Laura",
                "apellido_paterno": "Ramírez",
                "apellido_materno": "Gómez",
                "fecha_nacimiento": date(1986, 9, 12),
                "genero": "FEMENINO",
                "email": "laura.ramirez@email.com",
                "telefono": "555-1005",
                "celular": "555-2005",
                "curp": "RAGL860912MDFMRR01",
                "numero_expediente": "EXP-001238"
            },
        ]

        pacientes = []
        for paciente_data in pacientes_data:
            paciente = Paciente(
                empresa_id=empresa.id,
                activo=True,
                **paciente_data
            )
            db.add(paciente)
            await db.flush()
            pacientes.append(paciente)
            print(f"✅ Paciente creado: {paciente.nombre} {paciente.apellido_paterno}")

        # 7. Create Citas
        today = datetime.now()
        citas_data = [
            {
                "paciente": pacientes[0],
                "medico": users["drperez"],
                "recurso": recursos["CONS-1"],
                "fecha_hora_inicio": today.replace(hour=9, minute=0, second=0),
                "duracion_minutos": 30,
                "motivo": "Consulta general - Revisión anual",
                "estado": "COMPLETADA",
                "tipo_cita": "Consulta General"
            },
            {
                "paciente": pacientes[1],
                "medico": users["drperez"],
                "recurso": recursos["CONS-1"],
                "fecha_hora_inicio": today.replace(hour=9, minute=30, second=0),
                "duracion_minutos": 30,
                "motivo": "Seguimiento de tratamiento",
                "estado": "COMPLETADA",
                "tipo_cita": "Seguimiento"
            },
            {
                "paciente": pacientes[2],
                "medico": users["drperez"],
                "recurso": recursos["CONS-1"],
                "fecha_hora_inicio": today.replace(hour=10, minute=0, second=0),
                "duracion_minutos": 45,
                "motivo": "Primera consulta - Dolor de cabeza frecuente",
                "estado": "EN_ESPERA",
                "tipo_cita": "Primera Vez",
                "es_primera_vez": True
            },
            {
                "paciente": pacientes[3],
                "medico": users["drperez"],
                "recurso": recursos["CONS-1"],
                "fecha_hora_inicio": today.replace(hour=11, minute=0, second=0),
                "duracion_minutos": 60,
                "motivo": "Procedimiento menor",
                "estado": "CONFIRMADA",
                "tipo_cita": "Procedimiento"
            },
            {
                "paciente": pacientes[4],
                "medico": users["dramartinez"],
                "recurso": recursos["CONS-2"],
                "fecha_hora_inicio": today.replace(hour=14, minute=0, second=0),
                "duracion_minutos": 30,
                "motivo": "Consulta pediátrica",
                "estado": "NUEVA",
                "tipo_cita": "Consulta General"
            },
        ]

        for cita_data in citas_data:
            paciente = cita_data.pop("paciente")
            medico = cita_data.pop("medico")
            recurso = cita_data.pop("recurso")
            fecha_inicio = cita_data.pop("fecha_hora_inicio")
            duracion = cita_data.pop("duracion_minutos")

            cita = Cita(
                empresa_id=empresa.id,
                sede_id=sede.id,
                paciente_id=paciente.id,
                medico_id=medico.id,
                recurso_id=recurso.id,
                fecha_hora_inicio=fecha_inicio,
                fecha_hora_fin=fecha_inicio + timedelta(minutes=duracion),
                duracion_minutos=duracion,
                **cita_data
            )
            db.add(cita)
            print(f"✅ Cita creada: {paciente.nombre} con {medico.nombre}")

        await db.commit()
        print("\n🎉 Seed data created successfully!")
        print("\n📋 Credenciales de acceso:")
        print("=" * 50)
        for user_data in users_data:
            print(f"👤 {user_data['rol']}: {user_data['email']} / {user_data['password']}")


if __name__ == "__main__":
    asyncio.run(create_seed_data())
