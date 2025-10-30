# 🖥️ Setup Local - GP-Medical

Guía para ejecutar GP-Medical localmente en tu computadora con VSCode.

## 📋 Prerrequisitos

### Software Necesario

1. **VSCode** - https://code.visualstudio.com/
2. **Python 3.11+** - https://www.python.org/downloads/
3. **Node.js 18+** - https://nodejs.org/
4. **PostgreSQL 15+** - https://www.postgresql.org/download/
   - O usar Docker: `docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=gpmedical postgres:15`
5. **Git** - https://git-scm.com/

### Verificar Instalaciones

```bash
python --version    # Debe ser 3.11+
node --version      # Debe ser 18+
npm --version       # Viene con Node.js
psql --version      # PostgreSQL
git --version
```

---

## 🚀 Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone https://github.com/SamFragaProject/GP-Medical.git
cd GP-Medical
```

### 2. Abrir en VSCode

```bash
code .
```

O desde VSCode: `File > Open Folder` > Seleccionar carpeta GP-Medical

---

## 🗄️ Configurar Base de Datos

### Opción A: PostgreSQL Local

```bash
# Crear base de datos
psql -U postgres

# En el prompt de PostgreSQL:
CREATE DATABASE gpmedical;
CREATE USER gpmedical WITH PASSWORD 'gpmedical';
GRANT ALL PRIVILEGES ON DATABASE gpmedical TO gpmedical;
\q
```

### Opción B: Docker (Más Fácil)

```bash
docker run -d \
  --name gpmedical-db \
  -p 5432:5432 \
  -e POSTGRES_DB=gpmedical \
  -e POSTGRES_USER=gpmedical \
  -e POSTGRES_PASSWORD=gpmedical \
  postgres:15

# Verificar que está corriendo
docker ps
```

### Opción C: Supabase (Cloud - Gratis)

1. Ir a https://supabase.com
2. Crear cuenta y nuevo proyecto
3. Copiar connection string de Settings > Database
4. Usar ese string en el paso siguiente

---

## 🔧 Configurar Backend

### 1. Navegar a carpeta backend

```bash
cd backend
```

### 2. Crear entorno virtual

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Mac/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

Esto instalará:
- FastAPI
- SQLAlchemy
- PostgreSQL drivers
- OpenAI/Anthropic SDKs
- Y más...

### 4. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env
```

**Editar archivo `.env`** (usa VSCode):

```env
# Mínimo para desarrollo local:
DATABASE_URL=postgresql+asyncpg://gpmedical:gpmedical@localhost:5432/gpmedical

# Si usas Docker en Mac/Linux, puede ser:
# DATABASE_URL=postgresql+asyncpg://gpmedical:gpmedical@host.docker.internal:5432/gpmedical

# Si usas Supabase:
# DATABASE_URL=postgresql+asyncpg://postgres:TU_PASSWORD@db.xxx.supabase.co:5432/postgres

# Generar SECRET_KEY (ejecutar en terminal):
# openssl rand -hex 32
SECRET_KEY=tu-secret-key-generado-aqui

# Opcional (para funciones de IA)
OPENAI_API_KEY=sk-tu-key-aqui

# Opcional (para pagos)
STRIPE_SECRET_KEY=sk_test_tu-key-aqui
```

### 5. Crear tablas en la base de datos

```bash
# Desde carpeta backend/ con venv activado
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
```

### 6. Crear usuario administrador

```bash
python scripts/create_admin.py
```

Esto creará:
- Empresa: "Mi Clínica"
- Usuario: admin@miclinica.com
- Password: admin123

### 7. Iniciar servidor backend

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**✅ Backend corriendo en:** http://localhost:8000
**📚 Documentación API:** http://localhost:8000/docs

---

## 🎨 Configurar Frontend

### 1. Abrir nueva terminal en VSCode

