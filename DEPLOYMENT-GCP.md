# 🔥 Despliegue en Google Cloud Platform

Guía para desplegar GP-Medical usando servicios de Google Cloud Platform (Firebase, Cloud Run, Cloud SQL).

## ⚠️ Aclaración Importante: Firebase y SQL

**Firebase NO tiene base de datos SQL nativa.** Este sistema requiere PostgreSQL.

### ✅ Arquitectura Recomendada con GCP:

```
┌─────────────────────────────────────────────┐
│              USUARIO FINAL                  │
└─────────────────┬───────────────────────────┘
                  │
    ┌─────────────▼──────────────┐
    │   Firebase Hosting          │ 🎨 Frontend (Next.js)
    │   o Cloud Storage           │    Archivos estáticos
    └─────────────┬───────────────┘
                  │
    ┌─────────────▼──────────────┐
    │   Cloud Run                 │ ⚙️  Backend (FastAPI)
    │   (Contenedor Docker)       │    Auto-scaling
    └─────────────┬───────────────┘
                  │
    ┌─────────────▼──────────────┐
    │   Cloud SQL                 │ 🗄️  PostgreSQL
    │   (PostgreSQL 15)           │    Managed database
    └─────────────────────────────┘
```

---

## 💰 Costos Estimados GCP

### Desarrollo/Pruebas
- Cloud SQL (db-f1-micro): ~$7/mes
- Cloud Run (minimal traffic): ~$5-10/mes
- Cloud Storage/Firebase Hosting: ~$0-1/mes
- **Total: ~$12-18/mes**

### Producción
- Cloud SQL (db-g1-small): ~$25/mes
- Cloud Run (moderate traffic): ~$20-40/mes
- Cloud Storage/Firebase Hosting: ~$1-5/mes
- **Total: ~$46-70/mes**

---

## 📋 Prerrequisitos

1. **Cuenta de Google Cloud Platform**
   - Ir a https://console.cloud.google.com
   - Crear cuenta (incluye $300 créditos gratis)

2. **gcloud CLI instalado**
   ```bash
   # Mac
   brew install google-cloud-sdk

   # Windows
   # Descargar de: https://cloud.google.com/sdk/docs/install

   # Linux
   curl https://sdk.cloud.google.com | bash
   ```

3. **Docker instalado**
   - https://www.docker.com/get-started

4. **Proyecto de GCP creado**
   ```bash
   gcloud projects create gp-medical-prod
   gcloud config set project gp-medical-prod
   ```

---

## 🗄️ Paso 1: Configurar Cloud SQL (PostgreSQL)

### 1.1 Crear instancia de Cloud SQL

```bash
# Crear instancia PostgreSQL
gcloud sql instances create gpmedical-db \
    --database-version=POSTGRES_15 \
    --tier=db-f1-micro \
    --region=us-central1 \
    --root-password=TU_PASSWORD_SEGURO

# Crear base de datos
gcloud sql databases create gpmedical \
    --instance=gpmedical-db

# Crear usuario
gcloud sql users create gpmedical \
    --instance=gpmedical-db \
    --password=TU_PASSWORD_USUARIO
```

### 1.2 Obtener connection string

```bash
gcloud sql instances describe gpmedical-db
```

Connection string format:
```
postgresql+asyncpg://gpmedical:PASSWORD@/gpmedical?host=/cloudsql/PROJECT_ID:REGION:gpmedical-db
```

### 1.3 Configurar acceso desde Cloud Run

```bash
# Habilitar Cloud SQL Admin API
gcloud services enable sqladmin.googleapis.com
```

---

## 🐳 Paso 2: Preparar Backend para Cloud Run

### 2.1 Crear Dockerfile optimizado

Crear `backend/Dockerfile.cloudrun`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código
COPY . .

# Usuario no-root
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Exponer puerto
ENV PORT=8080
EXPOSE 8080

# Comando de inicio
CMD uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

### 2.2 Crear archivo .dockerignore

Crear `backend/.dockerignore`:

```
__pycache__
*.pyc
*.pyo
*.pyd
.Python
venv/
env/
.env
.git
.gitignore
*.md
tests/
.pytest_cache
.coverage
htmlcov/
```

### 2.3 Build y test local

```bash
cd backend

# Build
docker build -f Dockerfile.cloudrun -t gpmedical-api .

# Test local
docker run -p 8080:8080 \
    -e DATABASE_URL="postgresql+asyncpg://..." \
    -e SECRET_KEY="test-key" \
    gpmedical-api
```

---

## ☁️ Paso 3: Desplegar Backend en Cloud Run

### 3.1 Configurar Artifact Registry

```bash
# Habilitar API
gcloud services enable artifactregistry.googleapis.com

# Crear repositorio
gcloud artifacts repositories create gpmedical-repo \
    --repository-format=docker \
    --location=us-central1

# Configurar Docker para autenticar
gcloud auth configure-docker us-central1-docker.pkg.dev
```

