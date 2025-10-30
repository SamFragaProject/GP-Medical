@echo off
REM Script para iniciar el frontend en Windows

echo 🎨 Iniciando Frontend GP-Medical...
echo.

cd frontend

REM Verificar si existen node_modules
if not exist "node_modules\" (
    echo 📦 Instalando dependencias (esto puede tomar unos minutos)...
    call npm install
) else (
    echo ✅ Dependencias ya instaladas
)

echo.
echo ✅ Frontend listo!
echo 📍 URL: http://localhost:3000
echo.
echo ⏳ Iniciando servidor (puede tomar 10-20 segundos)...
echo.

REM Iniciar servidor
call npm run dev