`Terminal > New Terminal` (o Ctrl+Shift+\`)

### 2. Navegar a carpeta frontend

```bash
cd frontend
```

### 3. Instalar dependencias

```bash
npm install
```

Esto instalará:
- Next.js 14
- React
- Tailwind CSS
- shadcn/ui
- TypeScript
- Y más...

**⏱️ Tiempo estimado: 2-5 minutos**

### 4. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local
```

**Editar archivo `.env.local`:**

```env
# Backend local
NEXT_PUBLIC_API_URL=http://localhost:8000

# Opcional (para pagos)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_tu-key-aqui
```

### 5. Iniciar servidor frontend

```bash
npm run dev
```

**✅ Frontend corriendo en:** http://localhost:3000

---

## 🎉 Acceder al Sistema

### 1. Abrir navegador

Ir a: http://localhost:3000

### 2. Hacer login

- **Email:** admin@miclinica.com
- **Password:** admin123

### 3. Explorar módulos

Todos los módulos están funcionales:
- ✅ Dashboard
- ✅ Pacientes
- ✅ Agenda
- ✅ Expediente Clínico
- ✅ Recetas
- ✅ Inventario
- ✅ Facturación
- ✅ CRM
- ✅ Reportes
- ✅ Configuración
- ✅ Y más...

---

## 🛠️ Extensiones Recomendadas para VSCode

Al abrir el proyecto, VSCode te recomendará instalar:

### Para Python (Backend):
- **Python** (Microsoft)
- **Pylance** (Microsoft)
- **Python Debugger** (Microsoft)

### Para TypeScript/React (Frontend):
- **ESLint** (Microsoft)
- **Prettier** (Prettier)
- **Tailwind CSS IntelliSense** (Tailwind Labs)
- **ES7+ React/Redux/React-Native snippets**

### General:
- **GitLens** (GitKraken)
- **Thunder Client** (para probar APIs)
- **Database Client** (para ver PostgreSQL)

---

## 🐛 Debugging

### Backend (FastAPI)

1. Crear archivo `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": [
        "app.main:app",
        "--reload",
        "--host",
        "0.0.0.0",
        "--port",
        "8000"
      ],
      "cwd": "${workspaceFolder}/backend",
      "env": {
        "PYTHONPATH": "${workspaceFolder}/backend"
      }
    }
  ]
}
```

2. Poner breakpoints en el código
3. Presionar F5 para iniciar debug

### Frontend (Next.js)

1. Agregar a `.vscode/launch.json`:

```json
{
  "name": "Next.js: debug client-side",
  "type": "chrome",
  "request": "launch",
  "url": "http://localhost:3000"
}
```

2. Iniciar con `npm run dev`
3. F5 para debug en Chrome

---

## 📂 Estructura en VSCode

```
GP-Medical/
├── backend/              👈 Abrir terminal aquí para backend
│   ├── app/
│   ├── scripts/
│   ├── requirements.txt
│   └── .env             👈 Crear este archivo
│
├── frontend/            👈 Abrir terminal aquí para frontend
│   ├── src/
│   ├── package.json
│   └── .env.local       👈 Crear este archivo
│
├── DEPLOYMENT.md
└── LOCAL-SETUP.md       👈 Este archivo
```

---

## ✅ Checklist Rápido

- [ ] Python 3.11+ instalado
- [ ] Node.js 18+ instalado
- [ ] PostgreSQL corriendo (local o Docker o Supabase)
- [ ] Base de datos `gpmedical` creada
- [ ] Backend: `backend/.env` configurado
- [ ] Backend: Tablas creadas
- [ ] Backend: Usuario admin creado
- [ ] Backend: Servidor corriendo en :8000
- [ ] Frontend: `frontend/.env.local` configurado
- [ ] Frontend: Dependencies instaladas (`npm install`)
- [ ] Frontend: Servidor corriendo en :3000
- [ ] Login exitoso en http://localhost:3000

---

## 🔥 Comandos Rápidos

### Iniciar todo (2 terminales):

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate
uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## ❓ Troubleshooting

### "No module named 'app'"

```bash
# Asegúrate de estar en la carpeta backend/
cd backend
# Y que el venv esté activado
source venv/bin/activate  # o venv\Scripts\activate en Windows
```

### "Connection refused" (Base de datos)

```bash
# Verificar que PostgreSQL está corriendo
docker ps  # Si usas Docker
# O
psql -U postgres -c "SELECT version();"  # Si es local
```

### Puerto 8000 o 3000 ya en uso

```bash
# Buscar proceso usando el puerto
# Mac/Linux:
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### Error al instalar dependencias Python

```bash
# Actualizar pip
pip install --upgrade pip setuptools wheel
# Intentar de nuevo
pip install -r requirements.txt
```

### Error al instalar dependencias Node

```bash
# Limpiar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 📊 Monitorear Logs

### Backend Logs
- Se muestran directamente en la terminal donde ejecutaste `uvicorn`
- Logs de peticiones HTTP, errores, etc.

### Frontend Logs
- Terminal: Logs de build y compilación
- Navegador: Consola (F12) para errores del cliente

---

## 🚀 Próximos Pasos

Una vez que tengas todo funcionando localmente:

1. **Explorar el sistema** - Probar todos los módulos
2. **Crear datos de prueba** - Pacientes, citas, etc.
3. **Personalizar** - Modificar según tus necesidades
4. **Decidir plataforma de despliegue**:
   - Ver `DEPLOYMENT.md` para opciones
   - Railway + Vercel (recomendado, $15-30/mes)
   - Google Cloud Run + Cloud SQL ($25-40/mes)

---

## 💡 Tips de Productividad

### Hot Reload
- **Backend:** Se recarga automáticamente al guardar archivos Python
- **Frontend:** Se recarga automáticamente al guardar archivos React/TypeScript

### Shortcuts en VSCode
- `Ctrl+P` - Buscar archivo
- `Ctrl+Shift+P` - Command Palette
- `Ctrl+` ` - Toggle terminal
- `Ctrl+Shift+F` - Buscar en todos los archivos
- `F12` - Ir a definición

### Organización
- Usa **File Explorer** (Ctrl+Shift+E) para navegar
- Usa **Split Editor** (Ctrl+\) para ver backend y frontend lado a lado

---

**¿Listo para empezar? Sigue el checklist arriba paso por paso.** 🚀

Si encuentras problemas, revisa la sección de Troubleshooting.
