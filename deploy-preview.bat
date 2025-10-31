@echo off
REM Script rápido para crear preview en Vercel

echo 🚀 Deploy Preview a Vercel
echo.

REM Verificar que hay un mensaje
if "%~1"=="" (
    echo ❌ Error: Necesitas proporcionar un mensaje
    echo.
    echo Uso:
    echo   deploy-preview.bat "descripción del cambio"
    echo.
    echo Ejemplo:
    echo   deploy-preview.bat "cambiar color del botón"
    exit /b 1
)

set MENSAJE=%~1

REM Obtener branch actual
for /f "tokens=*" %%i in ('git symbolic-ref --short HEAD') do set BRANCH_NAME=%%i

echo 📝 Mensaje: %MENSAJE%
echo 🌿 Branch: %BRANCH_NAME%
echo.

REM Verificar cambios
git status -s > nul 2>&1
if errorlevel 1 (
    echo ⚠️  No hay cambios para subir
    exit /b 0
)

REM Mostrar cambios
echo 📋 Archivos modificados:
git status -s
echo.

REM Confirmar
set /p CONFIRMAR="¿Subir estos cambios? (s/n): "
if /i not "%CONFIRMAR%"=="s" (
    echo ❌ Cancelado
    exit /b 0
)

REM Add
echo 📦 Agregando archivos...
git add .

REM Commit
echo 💾 Creando commit...
git commit -m "%MENSAJE%"

REM Push
echo 🚀 Subiendo a GitHub...
git push origin %BRANCH_NAME%

echo.
echo ✅ ¡Listo!
echo.
echo 📍 Ve a Vercel para ver el preview:
echo    https://vercel.com/dashboard
echo.
echo ⏳ El deployment tardará 2-3 minutos
echo    Recibirás una URL como:
echo    https://gp-medical-git-%BRANCH_NAME%-usuario.vercel.app
echo.
pause
