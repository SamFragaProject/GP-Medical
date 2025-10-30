@echo off
REM Script para iniciar PostgreSQL con Docker (Windows)

echo 🗄️  Iniciando Base de Datos PostgreSQL...
echo.

REM Verificar si Docker está instalado
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker no está instalado
    echo    Instala Docker Desktop desde: https://www.docker.com/get-started
    pause
    exit /b 1
)

REM Verificar si Docker está corriendo
docker info >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker no está corriendo
    echo    Inicia Docker Desktop y vuelve a ejecutar este script
    pause
    exit /b 1
)

REM Verificar si el contenedor ya existe
docker ps -a | findstr gpmedical-db >nul
if %errorlevel% equ 0 (
    echo 📦 Contenedor existente encontrado

    REM Verificar si está corriendo
    docker ps | findstr gpmedical-db >nul
    if %errorlevel% equ 0 (
        echo ✅ Base de datos ya está corriendo
    ) else (
        echo 🔄 Iniciando contenedor existente...
        docker start gpmedical-db
        echo ✅ Base de datos iniciada
    )
) else (
    echo 📦 Creando nuevo contenedor de PostgreSQL...
    docker run -d --name gpmedical-db -p 5432:5432 -e POSTGRES_DB=gpmedical -e POSTGRES_USER=gpmedical -e POSTGRES_PASSWORD=gpmedical -v gpmedical-data:/var/lib/postgresql/data postgres:15

    echo ⏳ Esperando a que PostgreSQL inicie...
    timeout /t 5 /nobreak >nul
    echo ✅ Base de datos creada e iniciada
)

echo.
echo 📍 Conexión:
echo    Host: localhost
echo    Port: 5432
echo    Database: gpmedical
echo    User: gpmedical
echo    Password: gpmedical
echo.
echo 💡 Para detener: docker stop gpmedical-db
echo 💡 Para ver logs: docker logs gpmedical-db
echo.
pause