### 3.2 Build y Push imagen

```bash
cd backend

# Configurar variables
PROJECT_ID=$(gcloud config get-value project)
IMAGE_NAME="us-central1-docker.pkg.dev/$PROJECT_ID/gpmedical-repo/backend"

# Build para Cloud Run
docker build -f Dockerfile.cloudrun -t $IMAGE_NAME .

# Push a Artifact Registry
docker push $IMAGE_NAME
```

### 3.3 Deploy a Cloud Run

```bash
# Obtener connection name de Cloud SQL
CONNECTION_NAME=$(gcloud sql instances describe gpmedical-db --format='value(connectionName)')

# Deploy
gcloud run deploy gpmedical-api \
    --image $IMAGE_NAME \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --add-cloudsql-instances $CONNECTION_NAME \
    --set-env-vars "ENVIRONMENT=production" \
    --set-env-vars "DATABASE_URL=postgresql+asyncpg://gpmedical:PASSWORD@/gpmedical?host=/cloudsql/$CONNECTION_NAME" \
    --set-secrets "SECRET_KEY=secret-key:latest" \
    --set-secrets "OPENAI_API_KEY=openai-key:latest" \
    --set-secrets "STRIPE_SECRET_KEY=stripe-key:latest" \
    --min-instances 1 \
    --max-instances 10 \
    --memory 512Mi \
    --cpu 1 \
    --timeout 300
```

### 3.4 Configurar Secrets (Recomendado)

```bash
# Crear secrets en Secret Manager
echo -n "tu-secret-key" | gcloud secrets create secret-key --data-file=-
echo -n "sk-tu-openai-key" | gcloud secrets create openai-key --data-file=-
echo -n "sk-tu-stripe-key" | gcloud secrets create stripe-key --data-file=-

# Dar acceso a Cloud Run
gcloud secrets add-iam-policy-binding secret-key \
    --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
```

### 3.5 Obtener URL del servicio

```bash
gcloud run services describe gpmedical-api \
    --platform managed \
    --region us-central1 \
    --format 'value(status.url)'
```

URL ejemplo: `https://gpmedical-api-xxxxx-uc.a.run.app`

---

## 🎨 Paso 4: Desplegar Frontend

### Opción A: Firebase Hosting (Recomendado)

#### 4.1 Instalar Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

#### 4.2 Inicializar Firebase

```bash
cd frontend

firebase init hosting

# Responder:
# - Use existing project o create new
# - Public directory: out
# - Configure as single-page app: Yes
# - Set up automatic builds: No
```

#### 4.3 Configurar next.config.js para export

Editar `frontend/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
```

#### 4.4 Configurar variables de entorno

Editar `frontend/.env.production`:

```env
NEXT_PUBLIC_API_URL=https://gpmedical-api-xxxxx-uc.a.run.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_tu-stripe-key
```

#### 4.5 Build y Deploy

```bash
cd frontend

# Build
npm run build

# Deploy
firebase deploy --only hosting
```

URL: `https://tu-proyecto.web.app`

### Opción B: Cloud Storage + Load Balancer

```bash
# Crear bucket
gsutil mb gs://gpmedical-frontend

# Configurar como sitio web
gsutil web set -m index.html -e index.html gs://gpmedical-frontend

# Subir archivos
cd frontend/out
gsutil -m cp -r * gs://gpmedical-frontend/

# Hacer público
gsutil iam ch allUsers:objectViewer gs://gpmedical-frontend
```

---

## 🔧 Paso 5: Configuración Post-Despliegue

### 5.1 Actualizar CORS en backend

Agregar URL del frontend a CORS_ORIGINS:

```bash
gcloud run services update gpmedical-api \
    --update-env-vars "CORS_ORIGINS=https://tu-proyecto.web.app,https://tu-dominio.com"
```

### 5.2 Crear tablas en Cloud SQL

```bash
# Conectar a Cloud SQL
gcloud sql connect gpmedical-db --user=gpmedical

# O usar Cloud SQL Proxy
cloud_sql_proxy -instances=PROJECT_ID:REGION:gpmedical-db=tcp:5432
```

Luego ejecutar localmente:

```bash
cd backend
source venv/bin/activate

# Configurar DATABASE_URL local para apuntar a Cloud SQL
export DATABASE_URL="postgresql+asyncpg://gpmedical:PASSWORD@localhost:5432/gpmedical"

# Crear tablas
python -c "
from app.core.database import engine, Base
from app.models import *
import asyncio
async def create():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
asyncio.run(create())
"

# Crear usuario admin
python scripts/create_admin.py
```

### 5.3 Configurar dominio personalizado (Opcional)

```bash
# Para Cloud Run
gcloud run domain-mappings create \
    --service gpmedical-api \
    --domain api.tu-dominio.com

# Para Firebase Hosting
firebase hosting:channel:deploy production \
    --site tu-proyecto
```

