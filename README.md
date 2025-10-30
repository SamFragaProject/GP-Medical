# GP-Medical - Sistema SaaS de Gestión Clínica

Sistema integral de gestión clínica multi-empresa con capacidades avanzadas de IA para procesamiento de documentos médicos.

## 🏥 Características Principales

### Núcleo SaaS Multi-Tenant
- Multi-empresa / Multi-sede / Multi-rol
- RBAC dinámico y configurable
- Branding personalizado por empresa

### Módulos Principales
1. **Gestión de Pacientes** - Expediente clínico electrónico completo
2. **Agenda Inteligente** - Citas con recordatorios automáticos
3. **Recepción y Admisión** - Pre-admisión y triage
4. **ECE (Expediente Clínico)** - Notas SOAP, diagnósticos CIE-10
5. **Recetas y Órdenes** - Generación automática con QR
6. **Laboratorio/Imagen** - Gestión de resultados
7. **Inventario/Farmacia** - Control de lotes y caducidades
8. **Caja y Facturación** - CFDI 4.0 (México)
9. **CRM Clínico** - Campañas y seguimiento
10. **Portal del Paciente** - Acceso seguro a información
11. **BI y Reportes** - KPIs y análisis
12. **Procesamiento IA** - Análisis de documentos médicos

## 🚀 Stack Tecnológico

### Backend
- **FastAPI** - Framework web moderno y rápido
- **PostgreSQL** - Base de datos relacional robusta
- **SQLAlchemy** - ORM con soporte async
- **Alembic** - Migraciones de BD
- **Redis** - Caché y sesiones
- **Celery** - Tareas asíncronas
- **LangChain + OpenAI/Claude** - Procesamiento IA

### Frontend
- **Next.js 14** - React framework con SSR
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos utility-first
- **shadcn/ui** - Componentes UI hermosos
- **React Query** - Manejo de estado del servidor
- **Zustand** - Estado global
- **React Hook Form + Zod** - Validación de formularios

### DevOps
- **Docker & Docker Compose** - Containerización
- **GitHub Actions** - CI/CD
- **Nginx** - Reverse proxy
- **Let's Encrypt** - Certificados SSL

## 📁 Estructura del Proyecto

```
GP-Medical/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── api/            # Endpoints
│   │   ├── core/           # Config, seguridad
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Lógica de negocio
│   │   ├── repositories/   # Acceso a datos
│   │   ├── middleware/     # Middleware custom
│   │   └── utils/          # Utilidades
│   ├── alembic/            # Migraciones
│   ├── tests/              # Tests
│   └── requirements.txt
│
├── frontend/               # App Next.js
│   ├── src/
│   │   ├── app/           # App Router (Next.js 14)
│   │   ├── components/    # Componentes React
│   │   ├── lib/           # Utilidades y configs
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # API clients
│   │   ├── stores/        # Estado global
│   │   └── types/         # TypeScript types
│   ├── public/            # Assets estáticos
│   └── package.json
│
├── docs/                   # Documentación
├── docker/                 # Dockerfiles
├── scripts/                # Scripts útiles
└── docker-compose.yml      # Orquestación
```

## 🛠️ Instalación y Desarrollo

### Prerrequisitos
- Docker y Docker Compose
- Node.js 18+ (para desarrollo local)
- Python 3.11+ (para desarrollo local)

### Inicio Rápido

```bash
# Clonar el repositorio
git clone https://github.com/SamFragaProject/GP-Medical.git
cd GP-Medical

# Levantar servicios con Docker
docker-compose up -d

# El backend estará en: http://localhost:8000
# El frontend estará en: http://localhost:3000
# Documentación API: http://localhost:8000/docs
```

### Desarrollo Local

#### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🔐 Seguridad y Cumplimiento

- Cifrado en tránsito (TLS) y reposo
- Control de acceso granular (RBAC)
- 2FA disponible
- Auditoría completa de accesos
- Cumplimiento NOM-024-SSA3-2012 (México)
- GDPR ready
- Respaldos automáticos

## 🤖 Sistema de IA

El sistema incluye capacidades de procesamiento de documentos con IA:

- **Extracción de datos** de documentos médicos escaneados
- **Análisis de laboratorios** y resultados
- **Sugerencias de diagnóstico** basadas en síntomas
- **Generación de resúmenes** de historiales clínicos
- **Normalización de datos** de importaciones

### Configuración de IA
```env
OPENAI_API_KEY=tu_api_key
# o
ANTHROPIC_API_KEY=tu_api_key
```

## 📊 Roles de Usuario

1. **Super Admin** - Gestión de plataforma
2. **Admin Clínico** - Gestión de empresa/sede
3. **Médico** - Atención y ECE
4. **Recepción** - Agenda y admisión
5. **Enfermería** - Signos vitales y apoyo
6. **Caja/Facturación** - Cobros y CFDI
7. **Inventario** - Gestión de productos
8. **Dirección** - Reportes y BI

Los roles son **configurables** y se pueden crear nuevos con permisos personalizados.

## 📈 Despliegue

### 🖥️ Desarrollo Local
Ver [LOCAL-SETUP.md](./LOCAL-SETUP.md) para configurar el sistema en tu computadora con VSCode.

### ☁️ Producción

**Opciones Recomendadas por Presupuesto:**

#### Opción 1: Railway + Vercel + Supabase ($15-30/mes)
- ✅ **Más fácil** - Setup en 30 minutos
- ✅ **Económico** - Ideal para empezar
- ✅ **PostgreSQL incluido** - Base de datos SQL
- Ver [DEPLOYMENT.md](./DEPLOYMENT.md)

#### Opción 2: Google Cloud Platform ($25-40/mes)
- ✅ **Escalable** - Para crecimiento
- ✅ **Cloud SQL** - PostgreSQL managed
- ✅ **Cloud Run** - Auto-scaling
- Ver [DEPLOYMENT-GCP.md](./DEPLOYMENT-GCP.md)

#### Opción 3: Render + Vercel + Supabase ($0-7/mes)
- ✅ **Más económico** - Free tier disponible
- ⚠️ **Limitaciones** - Cold starts lentos
- Ver [DEPLOYMENT.md](./DEPLOYMENT.md)

#### ⭐ Opción 4: Firebase Data Connect (NUEVO - $15-35/mes)
- ✅ **PostgreSQL integrado** - Firebase ahora soporta SQL
- ✅ **CDN Global gratis** - Firebase Hosting
- ✅ **Consola unificada** - Todo desde Firebase Console
- ✅ **Firebase Auth** - Autenticación opcional integrada
- Ver [DEPLOYMENT-FIREBASE.md](./DEPLOYMENT-FIREBASE.md)

### 💡 Nota sobre Firebase
**¡NUEVO!** Firebase Data Connect permite usar PostgreSQL con Firebase.
- Antes: Solo Firestore (NoSQL) y Realtime Database (NoSQL)
- Ahora: PostgreSQL a través de Firebase Data Connect
- Ventaja: CDN global + PostgreSQL + consola unificada

## 📝 Licencia

Propietary - SamFragaProject

## 🤝 Soporte

Para soporte técnico, contactar a [correo@soporte.com]

---

**Versión**: 1.0.0
**Última actualización**: Octubre 2025
