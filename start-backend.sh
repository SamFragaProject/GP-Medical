#!/bin/bash
# Script para iniciar el backend en Mac/Linux

echo "🚀 Iniciando Backend GP-Medical..."
echo ""

# Ir a carpeta backend
cd backend

# Verificar si existe venv
if [ ! -d "venv" ]; then
    echo "📦 Creando entorno virtual..."
    python3 -m venv venv
fi

# Activar venv
echo "🔧 Activando entorno virtual..."
source venv/bin/activate

# Instalar/actualizar dependencias
echo "📚 Instalando dependencias..."
pip install -q -r requirements.txt

# Verificar si existen tablas (crear si no)
echo "🗄️  Verificando base de datos..."
python -c "
from app.core.database import engine, Base
from app.models import *
import asyncio

async def setup():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print('✅ Base de datos lista')
    except Exception as e:
        print(f'⚠️  Error al conectar a base de datos: {e}')
        print('   Asegúrate de que PostgreSQL está corriendo')

asyncio.run(setup())
" 2>/dev/null || echo "⚠️  No se pudo conectar a la base de datos"

echo ""
echo "✅ Backend listo!"
echo "📍 URL: http://localhost:8000"
echo "📚 Docs: http://localhost:8000/docs"
echo ""

# Iniciar servidor
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
