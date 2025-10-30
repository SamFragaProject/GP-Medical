# 🚀 GP-Medical - Ejecutar en VSCode

Guía simplificada para ejecutar GP-Medical en tu computadora local.

---

## ✅ Prerrequisitos

Necesitas tener instalado:

1. **Python 3.11+** - https://www.python.org/downloads/
2. **Node.js 18+** - https://nodejs.org/
3. **Docker Desktop** - https://www.docker.com/get-started
   - (Alternativa: PostgreSQL instalado localmente)
4. **VSCode** - https://code.visualstudio.com/
5. **Git** - https://git-scm.com/

### ✨ Verificar instalaciones:

```bash
python --version    # Debe mostrar 3.11 o superior
node --version      # Debe mostrar 18 o superior
docker --version    # Debe mostrar versión instalada
```

---

## 🎯 Pasos para Ejecutar

### 1️⃣ Abrir Proyecto en VSCode

```bash
# Clonar el repositorio (si aún no lo tienes)
git clone https://github.com/SamFragaProject/GP-Medical.git

# Entrar a la carpeta
cd GP-Medical

# Abrir en VSCode
code .
```

### 2️⃣ Iniciar Base de Datos

**Windows:**
```bash
# Doble click en:
start-database.bat

# O desde terminal:
.\start-database.bat
```

**Mac/Linux:**
```bash
chmod +x start-database.sh
./start-database.sh
```

Esto:
- ✅ Descarga e inicia PostgreSQL en Docker
- ✅ Crea la base de datos `gpmedical`
- ✅ No necesitas configurar nada más

### 3️⃣ Setup Inicial (Solo Primera Vez)

Este paso crea las tablas y el usuario admin.

**Windows:**
```bash
# Doble click en:
setup-inicial.bat

# O desde terminal:
.\setup-inicial.bat
```

**Mac/Linux:**
```bash
chmod +x setup-inicial.sh
./setup-inicial.sh
```

Verás algo como:
```
✅ Tablas creadas exitosamente
✅ Empresa creada: Mi Clínica
✅ Rol creado: Administrador
✅ Usuario creado: admin@miclinica.com

📧 Email: admin@miclinica.com
🔑 Password: admin123
```

### 4️⃣ Iniciar Backend

**Opción A: Con Script (Recomendado)**

**Windows:**
```bash
# Doble click en:
start-backend.bat

# O desde terminal:
.\start-backend.bat
```

**Mac/Linux:**
```bash
chmod +x start-backend.sh
./start-backend.sh
```

**Opción B: Manualmente en VSCode**

1. Abrir terminal en VSCode (Ctrl+`)
2. Ir a carpeta backend:
```bash
cd backend
```

3. Crear y activar entorno virtual:

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

4. Instalar dependencias:
```bash
pip install -r requirements.txt
```

5. Iniciar servidor:
```bash
uvicorn app.main:app --reload
```

**✅ Backend corriendo en:**
- URL: http://localhost:8000
- Docs: http://localhost:8000/docs

### 5️⃣ Iniciar Frontend

**Abrir NUEVA terminal** en VSCode (Ctrl+Shift+`)

**Opción A: Con Script (Recomendado)**

**Windows:**
```bash
# Doble click en:
start-frontend.bat

# O desde terminal:
.\start-frontend.bat
```

**Mac/Linux:**
```bash
chmod +x start-frontend.sh
./start-frontend.sh
```

**Opción B: Manualmente**

1. En la nueva terminal:
```bash
cd frontend
```

2. Instalar dependencias (solo primera vez):
```bash
npm install
```

3. Iniciar servidor:
```bash
npm run dev
```

**✅ Frontend corriendo en:**
- URL: http://localhost:3000

---

## 🎉 ¡Listo! Acceder al Sistema

1. Abrir navegador en: **http://localhost:3000**

2. Hacer login con:
   - **Email:** admin@miclinica.com
   - **Password:** admin123

3. ¡Explorar todos los módulos!

---

## 🗂️ Estructura de Terminales en VSCode

Deberías tener **2 terminales abiertas**:

```
Terminal 1: Backend
📁 GP-Medical/backend
$ uvicorn app.main:app --reload
✅ Running on http://localhost:8000

Terminal 2: Frontend
📁 GP-Medical/frontend
$ npm run dev
✅ Running on http://localhost:3000
```

