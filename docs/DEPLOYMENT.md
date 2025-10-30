# Guía de Despliegue - GP-Medical

Esta guía te ayudará a desplegar GP-Medical en producción usando diferentes plataformas.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Opción 1: Railway (Recomendado - Más Fácil)](#opción-1-railway-recomendado)
3. [Opción 2: Vercel + Render](#opción-2-vercel--render)
4. [Opción 3: DigitalOcean App Platform](#opción-3-digitalocean-app-platform)
5. [Opción 4: AWS (Avanzado)](#opción-4-aws-avanzado)
6. [Opción 5: Google Cloud Run](#opción-5-google-cloud-run)
7. [Opción 6: VPS Tradicional (DigitalOcean Droplet)](#opción-6-vps-tradicional)
8. [Variables de Entorno](#variables-de-entorno)
9. [Base de Datos](#base-de-datos)
10. [Monitoreo y Mantenimiento](#monitoreo-y-mantenimiento)

---

## Requisitos Previos

Antes de desplegar, asegúrate de tener:

- ✅ Cuenta en GitHub (código subido)
- ✅ Dominio propio (opcional pero recomendado)
- ✅ Cuenta en la plataforma de despliegue elegida
- ✅ API keys necesarias (OpenAI/Anthropic, SMTP, etc.)

---

## Opción 1: Railway (Recomendado - Más Fácil)

**🎯 Mejor para:** Startups, desarrollo rápido, facilidad de uso
**💰 Costo:** ~$20-50/mes (incluye BD y backend)
**⏱️ Tiempo de setup:** 15 minutos

### Pasos:

1. **Crea cuenta en [Railway.app](https://railway.app)**

2. **Despliega desde GitHub:**
   - Click en "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Conecta tu repositorio GP-Medical
   - Railway detectará automáticamente Docker

3. **Agrega PostgreSQL:**
   - En tu proyecto, click en "+ New"
   - Selecciona "Database" → "PostgreSQL"
   - Railway creará automáticamente la base de datos

4. **Agrega Redis:**
   - Click en "+ New" → "Database" → "Redis"

5. **Configura Variables de Entorno:**
   - Ve a tu servicio backend
   - Tab "Variables"
   - Agrega todas las variables del archivo `.env.example`
   - Railway auto-completa `DATABASE_URL` y `REDIS_URL`

6. **Configura el Frontend:**
   - Agrega otro servicio desde el mismo repo
   - Root Directory: `/frontend`
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Variables: `NEXT_PUBLIC_API_URL` (URL del backend)

7. **Dominio Personalizado:**
   - Settings → Networking → Custom Domain
   - Agrega tu dominio y configura DNS

### Costos Estimados Railway:
- Hobby Plan: $5/mes (para desarrollo)
- Pro Plan: $20/mes + uso
- Base de datos PostgreSQL: ~$5-10/mes
- **Total estimado:** $20-50/mes

---

## Opción 2: Vercel + Render

**🎯 Mejor para:** Máximo rendimiento frontend, presupuesto bajo
**💰 Costo:** ~$7-25/mes
**⏱️ Tiempo de setup:** 20 minutos

### Frontend en Vercel:

1. **Crea cuenta en [Vercel.com](https://vercel.com)**

2. **Importa proyecto:**
   - "Add New Project"
   - Importa desde GitHub
   - Root Directory: `/frontend`
   - Framework: Next.js (auto-detectado)

3. **Variables de entorno:**
   ```
   NEXT_PUBLIC_API_URL=https://tu-backend.onrender.com/api/v1
   ```

4. **Deploy:** Vercel desplegará automáticamente

### Backend en Render:

1. **Crea cuenta en [Render.com](https://render.com)**

2. **Crea Web Service:**
   - "New" → "Web Service"
   - Conecta GitHub repo
   - Root Directory: `/backend`
   - Runtime: Python
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

3. **Agrega PostgreSQL:**
   - "New" → "PostgreSQL"
   - Plan: Starter ($7/mes)
   - Copia la URL interna

4. **Agrega Redis:**
   - "New" → "Redis"
   - Plan: Starter (gratuito)

5. **Configura variables en el Web Service**

### Costos Estimados Vercel + Render:
- Vercel Free (hasta 100GB bandwidth)
- Render Web Service: $7/mes
- PostgreSQL: $7/mes
- Redis: Gratis
- **Total:** $7-14/mes

---

## Opción 3: DigitalOcean App Platform

**🎯 Mejor para:** Balance precio/rendimiento
**💰 Costo:** ~$17-30/mes
**⏱️ Tiempo de setup:** 25 minutos

### Pasos:

1. **Crea cuenta en [DigitalOcean](https://digitalocean.com)**

2. **Crea App:**
   - Apps → Create App
   - Conecta GitHub repo
   - Detectará componentes automáticamente

3. **Configura Backend:**
   - Type: Web Service
   - Dockerfile path: `/backend/Dockerfile`
   - HTTP Port: 8000
   - Instance Size: Basic ($5/mes)

4. **Configura Frontend:**
   - Type: Static Site
   - Build Command: `cd frontend && npm install && npm run build`
   - Output Directory: `frontend/.next`

5. **Agrega Base de Datos:**
   - Add Resource → Database
   - PostgreSQL 14
   - Basic ($15/mes)

6. **Configura Redis (opcional):**
   - Managed Redis ($15/mes) o usa Upstash (gratis)

### Costos DigitalOcean:
- Backend: $5/mes
- Frontend: $3/mes
- PostgreSQL: $15/mes
- Redis: $15/mes (o gratis con Upstash)
- **Total:** $23-38/mes

---

## Opción 4: AWS (Avanzado)

**🎯 Mejor para:** Empresas, alta escalabilidad
**💰 Costo:** ~$50-200/mes (variable)
**⏱️ Tiempo de setup:** 2-4 horas

### Arquitectura Recomendada:

```
┌─────────────────────────────────────────────┐
│  CloudFront (CDN)                          │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────▼────────┐  ┌──────▼──────────┐
│  S3 + Next.js  │  │  ALB            │
│  (Frontend)    │  │  (Load Balancer)│
└────────────────┘  └──────┬──────────┘
                           │
                    ┌──────▼──────────┐
                    │  ECS Fargate    │
                    │  (Backend API)  │
                    └──────┬──────────┘
                           │
                    ┌──────┴──────────┐
                    │                 │
            ┌───────▼────────┐ ┌─────▼──────┐
            │  RDS PostgreSQL │ │  ElastiCache│
            └────────────────┘ └────────────┘
```

### Pasos:

1. **RDS PostgreSQL:**
   - db.t3.micro ($15/mes)
   - Multi-AZ para producción

2. **ElastiCache Redis:**
   - cache.t3.micro ($13/mes)

3. **ECS Fargate (Backend):**
   - 0.25 vCPU, 0.5 GB RAM (~$12/mes)
   - Auto-scaling configurado

4. **S3 + CloudFront (Frontend):**
   - S3: ~$1/mes
   - CloudFront: ~$1-10/mes según tráfico

5. **ECR (Container Registry):**
   - $0.10/GB/mes

### Costos AWS Estimados:
- **Desarrollo:** $30-50/mes
- **Producción:** $100-300/mes

---

## Opción 5: Google Cloud Run

**🎯 Mejor para:** Serverless, pago por uso
**💰 Costo:** ~$10-40/mes
**⏱️ Tiempo de setup:** 30 minutos

### Pasos:

1. **Backend en Cloud Run:**
   ```bash
   gcloud run deploy gp-medical-backend \
     --source ./backend \
     --region us-central1 \
     --allow-unauthenticated
   ```

2. **Frontend en Cloud Run:**
   ```bash
   gcloud run deploy gp-medical-frontend \
     --source ./frontend \
     --region us-central1 \
     --allow-unauthenticated
   ```

3. **Cloud SQL (PostgreSQL):**
   - db-f1-micro: $7/mes
   - Conexión privada con Cloud Run

4. **Memorystore (Redis):**
   - M1 Basic: $44/mes
   - Alternativa: Upstash Redis (gratis)

### Costos Google Cloud:
- Cloud Run Backend: $5-15/mes
- Cloud Run Frontend: $2-5/mes
- Cloud SQL: $7/mes
- Redis: $0-44/mes
- **Total:** $14-71/mes

---

## Opción 6: VPS Tradicional (DigitalOcean Droplet)

**🎯 Mejor para:** Máximo control, presupuesto ajustado
**💰 Costo:** $12-24/mes
**⏱️ Tiempo de setup:** 1-2 horas

### Pasos:

1. **Crea Droplet:**
   - Ubuntu 22.04 LTS
   - 2GB RAM, 1 vCPU ($12/mes)
   - 4GB RAM, 2 vCPU ($24/mes) para producción

2. **Instala Docker:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   sudo apt install docker-compose
   ```

3. **Clona repositorio:**
   ```bash
   git clone https://github.com/SamFragaProject/GP-Medical.git
   cd GP-Medical
   ```

4. **Configura .env:**
   ```bash
   cp .env.example .env
   nano .env  # Edita con tus valores
   ```

5. **Inicia servicios:**
   ```bash
   docker-compose up -d
   ```

6. **Configura Nginx + SSL:**
   ```bash
   sudo apt install nginx certbot python3-certbot-nginx
   sudo certbot --nginx -d tudominio.com
   ```

7. **Configuración Nginx:**
   ```nginx
   server {
       server_name tudominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:8000;
       }

       listen 443 ssl;
       ssl_certificate /etc/letsencrypt/live/tudominio.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/tudominio.com/privkey.pem;
   }
   ```

### Costos VPS:
- Droplet 2GB: $12/mes
- Droplet 4GB: $24/mes
- Backups (+20%): $2.40-4.80/mes
- **Total:** $12-29/mes

---

## Variables de Entorno

### Backend (.env):

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/gpmedical
REDIS_URL=redis://host:6379/0

# Security
SECRET_KEY=tu-secret-key-muy-seguro-cambiar-en-produccion
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=https://tudominio.com,https://www.tudominio.com

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-app-password

# WhatsApp (Twilio)
TWILIO_ACCOUNT_SID=tu-account-sid
TWILIO_AUTH_TOKEN=tu-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# AI
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# PAC Facturación
PAC_PROVIDER=finkok
PAC_USERNAME=tu-usuario
PAC_PASSWORD=tu-password

# Payments
STRIPE_SECRET_KEY=sk_live_...
CONEKTA_API_KEY=key_...

# Monitoring
SENTRY_DSN=https://...@sentry.io/...
```

### Frontend (.env.local):

```env
NEXT_PUBLIC_API_URL=https://api.tudominio.com/api/v1
NEXT_PUBLIC_APP_NAME=GP-Medical
NEXT_PUBLIC_APP_URL=https://tudominio.com
```

---

## Base de Datos

### Migraciones con Alembic:

```bash
# Generar migración
cd backend
alembic revision --autogenerate -m "Initial tables"

# Aplicar migraciones
alembic upgrade head

# Revertir migración
alembic downgrade -1
```

### Respaldos:

```bash
# Backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Restore
psql $DATABASE_URL < backup-20240115.sql
```

### Automatizar respaldos (cron):

```bash
# Editar crontab
crontab -e

# Agregar (respaldo diario a las 2 AM)
0 2 * * * pg_dump $DATABASE_URL > /backups/db-$(date +\%Y\%m\%d).sql
```

---

## Monitoreo y Mantenimiento

### 1. **Sentry** (Errores):
```python
# Ya configurado en app/main.py
SENTRY_DSN=tu-sentry-dsn
```

### 2. **Uptime Monitoring:**
- [UptimeRobot](https://uptimerobot.com) (gratuito)
- Checa cada 5 minutos
- Alertas por email

### 3. **Logs:**
```bash
# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Railway
railway logs

# Render
Ver en dashboard
```

### 4. **Métricas:**
- CPU, RAM, Disco
- Requests/segundo
- Tiempo de respuesta
- Errores 5xx

---

## Comparación de Opciones

| Plataforma | Facilidad | Costo/mes | Escalabilidad | Recomendado para |
|------------|-----------|-----------|---------------|------------------|
| **Railway** | ⭐⭐⭐⭐⭐ | $20-50 | ⭐⭐⭐⭐ | Startups, MVPs |
| **Vercel + Render** | ⭐⭐⭐⭐ | $7-25 | ⭐⭐⭐ | Presupuesto bajo |
| **DigitalOcean** | ⭐⭐⭐⭐ | $17-30 | ⭐⭐⭐⭐ | Balance ideal |
| **AWS** | ⭐⭐ | $50-200 | ⭐⭐⭐⭐⭐ | Empresas |
| **Google Cloud** | ⭐⭐⭐ | $10-40 | ⭐⭐⭐⭐⭐ | Serverless |
| **VPS** | ⭐⭐ | $12-24 | ⭐⭐ | Control total |

---

## Recomendación Final

### Para empezar (MVP):
**Railway** - La opción más fácil, rápida y confiable.

### Para escalar (Producción):
**DigitalOcean App Platform** o **AWS** según presupuesto.

### Para máximo rendimiento:
**AWS** o **Google Cloud** con arquitectura serverless.

---

## Soporte

¿Problemas con el despliegue?

1. Revisa los logs primero
2. Verifica variables de entorno
3. Contacta soporte de la plataforma
4. Abre un issue en GitHub

---

**¡Listo para producción! 🚀**
