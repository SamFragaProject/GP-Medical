# 🔥 Despliegue con Firebase Data Connect

**¡NUEVO!** Firebase Data Connect permite usar PostgreSQL con Firebase.

Esta guía muestra cómo desplegar GP-Medical usando la **nueva** funcionalidad de Firebase que soporta bases de datos SQL.

---

## 🎯 Arquitectura con Firebase Data Connect

```
┌──────────────────────────────────────────────┐
│            USUARIO FINAL                     │
└──────────────┬───────────────────────────────┘
               │
    ┌──────────▼─────────────┐
    │  Firebase Hosting       │  🎨 Frontend (Next.js)
    │  CDN Global             │
    └──────────┬──────────────┘
               │
    ┌──────────▼─────────────┐
    │  Cloud Functions        │  ⚙️  Backend (FastAPI)
    │  2nd Gen (Cloud Run)    │
    └──────────┬──────────────┘
               │
    ┌──────────▼─────────────┐
    │  Firebase Data Connect  │  🗄️  PostgreSQL
    │  (Cloud SQL)            │     Managed DB
    └──────────────────────────┘
               │
    ┌──────────▼─────────────┐
    │  Firebase Auth          │  🔐 Autenticación
    └──────────────────────────┘
```

---

## ✨ Ventajas de Firebase Data Connect

- ✅ **PostgreSQL nativo** - Compatible con tu sistema
- ✅ **Firebase Hosting** - CDN global ultrarrápido
- ✅ **Firebase Auth** - Autenticación lista (opcional)
- ✅ **Cloud Functions 2nd Gen** - Basado en Cloud Run
- ✅ **Consola unificada** - Todo desde Firebase Console
- ✅ **SDK integrado** - Queries type-safe opcionales

---

## 💰 Costos Estimados

### Plan Spark (Gratis)
- Firebase Hosting: 10 GB/mes gratis
- Cloud Functions: 2M invocaciones/mes gratis
- ⚠️ Cloud SQL requiere Plan Blaze

### Plan Blaze (Pay-as-you-go)
- Hosting: $0.15/GB después de 10GB
- Functions: $0.40 por millón de invocaciones
- Cloud SQL: ~$10-25/mes (db-f1-micro o db-g1-small)
- **Total estimado: $15-35/mes**

---

## 📋 Prerrequisitos

1. **Cuenta de Firebase/Google Cloud**
   - Ir a https://console.firebase.google.com
   - Crear proyecto nuevo
   - Actualizar a Plan Blaze (para Cloud SQL)

2. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

3. **gcloud CLI** (para Data Connect)
   ```bash
   # Mac
   brew install google-cloud-sdk

   # Windows/Linux
   # https://cloud.google.com/sdk/docs/install
   ```

---

## 🗄️ Paso 1: Configurar Firebase Data Connect (PostgreSQL)

### 1.1 Habilitar Firebase Data Connect

```bash
# Seleccionar proyecto
firebase projects:list
firebase use TU_PROYECTO_ID

# Habilitar APIs necesarias
gcloud services enable sqladmin.googleapis.com
gcloud services enable firebase.googleapis.com
gcloud services enable firebasedataconnect.googleapis.com
```

### 1.2 Crear instancia Cloud SQL desde Firebase

1. Ir a Firebase Console: https://console.firebase.google.com
2. Seleccionar tu proyecto
3. En el menú lateral: **Build > Data Connect** (nuevo)
4. Click "Get Started"
5. Elegir:
   - **Location**: us-central1 (o más cercano)
   - **Database type**: PostgreSQL 15
   - **Instance tier**: db-f1-micro (desarrollo) o db-g1-small (producción)

### 1.3 Obtener credenciales de conexión

```bash
# Listar instancias
gcloud sql instances list

# Obtener connection name
gcloud sql instances describe TU_INSTANCIA_ID \
    --format='value(connectionName)'

# Ejemplo de output:
# tu-proyecto:us-central1:gpmedical-db

# Crear base de datos
gcloud sql databases create gpmedical \
    --instance=TU_INSTANCIA_ID

# Crear usuario
gcloud sql users create gpmedical \
    --instance=TU_INSTANCIA_ID \
    --password=TU_PASSWORD_SEGURO
```

### 1.4 Crear tablas en PostgreSQL

Opción A: Cloud SQL Proxy (Recomendado)

```bash
# Descargar Cloud SQL Proxy
# https://cloud.google.com/sql/docs/postgres/sql-proxy

# Conectar localmente
./cloud-sql-proxy TU_PROYECTO:us-central1:gpmedical-db

# En otra terminal
cd backend
source venv/bin/activate

# Configurar DATABASE_URL temporal
export DATABASE_URL="postgresql+asyncpg://gpmedical:PASSWORD@localhost:5432/gpmedical"

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
```

---

## ☁️ Paso 2: Desplegar Backend con Cloud Functions

Firebase Cloud Functions 2nd Gen usa Cloud Run internamente, perfecto para FastAPI.

### 2.1 Crear función para FastAPI

Crear `backend/main_firebase.py`:

```python
"""
Firebase Cloud Functions entry point
"""
from app.main import app

# Cloud Functions 2nd Gen espera una variable llamada 'app'
# Nuestro FastAPI ya se llama 'app', no hay que cambiar nada!
```

### 2.2 Crear `backend/requirements-functions.txt`

```txt
# Firebase Functions específico
functions-framework==3.*

# Incluir requirements principales
-r requirements.txt
```

### 2.3 Inicializar Firebase Functions

```bash
cd backend

# Inicializar
firebase init functions

# Seleccionar:
# - Language: Python
# - Install dependencies: Yes

# Esto crea:
# - functions/ directory
# - .firebaserc
# - firebase.json
```

### 2.4 Configurar `backend/firebase.json`

```json
{
  "functions": [
    {
      "source": ".",
      "codebase": "api",
      "runtime": "python311",
      "ignore": [
        "venv",
        ".git",
        "__pycache__"
      ]
    }
  ]
}
```

### 2.5 Configurar variables de entorno

```bash
# Configurar secrets en Firebase
firebase functions:secrets:set DATABASE_URL
# Pegar: postgresql+asyncpg://gpmedical:PASSWORD@/gpmedical?host=/cloudsql/TU_PROYECTO:us-central1:gpmedical-db

firebase functions:secrets:set SECRET_KEY
# Pegar: tu-secret-key (generar con: openssl rand -hex 32)

firebase functions:secrets:set OPENAI_API_KEY
# Pegar: sk-tu-openai-key

firebase functions:secrets:set STRIPE_SECRET_KEY
# Pegar: sk_tu-stripe-key
```

### 2.6 Crear `backend/functions/main.py`

```python
"""
Firebase Cloud Function para FastAPI
"""
from firebase_functions import https_fn, options
from app.main import app
import os

# Configurar opciones
opts = options.CorsOptions(
    cors_origins=["*"],  # Configurar con tu dominio en producción
    cors_methods=["get", "post", "put", "delete", "options"],
)

# Definir función
@https_fn.on_request(
    cors=opts,
    secrets=["DATABASE_URL", "SECRET_KEY", "OPENAI_API_KEY", "STRIPE_SECRET_KEY"],
    memory=options.MemoryOption.MB_512,
    timeout_sec=300,
    max_instances=10,
)
def api(req: https_fn.Request) -> https_fn.Response:
    """
    Cloud Function que sirve FastAPI
    """
    # Cloud Functions 2nd Gen usa Cloud Run, compatible con ASGI
    return app(req.environ, req.start_response)
```

### 2.7 Deploy backend

```bash
cd backend

# Deploy
firebase deploy --only functions

# Output mostrará URL:
# Function URL (api): https://us-central1-tu-proyecto.cloudfunctions.net/api
```

---

## 🎨 Paso 3: Desplegar Frontend con Firebase Hosting

### 3.1 Preparar Next.js para export

Editar `frontend/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,

  // Reemplazar con tu URL de Cloud Functions
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ||
      'https://us-central1-tu-proyecto.cloudfunctions.net/api'
  }
}

module.exports = nextConfig
```

### 3.2 Inicializar Firebase Hosting

```bash
cd frontend

firebase init hosting

# Responder:
# Public directory: out
# Configure as SPA: Yes
# GitHub deploys: No
```

### 3.3 Configurar `frontend/firebase.json`

```json
{
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "/api/**",
        "function": "api"
      },
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(jpg|jpeg|gif|png|svg|webp)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  }
}
```

### 3.4 Configurar variables de entorno

Crear `frontend/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://us-central1-tu-proyecto.cloudfunctions.net/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_tu-stripe-key
```

### 3.5 Build y Deploy

```bash
cd frontend

# Install dependencies
npm install

# Build
npm run build

# Deploy
firebase deploy --only hosting

# URL: https://tu-proyecto.web.app
```

---

## 🔗 Paso 4: Integración Opcional - Firebase Auth

Firebase Auth puede reemplazar tu sistema JWT actual (opcional).

### 4.1 Habilitar Firebase Auth

1. Firebase Console > Authentication
2. Get Started
3. Habilitar providers:
   - Email/Password
   - Google
   - Otros según necesites

### 4.2 Instalar SDK en frontend

```bash
cd frontend
npm install firebase
```

### 4.3 Configurar Firebase en frontend

Crear `frontend/src/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### 4.4 Adaptar backend para Firebase Auth

Modificar `backend/app/core/deps.py`:

```python
from firebase_admin import auth, initialize_app

# Inicializar Firebase Admin (una vez)
try:
    initialize_app()
except ValueError:
    pass  # Ya inicializado

async def get_current_user_firebase(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Usuario:
    """Autenticar con Firebase Auth Token"""
    try:
        # Verificar token de Firebase
        decoded_token = auth.verify_id_token(credentials.credentials)
        uid = decoded_token['uid']
        email = decoded_token.get('email')

        # Buscar usuario en tu base de datos por email
        result = await db.execute(
            select(Usuario).where(Usuario.email == email)
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

        return user

    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))
