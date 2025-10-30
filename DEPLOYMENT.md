# 🚀 Guía de Despliegue - GP-Medical

Esta guía proporciona instrucciones detalladas para desplegar GP-Medical en producción con **presupuesto mínimo**.

## 📋 Tabla de Contenidos

- [Preparación del Sistema](#preparación-del-sistema)
- [Opción 1: Railway + Vercel + Supabase (Recomendado)](#opción-1-railway--vercel--supabase-recomendado)
- [Opción 2: Render + Vercel + Supabase](#opción-2-render--vercel--supabase)
- [Configuración de Base de Datos](#configuración-de-base-de-datos)
- [Variables de Entorno](#variables-de-entorno)
- [Primeros Pasos Post-Despliegue](#primeros-pasos-post-despliegue)
- [Costos Estimados](#costos-estimados)

---

## ⚠️ IMPORTANTE - Requisitos Previos

Antes de desplegar, asegúrate de tener:

1. ✅ Una cuenta de GitHub con el repositorio GP-Medical
2. ✅ Una tarjeta de crédito/débito para servicios (aunque uses tier gratuito)
3. ✅ API Keys necesarios:
   - OpenAI API Key (para funciones de IA)
   - Stripe API Keys (para pagos)
4. ✅ Un dominio (opcional pero recomendado)

---

## 📦 Preparación del Sistema

### 1. Crear Base de Datos Inicial

Antes de desplegar, necesitas crear las tablas en la base de datos y un usuario administrador inicial.

**Opción A: Localmente (Recomendado)**
```bash
# 1. Configurar base de datos local
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 2. Crear archivo .env con tu DATABASE_URL
cp .env.example .env
# Editar .env con tu conexión a Supabase

# 3. Crear tablas
python -c "
from app.core.database import engine, Base
from app.models import *
import asyncio

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('✅ Tablas creadas exitosamente')

asyncio.run(create_tables())
"

# 4. Crear usuario administrador inicial
python scripts/create_admin.py
```

**Opción B: Script de Inicialización**

Crear archivo `backend/scripts/create_admin.py`:
```python
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db, engine
from app.core.security import get_password_hash
from app.models.tenant import Empresa
from app.models.user import Usuario, Rol, UsuarioRol

async def create_initial_data():
    async with AsyncSession(engine) as db:
        # Crear empresa por defecto
        empresa = Empresa(
            nombre="Mi Clínica",
            razon_social="Mi Clínica S.A. de C.V.",
            rfc="XAXX010101000",
            slug="mi-clinica",
            email="admin@miclinica.com",
            pais="MX",
        )
        db.add(empresa)
        await db.flush()

        # Crear rol admin
        rol_admin = Rol(
            empresa_id=empresa.id,
            nombre="Administrador",
            codigo="ADMIN",
            descripcion="Administrador del sistema",
            es_sistema=True,
        )
        db.add(rol_admin)
        await db.flush()

        # Crear usuario admin
        admin_user = Usuario(
            empresa_id=empresa.id,
            email="admin@miclinica.com",
            username="admin",
            hashed_password=get_password_hash("admin123"),  # CAMBIAR EN PRODUCCIÓN
            nombre="Administrador",
            apellido_paterno="Sistema",
            is_superuser=True,
            is_active=True,
        )
        db.add(admin_user)
        await db.flush()

        # Asignar rol
        usuario_rol = UsuarioRol(
            usuario_id=admin_user.id,
            rol_id=rol_admin.id,
        )
        db.add(usuario_rol)

        await db.commit()
        print(f"✅ Datos iniciales creados")
        print(f"📧 Email: admin@miclinica.com")
        print(f"🔑 Password: admin123")
        print("⚠️  CAMBIAR PASSWORD EN PRIMERA SESIÓN")

asyncio.run(create_initial_data())
```

---

## 🎯 Opción 1: Railway + Vercel + Supabase (Recomendado)

**Costo**: $5-10/mes + OpenAI pay-as-you-go (~$10-20/mes)

### Paso 1: Configurar Base de Datos (Supabase)

1. **Crear cuenta en Supabase**
   - Ir a https://supabase.com
   - Sign up con GitHub
   - Crear nuevo proyecto

2. **Obtener credenciales**
   - En Project Settings > Database
   - Copiar "Connection string" (URI mode)
   - Cambiar `postgresql://` por `postgresql+asyncpg://`

   Ejemplo:
   ```
   postgresql+asyncpg://postgres:TU_PASSWORD@db.xxx.supabase.co:5432/postgres
   ```

3. **Ejecutar migraciones**
   - Usar la Opción A de "Preparación del Sistema" arriba
   - Configurar DATABASE_URL en tu .env local
   - Ejecutar script de creación de tablas y admin

### Paso 2: Desplegar Backend (Railway)

1. **Crear cuenta en Railway**
   - Ir a https://railway.app
   - Sign up con GitHub

2. **Crear nuevo proyecto**
   - Click "New Project"
   - Seleccionar "Deploy from GitHub repo"
   - Conectar tu repositorio GP-Medical
   - Seleccionar rama `main`

3. **Configurar servicio**
   - Railway detectará automáticamente el backend
   - Si no, crear nuevo servicio
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **Configurar Variables de Entorno**

   En Railway > Settings > Variables, agregar:
   ```env
   # Esenciales
   ENVIRONMENT=production
   DEBUG=false
   SECRET_KEY=TU_SECRET_KEY_GENERADO  # usar: openssl rand -hex 32
   DATABASE_URL=postgresql+asyncpg://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres

   # CORS (tu frontend URL)
   CORS_ORIGINS=https://tu-app.vercel.app

   # APIs
   OPENAI_API_KEY=sk-tu-openai-key
   STRIPE_SECRET_KEY=sk_live_tu-stripe-key
   STRIPE_PUBLISHABLE_KEY=pk_live_tu-stripe-key

   # PAC (si usas facturación)
   PAC_PROVIDER=finkok
   PAC_USERNAME=tu-usuario
   PAC_PASSWORD=tu-password
   PAC_ENDPOINT=https://facturacion.finkok.com/servicios/soap

   # Opcionales
   SENTRY_DSN=tu-sentry-dsn
   ```

5. **Deploy**
   - Railway desplegará automáticamente
   - Obtener URL del servicio (ej: `https://tu-app.railway.app`)

### Paso 3: Desplegar Frontend (Vercel)

1. **Crear cuenta en Vercel**
   - Ir a https://vercel.com
   - Sign up con GitHub

2. **Importar proyecto**
   - Click "New Project"
   - Importar tu repositorio GP-Medical
   - Framework Preset: Next.js
   - Root Directory: `frontend`

3. **Configurar Variables de Entorno**
   ```env
   NEXT_PUBLIC_API_URL=https://tu-app.railway.app
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_tu-stripe-key
   ```

4. **Deploy**
   - Click "Deploy"
   - Esperar a que termine
   - Obtener URL (ej: `https://tu-app.vercel.app`)

5. **Actualizar CORS en Railway**
   - Volver a Railway
   - Actualizar `CORS_ORIGINS` con tu URL de Vercel
   - Railway redesplegará automáticamente

---

## 🎯 Opción 2: Render + Vercel + Supabase

**Costo**: $0-7/mes (tier gratuito con limitaciones)

### Paso 1: Base de Datos (Supabase)
- Seguir los mismos pasos que en Opción 1

### Paso 2: Backend (Render)

1. **Crear cuenta en Render**
   - Ir a https://render.com
   - Sign up con GitHub

2. **Crear Web Service**
   - Dashboard > New > Web Service
   - Conectar repositorio GP-Medical
   - Name: `gp-medical-api`
   - Environment: Python 3
   - Region: Cerca de tus usuarios
   - Branch: `main`
   - Root Directory: `backend`

3. **Configurar Build**
   ```
   Build Command: pip install -r requirements.txt
   Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```

4. **Plan**
   - Elegir "Free" (con limitaciones) o "Starter" ($7/mes)
   - Free tier: se suspende tras 15 min de inactividad

5. **Variables de Entorno**
   - Agregar las mismas que en Railway
   - Environment Variables section

6. **Deploy**
   - Render desplegará automáticamente
   - URL: `https://gp-medical-api.onrender.com`

### Paso 3: Frontend (Vercel)
- Seguir los mismos pasos que en Opción 1

---

## 📊 Configuración de Base de Datos

### Crear Tablas

Si no ejecutaste el script local, puedes crear las tablas directamente:

```python
# Conectar a Supabase SQL Editor y ejecutar:
# O usar psql localmente conectado a Supabase

# Las tablas se crearán automáticamente al iniciar el backend
# si tienes ENVIRONMENT=development

# Para producción, usar Alembic:
cd backend
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

### Crear Usuario Administrador

```python
# Usar el script create_admin.py mencionado arriba
# O crear manualmente en Supabase SQL Editor:

INSERT INTO empresas (
    nombre, razon_social, rfc, slug, email, pais,
    activo, plan, fecha_creacion, fecha_actualizacion
) VALUES (
    'Mi Clínica',
    'Mi Clínica S.A. de C.V.',
    'XAXX010101000',
    'mi-clinica',
    'admin@miclinica.com',
    'MX',
    true,
    'premium',
    NOW(),
    NOW()
) RETURNING id;

-- Usar el ID de la empresa para crear el usuario
-- Hash para 'admin123': usa Python para generar
-- from passlib.context import CryptContext
-- pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
-- pwd_context.hash("admin123")
```

---

## 🔐 Variables de Entorno

### Backend (Mínimas Requeridas)

```env
# Base de datos
DATABASE_URL=postgresql+asyncpg://...

# Seguridad
SECRET_KEY=tu-secret-key-de-32-caracteres  # openssl rand -hex 32
ENVIRONMENT=production
DEBUG=false

# CORS
CORS_ORIGINS=https://tu-frontend.vercel.app

# IA (requerido)
OPENAI_API_KEY=sk-...

# Pagos (requerido)
STRIPE_SECRET_KEY=sk_live_...
```

### Frontend (Mínimas Requeridas)

```env
NEXT_PUBLIC_API_URL=https://tu-backend.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

## ✅ Primeros Pasos Post-Despliegue

### 1. Verificar Backend

```bash
# Health check
curl https://tu-backend.railway.app/health

# Debería responder:
# {"status":"healthy","version":"1.0.0","environment":"production"}
```

### 2. Probar Login

```bash
curl -X POST https://tu-backend.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@miclinica.com","password":"admin123"}'

# Debería devolver:
# {"access_token":"eyJ...","refresh_token":"eyJ...","token_type":"bearer"}
```

### 3. Acceder al Frontend

1. Ir a `https://tu-frontend.vercel.app`
2. Login con:
   - Email: `admin@miclinica.com`
   - Password: `admin123`
3. **IMPORTANTE**: Cambiar password inmediatamente en Configuración

### 4. Configurar Empresa

1. Ir a Configuración > Empresa
2. Actualizar:
   - Nombre y datos de la empresa
   - RFC real
   - Logo
   - Colores de marca
3. Configurar régimen fiscal y series de facturación

### 5. Crear Usuarios

1. Ir a Configuración > Usuarios
2. Crear usuarios para:
   - Médicos
   - Recepción
   - Caja
3. Asignar roles apropiados

---

## 💰 Costos Estimados

### Setup Mínimo (Empezar con $10-25/mes)

| Servicio | Plan | Costo Mensual |
|----------|------|---------------|
| **Supabase** | Free | $0 |
| **Railway** | Hobby ($5) o Pay-as-you-go | $5-10 |
| **Vercel** | Hobby | $0 |
| **OpenAI** | Pay-as-you-go | $10-20 |
| **Stripe** | Pay-as-you-go | $0 + fees |
| **TOTAL INICIAL** | | **$15-30/mes** |

### Setup Recomendado (Producción - $50-100/mes)

| Servicio | Plan | Costo Mensual |
|----------|------|---------------|
| **Supabase** | Pro | $25 |
| **Railway** | Pro | $20 |
| **Vercel** | Pro | $20 |
| **OpenAI** | Pay-as-you-go | $20-50 |
| **Stripe** | Pay-as-you-go | 2.9% + $0.30 por transacción |
| **Sentry** (monitoreo) | Free/Team | $0-26 |
| **TOTAL** | | **$85-141/mes** |

---

## 🔧 Troubleshooting

### Error: "Could not connect to database"

1. Verificar DATABASE_URL está correcto
2. Verificar que Supabase permite conexiones externas
3. Verificar formato: `postgresql+asyncpg://...`

### Error: "CORS policy blocking requests"

1. Verificar CORS_ORIGINS en backend incluye tu frontend URL
2. No incluir slash final: ✅ `https://app.com` ❌ `https://app.com/`
3. Redesplegar backend después de cambiar

### Error: "Invalid JWT token"

1. Verificar SECRET_KEY es igual en backend y no cambió después de login
2. Regenerar token haciendo login nuevamente
3. Verificar fecha/hora del servidor está correcta

### Backend muy lento en Render (Free tier)

- El tier gratuito de Render se suspende tras 15 min de inactividad
- Primera request tarda ~30s en despertar
- **Solución**: Upgrade a Starter ($7/mes) o usar Railway

---

## 📚 Recursos Adicionales

- [Documentación de Railway](https://docs.railway.app/)
- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Stripe](https://stripe.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)

---

## 🆘 Soporte

Si necesitas ayuda con el despliegue:

1. Verificar logs en Railway/Render para errores
2. Verificar todas las variables de entorno están configuradas
3. Revisar que la base de datos tiene tablas y usuario admin
4. Contactar soporte técnico

---

**¡Feliz despliegue! 🚀**
