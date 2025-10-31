@echo off
REM Script super simple para iniciar el proyecto
REM Solo hacer doble click y listo!

echo.
echo ========================================
echo   GP-MEDICAL - INICIO AUTOMATICO
echo ========================================
echo.

REM Ir a carpeta frontend
echo [1/3] Yendo a carpeta frontend...
cd frontend
if errorlevel 1 (
    echo.
    echo ERROR: No se encontro la carpeta frontend
    echo Asegurate de ejecutar este script desde la carpeta GP-Medical
    echo.
    pause
    exit /b 1
)
echo OK!
echo.

REM Verificar si existen node_modules
if not exist "node_modules\" (
    echo [2/3] Instalando dependencias (primera vez - tardara 2-3 minutos)...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo ERROR al instalar dependencias
        echo Verifica que Node.js este instalado: node --version
        echo.
        pause
        exit /b 1
    )
) else (
    echo [2/3] Dependencias ya instaladas
)
echo OK!
echo.

echo [3/3] Iniciando servidor...
echo.
echo ========================================
echo   PROYECTO INICIADO
echo ========================================
echo.
echo   Abre tu navegador en:
echo   http://localhost:3000
echo.
echo   Para DETENER el servidor:
echo   Presiona Ctrl+C
echo.
echo ========================================
echo.

REM Iniciar servidor
call npm run dev

REM Si llega aqui, es porque se detuvo el servidor
echo.
echo Servidor detenido.
pause
