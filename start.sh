#!/bin/bash

# Script de inicio rápido para GP-Medical
# Ejecuta: bash start.sh

echo "🏥 Iniciando GP-Medical..."
echo ""

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    echo "📥 Instálalo desde: https://www.docker.com/get-started"
    exit 1
fi

# Verificar .env
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    echo "✅ Archivo .env creado"
else
    echo "✅ Archivo .env encontrado"
fi

echo ""
echo "🐳 Iniciando contenedores Docker..."
docker-compose up -d

echo ""
echo "⏳ Esperando que los servicios estén listos..."
sleep 10

echo ""
echo "✨ ¡Sistema iniciado!"
echo ""
echo "📍 Accede a:"
echo "   🌐 Frontend:  http://localhost:3000"
echo "   🔧 Backend:   http://localhost:8000"
echo "   📚 API Docs:  http://localhost:8000/docs"
echo ""
echo "📊 Ver logs:     docker-compose logs -f"
echo "🛑 Detener:      docker-compose down"
echo ""
echo "¡Disfruta GP-Medical! 🚀"
