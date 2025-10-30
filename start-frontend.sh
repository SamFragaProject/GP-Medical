#!/bin/bash
# Script para iniciar el frontend en Mac/Linux

echo "🎨 Iniciando Frontend GP-Medical..."
echo ""

# Ir a carpeta frontend
cd frontend

# Verificar si existen node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias (esto puede tomar unos minutos)..."
    npm install
else
    echo "✅ Dependencias ya instaladas"
fi

echo ""
echo "✅ Frontend listo!"
echo "📍 URL: http://localhost:3000"
echo ""
echo "⏳ Iniciando servidor (puede tomar 10-20 segundos)..."
echo ""

# Iniciar servidor
npm run dev