```

---

## 📊 Paso 5: Monitoreo y Logs

### Firebase Console

1. **Functions logs**: https://console.firebase.google.com/project/_/functions
2. **Hosting analytics**: Dashboard > Hosting
3. **Database**: Data Connect > Query browser

### Cloud Console

```bash
# Ver logs de Cloud Functions
firebase functions:log

# Ver logs en tiempo real
firebase functions:log --follow

# Logs de Cloud SQL
gcloud sql operations list --instance=gpmedical-db
```

---

## 🚀 Despliegue Continuo (CI/CD)

### GitHub Actions con Firebase

Crear `.github/workflows/firebase-deploy.yml`:

```yaml
name: Deploy to Firebase

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Setup Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      # Backend
      - name: Install backend deps
        run: |
          cd backend
          pip install -r requirements-functions.txt

      # Frontend
      - name: Install frontend deps
        run: |
          cd frontend
          npm ci

      - name: Build frontend
        run: |
          cd frontend
          npm run build

      # Deploy
      - name: Deploy to Firebase
        uses: w9jds/firebase-action@master
        with:
          args: deploy --only functions,hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### Obtener FIREBASE_TOKEN

```bash
firebase login:ci
# Copia el token generado y agrégalo a GitHub Secrets
```

---

## 🔧 Configuración Avanzada

### 1. Dominio personalizado

```bash
# Agregar dominio
firebase hosting:channel:deploy production \
    --site tu-proyecto

# Luego en Firebase Console > Hosting > Add custom domain
```

### 2. CORS configuración

Editar `backend/functions/main.py`:

```python
opts = options.CorsOptions(
    cors_origins=[
        "https://tu-proyecto.web.app",
        "https://tu-dominio.com"
    ],
    cors_methods=["get", "post", "put", "delete", "options"],
)
```

### 3. Optimizar costos

```bash
# Reducir memoria si no usas mucho
firebase functions:config:set runtime.memory=256MB

# Ajustar timeout
firebase functions:config:set runtime.timeout=60s

# Min instances (0 = ahorra, pero cold start)
# En production.py:
# min_instances=1  # Evita cold starts pero cuesta más
```

---

## ❓ Troubleshooting

### Error: "Cloud SQL connection failed"

```bash
# Verificar que backend tiene acceso a Cloud SQL
gcloud projects add-iam-policy-binding TU_PROYECTO \
    --member="serviceAccount:TU_PROYECTO@appspot.gserviceaccount.com" \
    --role="roles/cloudsql.client"
```

### Error: "Function timeout"

```python
# Aumentar timeout en main.py
@https_fn.on_request(
    timeout_sec=540,  # Max 540s (9 min) para gen 2
)
```

### Cold starts lentos

```python
# Configurar min_instances
@https_fn.on_request(
    min_instances=1,  # Mantiene al menos 1 instancia caliente
)
```

---

## 📈 Comparación: Firebase vs Otras Opciones

| Característica | Firebase Data Connect | Railway | GCP Directo |
|---------------|----------------------|---------|-------------|
| **Setup** | Medio | Fácil | Complejo |
| **Costo inicial** | $15-35/mes | $15-30/mes | $25-40/mes |
| **PostgreSQL** | ✅ Cloud SQL | ✅ Incluido | ✅ Cloud SQL |
| **CDN Global** | ✅ Gratis | ❌ | ⚠️ Extra |
| **Auth integrado** | ✅ Firebase Auth | ❌ | ⚠️ Identity Platform |
| **Consola unificada** | ✅ | ✅ | ❌ |
| **Free tier** | ⚠️ Limitado | ❌ | ✅ $300 |

---

## ✅ Checklist de Deployment

- [ ] Proyecto Firebase creado y actualizado a Blaze
- [ ] Firebase Data Connect habilitado
- [ ] Cloud SQL (PostgreSQL) creado y configurado
- [ ] Tablas creadas con create_admin.py
- [ ] Usuario admin creado
- [ ] Secrets configurados (DATABASE_URL, SECRET_KEY, etc.)
- [ ] Backend desplegado con `firebase deploy --only functions`
- [ ] Frontend build generado (`npm run build`)
- [ ] Frontend desplegado con `firebase deploy --only hosting`
- [ ] CORS configurado con dominio correcto
- [ ] Probado login en https://tu-proyecto.web.app
- [ ] Monitoreo configurado

---

## 🎯 Próximos Pasos

Una vez desplegado:

1. **Configurar dominio personalizado**
2. **Habilitar Firebase Auth** (opcional)
3. **Configurar alertas** en Firebase Console
4. **Setup CI/CD** con GitHub Actions
5. **Monitorear costos** en Billing

---

## 📚 Recursos

- [Firebase Data Connect Docs](https://firebase.google.com/docs/data-connect)
- [Cloud Functions 2nd Gen](https://firebase.google.com/docs/functions)
- [Firebase Hosting](https://firebase.google.com/docs/hosting)
- [Cloud SQL](https://cloud.google.com/sql/docs)

---

**¡Firebase Data Connect hace viable usar Firebase con PostgreSQL para GP-Medical!** 🎉

La ventaja principal es la **consola unificada** y el **CDN global gratuito** de Firebase Hosting.