---

## 📚 Módulos Disponibles

Una vez dentro, puedes explorar:

- ✅ **Dashboard** - Vista general y métricas
- ✅ **Pacientes** - Gestión de pacientes
- ✅ **Agenda** - Citas médicas
- ✅ **Expediente Clínico** - Notas médicas, diagnósticos
- ✅ **Recetas** - Prescripciones médicas
- ✅ **Laboratorio** - Resultados de estudios
- ✅ **Inventario** - Productos y farmacia
- ✅ **Facturación** - Cobros y CFDI 4.0
- ✅ **CRM** - Campañas y seguimiento
- ✅ **Reportes** - Análisis y estadísticas
- ✅ **Configuración** - Empresa y usuarios

---

## 🔧 Debug en VSCode

### Debug Backend (Python)

1. Ir a pestaña "Run and Debug" (Ctrl+Shift+D)
2. Seleccionar "Python: FastAPI Backend"
3. Presionar F5
4. Poner breakpoints donde quieras

### Debug Frontend (Next.js)

1. Iniciar frontend con `npm run dev`
2. En VSCode: Run and Debug > "Next.js: debug client-side"
3. Presionar F5
4. Se abrirá Chrome con debugging activado

---

## 🛑 Detener Todo

### Detener Backend
- Presionar `Ctrl+C` en la terminal del backend

### Detener Frontend
- Presionar `Ctrl+C` en la terminal del frontend

### Detener Base de Datos
```bash
docker stop gpmedical-db
```

### Reiniciar Base de Datos
```bash
docker start gpmedical-db
```

---

## ❓ Problemas Comunes

### ❌ "Puerto 8000 ya está en uso"

```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

### ❌ "Puerto 3000 ya está en uso"

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### ❌ "No se puede conectar a la base de datos"

1. Verificar que Docker Desktop está corriendo
2. Verificar que el contenedor está activo:
```bash
docker ps
```
3. Si no aparece, iniciarlo:
```bash
docker start gpmedical-db
```
4. Ver logs:
```bash
docker logs gpmedical-db
```

### ❌ "ModuleNotFoundError" en Python

```bash
cd backend
source venv/bin/activate  # Mac/Linux
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### ❌ Error al instalar dependencias de Node

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

---

## 📝 Archivos de Configuración

Los archivos de configuración ya están creados:

- ✅ `backend/.env` - Configuración del backend
- ✅ `frontend/.env.local` - Configuración del frontend

**NO necesitas cambiar nada** para desarrollo local.

---

## 🔄 Workflow Diario

### Primera vez:
```bash
1. ./start-database.sh (o .bat)
2. ./setup-inicial.sh (o .bat)
3. ./start-backend.sh (o .bat)
4. ./start-frontend.sh (o .bat)
```

### Días siguientes:
```bash
1. ./start-database.sh (o .bat)    # Solo si está detenido
2. ./start-backend.sh (o .bat)
3. ./start-frontend.sh (o .bat)
```

---

## 🚀 Siguiente Paso: Producción

Una vez que pruebes todo localmente y funcione bien, puedes elegir dónde desplegarlo:

### Opciones disponibles:

1. **Railway + Vercel** ($15-30/mes)
   - Más fácil de configurar
   - Ver: `DEPLOYMENT.md`

2. **Firebase Data Connect** ($15-35/mes)
   - CDN global gratis
   - PostgreSQL integrado
   - Ver: `DEPLOYMENT-FIREBASE.md`

3. **Google Cloud Platform** ($25-40/mes)
   - Más escalable
   - Ver: `DEPLOYMENT-GCP.md`

4. **Render + Vercel** ($0-7/mes)
   - Más económico (tiene tier gratuito)
   - Ver: `DEPLOYMENT.md`

Cuando estés listo para desplegar, avísame y te ayudo con la opción que elijas.

---

## 📞 ¿Necesitas Ayuda?

Si algo no funciona:

1. Verifica que todos los prerrequisitos están instalados
2. Revisa la sección "Problemas Comunes" arriba
3. Verifica que Docker Desktop está corriendo
4. Verifica que tienes ambas terminales abiertas (backend y frontend)

---

**¡Disfruta explorando GP-Medical! 🎉**
