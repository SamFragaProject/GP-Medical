#!/bin/bash
# Script super simple para iniciar el proyecto
# Solo ejecutar: ./INICIAR-PROYECTO.sh

echo ""
echo "========================================"
echo "  GP-MEDICAL - INICIO AUTOMÁTICO"
echo "========================================"
echo ""

# Ir a carpeta frontend
echo "[1/3] Yendo a carpeta frontend..."
cd frontend || {
    echo ""
    echo "❌ ERROR: No se encontró la carpeta frontend"
    echo "   Asegúrate de ejecutar este script desde la carpeta GP-Medical"
    echo ""
    exit 1
}
echo "✅ OK!"
echo ""

# Verificar si existen node_modules
if [ ! -d "node_modules" ]; then
    echo "[2/3] Instalando dependencias (primera vez - tardará 2-3 minutos)..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo ""
        echo "❌ ERROR al instalar dependencias"
        echo "   Verifica que Node.js esté instalado: node --version"
        echo ""
        exit 1
    fi
else
    echo "[2/3] Dependencias ya instaladas"
fi
echo "✅ OK!"
echo ""

echo "[3/3] Iniciando servidor..."
echo ""
echo "========================================"
echo "  ✅ PROYECTO INICIADO"
echo "========================================"
echo ""
echo "  🌐 Abre tu navegador en:"
echo "     http://localhost:3000"
echo ""
echo "  🛑 Para DETENER el servidor:"
echo "     Presiona Ctrl+C"
echo ""
echo "========================================"
echo ""

# Iniciar servidor
npm run dev

# Si llega aquí, es porque se detuvo el servidor
echo ""
echo "Servidor detenido."
