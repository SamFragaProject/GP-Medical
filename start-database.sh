#!/bin/bash
# Script para iniciar PostgreSQL con Docker (Mac/Linux)

echo "🗄️  Iniciando Base de Datos PostgreSQL..."
echo ""

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    echo "   Instala Docker desde: https://www.docker.com/get-started"
    exit 1
fi

# Verificar si Docker está corriendo
if ! docker info &> /dev/null; then
    echo "❌ Docker no está corriendo"
    echo "   Inicia Docker Desktop y vuelve a ejecutar este script"
    exit 1
fi

# Verificar si el contenedor ya existe
if docker ps -a | grep -q gpmedical-db; then
    echo "📦 Contenedor existente encontrado"

    # Verificar si está corriendo
    if docker ps | grep -q gpmedical-db; then
        echo "✅ Base de datos ya está corriendo"
    else
        echo "🔄 Iniciando contenedor existente..."
        docker start gpmedical-db
        echo "✅ Base de datos iniciada"
    fi
else
    echo "📦 Creando nuevo contenedor de PostgreSQL..."
    docker run -d \
        --name gpmedical-db \
        -p 5432:5432 \
        -e POSTGRES_DB=gpmedical \
        -e POSTGRES_USER=gpmedical \
        -e POSTGRES_PASSWORD=gpmedical \
        -v gpmedical-data:/var/lib/postgresql/data \
        postgres:15

    echo "⏳ Esperando a que PostgreSQL inicie..."
    sleep 5
    echo "✅ Base de datos creada e iniciada"
fi

echo ""
echo "📍 Conexión:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: gpmedical"
echo "   User: gpmedical"
echo "   Password: gpmedical"
echo ""
echo "💡 Para detener: docker stop gpmedical-db"
echo "💡 Para ver logs: docker logs gpmedical-db"
