@echo off
REM Script para setup inicial - Crear tablas y usuario admin

echo 🔧 Setup Inicial GP-Medical
echo.

cd backend

REM Verificar que venv existe
if not exist "venv\" (
    echo ❌ No se encontró entorno virtual
    echo    Ejecuta primero: start-backend.bat
    pause
    exit /b 1
)

REM Activar venv
call venv\Scripts\activate.bat

echo 1️⃣  Creando tablas en la base de datos...
python -c "from app.core.database import engine, Base; from app.models import *; import asyncio; async def create(): async with engine.begin() as conn: await conn.run_sync(Base.metadata.create_all); print('✅ Tablas creadas'); asyncio.run(create())"

if errorlevel 1 (
    echo.
    echo ❌ Error al crear tablas
    echo    Verifica que PostgreSQL está corriendo:
    echo    start-database.bat
    pause
    exit /b 1
)

echo.
echo 2️⃣  Creando usuario administrador...
echo.

python scripts\create_admin.py

echo.
echo ✅ Setup completado!
echo.
echo 📧 Credenciales de acceso:
echo    Email: admin@miclinica.com
echo    Password: admin123
echo.
echo ⚠️  IMPORTANTE: Cambia el password en Configuración
echo.
pause