---

## 📊 Paso 6: Monitoreo y Logs

### Cloud Logging

```bash
# Ver logs de Cloud Run
gcloud run logs read gpmedical-api \
    --region us-central1 \
    --limit 100

# Seguir logs en tiempo real
gcloud run logs tail gpmedical-api \
    --region us-central1
```

### Cloud Monitoring

1. Ir a https://console.cloud.google.com/monitoring
2. Crear dashboard personalizado
3. Agregar métricas:
   - Cloud Run: Requests, Latency, Errors
   - Cloud SQL: Connections, CPU, Memory

---

## 🔄 CI/CD con Cloud Build

### Crear cloudbuild.yaml

Crear `backend/cloudbuild.yaml`:

```yaml
steps:
  # Build Docker image
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'build'
      - '-f'
      - 'Dockerfile.cloudrun'
      - '-t'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/gpmedical-repo/backend:$COMMIT_SHA'
      - '-t'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/gpmedical-repo/backend:latest'
      - '.'

  # Push to Artifact Registry
  - name: 'gcr.io/cloud-builders/docker'
    args:
      - 'push'
      - 'us-central1-docker.pkg.dev/$PROJECT_ID/gpmedical-repo/backend:$COMMIT_SHA'

  # Deploy to Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - 'run'
      - 'deploy'
      - 'gpmedical-api'
      - '--image=us-central1-docker.pkg.dev/$PROJECT_ID/gpmedical-repo/backend:$COMMIT_SHA'
      - '--region=us-central1'
      - '--platform=managed'

timeout: 1200s
```

### Configurar trigger

```bash
gcloud builds triggers create github \
    --repo-name=GP-Medical \
    --repo-owner=SamFragaProject \
    --branch-pattern="^main$" \
    --build-config=backend/cloudbuild.yaml
```

---

## 💰 Optimización de Costos

### Cloud SQL
```bash
# Escalar down para desarrollo
gcloud sql instances patch gpmedical-db \
    --tier=db-f1-micro

# Configurar backups automáticos
gcloud sql instances patch gpmedical-db \
    --backup-start-time=03:00

# Habilitar auto-scaling de disco
gcloud sql instances patch gpmedical-db \
    --no-storage-auto-increase
```

### Cloud Run
```bash
# Ajustar instancias
gcloud run services update gpmedical-api \
    --min-instances=0 \
    --max-instances=5 \
    --cpu=1 \
    --memory=256Mi
```

---

## 🔐 Seguridad

### 1. VPC Connector (Recomendado)

```bash
# Crear VPC Connector
gcloud compute networks vpc-access connectors create gpmedical-connector \
    --network=default \
    --region=us-central1 \
    --range=10.8.0.0/28

# Conectar Cloud Run a VPC
gcloud run services update gpmedical-api \
    --vpc-connector=gpmedical-connector \
    --vpc-egress=private-ranges-only
```

### 2. Identity-Aware Proxy (IAP)

```bash
# Requerir autenticación para acceder
gcloud run services update gpmedical-api \
    --no-allow-unauthenticated
```

---

## ❓ Troubleshooting

### Error: Cloud SQL connection failed

```bash
# Verificar Cloud SQL Proxy
cloud_sql_proxy -instances=PROJECT_ID:REGION:INSTANCE=tcp:5432

# Verificar que Cloud Run tiene acceso
gcloud run services describe gpmedical-api --format="value(spec.template.spec.containers[0].env)"
```

### Error: Memory limit exceeded

```bash
# Aumentar memoria
gcloud run services update gpmedical-api --memory=1Gi
```

### Error: Cold start lento

```bash
# Mantener al menos 1 instancia activa
gcloud run services update gpmedical-api --min-instances=1
```

---

## 📚 Recursos

- [Cloud Run Docs](https://cloud.google.com/run/docs)
- [Cloud SQL Docs](https://cloud.google.com/sql/docs)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Cloud Build Docs](https://cloud.google.com/build/docs)

---

## 🆚 Comparación: GCP vs Railway

| Característica | GCP | Railway |
|---------------|-----|---------|
| **Precio inicial** | ~$12-18/mes | ~$15-30/mes |
| **Setup** | Complejo (CLI) | Simple (UI) |
| **Escalabilidad** | Excelente | Buena |
| **Soporte SQL** | ✅ Cloud SQL | ✅ PostgreSQL |
| **Auto-scaling** | ✅ Nativo | ⚠️ Manual |
| **Free tier** | ✅ $300 crédito | ❌ No |
| **Documentación** | Extensa | Buena |

**Recomendación:**
- **Railway**: Si quieres algo simple y rápido
- **GCP**: Si necesitas escalar mucho o ya usas servicios de Google

---

**¿Dudas?** Revisa la sección de Troubleshooting o consulta los recursos oficiales.
