@echo off
REM Script para iniciar el backend en Windows

echo 🚀 Iniciando Backend GP-Medical...
echo.

cd backend

REM Verificar si existe venv
if not exist "venv\" (
    echo 📦 Creando entorno virtual...
    python -m venv venv
)

REM Activar venv
echo 🔧 Activando entorno virtual...
call venv\Scripts\activate.bat

REM Instalar/actualizar dependencias
echo 📚 Instalando dependencias...
pip install -q -r requirements.txt

REM Verificar base de datos
echo 🗄️  Verificando base de datos...
python -c "from app.core.database import engine, Base; from app.models import *; import asyncio; asyncio.run((lambda: engine.begin()).__await__())" 2>nul || echo ⚠️  No se pudo conectar a la base de datos

echo.
echo ✅ Backend listo!
echo 📍 URL: http://localhost:8000
echo 📚 Docs: http://localhost:8000/docs
echo.

REM Iniciar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
