# ⚡ Quick Start - Ver GP-Medical en 5 Minutos

Guía rápida para visualizar el sistema localmente en VSCode.

## 📋 Pre-requisitos Rápidos

```bash
# Verificar que tienes todo instalado:
python --version   # Necesitas 3.11+
node --version     # Necesitas 18+
psql --version     # PostgreSQL
```

Si falta algo, ve a [LOCAL-SETUP.md](./LOCAL-SETUP.md) para instrucciones completas.

---

## 🚀 5 Pasos Rápidos

### 1. Base de Datos (Opción Fácil: Docker)

```bash
# Iniciar PostgreSQL con Docker
docker run -d \
  --name gpmedical-db \
  -p 5432:5432 \
  -e POSTGRES_DB=gpmedical \
  -e POSTGRES_USER=gpmedical \
  -e POSTGRES_PASSWORD=gpmedical \
  postgres:15
```

### 2. Backend

```bash
# Terminal 1
cd backend

# Crear virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar .env
cp .env.example .env
# (Usar valores por defecto está OK para desarrollo local)

# Crear tablas
python -c "
from app.core.database import engine, Base
from app.models import *
import asyncio
async def create():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('✅ Tablas creadas')
asyncio.run(create())
"

# Crear usuario admin
python scripts/create_admin.py

# Iniciar servidor
uvicorn app.main:app --reload
```

**✅ Backend:** http://localhost:8000
**📚 API Docs:** http://localhost:8000/docs

### 3. Frontend

```bash
# Terminal 2 (nueva terminal en VSCode)
cd frontend

# Instalar dependencias
npm install

# Configurar .env
cp .env.example .env.local
# (Valores por defecto están OK)

# Iniciar servidor
npm run dev
```

**✅ Frontend:** http://localhost:3000

### 4. Login

Abrir navegador en http://localhost:3000

```
Email: admin@miclinica.com
Password: admin123
```

### 5. ¡Explora!

Todos los módulos funcionan:
- Dashboard
- Pacientes
- Agenda
- Expediente Clínico
- Recetas
- Inventario
- Facturación
- CRM
- Reportes
- Configuración

---

## 🎯 Troubleshooting Rápido

### Base de datos no conecta

```bash
# Verificar que Docker está corriendo
docker ps

# Reiniciar contenedor
docker restart gpmedical-db
```

### Puerto ya en uso

```bash
# Matar proceso en puerto 8000
lsof -ti:8000 | xargs kill -9

# Matar proceso en puerto 3000
lsof -ti:3000 | xargs kill -9
```

### Error al importar módulos Python

```bash
# Asegúrate de estar en backend/ y venv activado
cd backend
source venv/bin/activate
```

---

## 📚 Siguiente Paso

Una vez que veas todo funcionando:

1. **Explora el código** - Abre archivos en VSCode
2. **Lee documentación completa** - [LOCAL-SETUP.md](./LOCAL-SETUP.md)
3. **Decide plataforma de despliegue** - [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 🆘 ¿Problemas?

Ver [LOCAL-SETUP.md](./LOCAL-SETUP.md) para:
- Instalación detallada de prerrequisitos
- Opciones alternativas (sin Docker)
- Troubleshooting completo
- Configuración de VSCode
- Debugging

---

**¡Listo! 🎉 Ahora tienes GP-Medical corriendo localmente.**

Para desplegar en producción:
- Railway + Vercel: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Google Cloud: [DEPLOYMENT-GCP.md](./DEPLOYMENT-GCP.md)
