#!/bin/bash
# Script rápido para crear preview en Vercel

echo "🚀 Deploy Preview a Vercel"
echo ""

# Verificar que hay un mensaje
if [ -z "$1" ]; then
    echo "❌ Error: Necesitas proporcionar un mensaje"
    echo ""
    echo "Uso:"
    echo "  ./deploy-preview.sh \"descripción del cambio\""
    echo ""
    echo "Ejemplo:"
    echo "  ./deploy-preview.sh \"cambiar color del botón\""
    exit 1
fi

MENSAJE="$1"
BRANCH_NAME=$(git symbolic-ref --short HEAD)

echo "📝 Mensaje: $MENSAJE"
echo "🌿 Branch: $BRANCH_NAME"
echo ""

# Verificar cambios
if [[ -z $(git status -s) ]]; then
    echo "⚠️  No hay cambios para subir"
    exit 0
fi

# Mostrar cambios
echo "📋 Archivos modificados:"
git status -s
echo ""

# Confirmar
read -p "¿Subir estos cambios? (s/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo "❌ Cancelado"
    exit 0
fi

# Add
echo "📦 Agregando archivos..."
git add .

# Commit
echo "💾 Creando commit..."
git commit -m "$MENSAJE"

# Push
echo "🚀 Subiendo a GitHub..."
git push origin "$BRANCH_NAME"

echo ""
echo "✅ ¡Listo!"
echo ""
echo "📍 Ve a Vercel para ver el preview:"
echo "   https://vercel.com/dashboard"
echo ""
echo "⏳ El deployment tardará 2-3 minutos"
echo "   Recibirás una URL como:"
echo "   https://gp-medical-git-$BRANCH_NAME-usuario.vercel.app"
