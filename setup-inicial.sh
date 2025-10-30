#!/bin/bash
# Script para setup inicial - Crear tablas y usuario admin

echo "🔧 Setup Inicial GP-Medical"
echo ""

cd backend

# Verificar que venv existe
if [ ! -d "venv" ]; then
    echo "❌ No se encontró entorno virtual"
    echo "   Ejecuta primero: ./start-backend.sh"
    exit 1
fi

# Activar venv
source venv/bin/activate

echo "1️⃣  Creando tablas en la base de datos..."
python -c "
from app.core.database import engine, Base
from app.models import *
import asyncio

async def create_tables():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print('✅ Tablas creadas exitosamente')
    except Exception as e:
        print(f'❌ Error: {e}')
        print('   Asegúrate de que PostgreSQL está corriendo')
        exit(1)

asyncio.run(create_tables())
"

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Error al crear tablas"
    echo "   Verifica que PostgreSQL está corriendo:"
    echo "   ./start-database.sh"
    exit 1
fi

echo ""
echo "2️⃣  Creando usuario administrador..."
echo ""

python scripts/create_admin.py

echo ""
echo "✅ Setup completado!"
echo ""
echo "📧 Credenciales de acceso:"
echo "   Email: admin@miclinica.com"
echo "   Password: admin123"
echo ""
echo "⚠️  IMPORTANTE: Cambia el password en Configuración"
