# ⚡ COMANDOS EXACTOS - COPIA Y PEGA

Sigue esto al pie de la letra.

---

## 🎯 PRIMERA VEZ (Configuración Inicial)

### 1. Abrir VSCode en la carpeta del proyecto

**Opción A:** Click derecho en carpeta GP-Medical > "Abrir con Code"

**Opción B:**
- Abrir VSCode
- File > Open Folder
- Seleccionar GP-Medical

### 2. Abrir Terminal en VSCode

Menú: **Terminal > New Terminal**

O presionar: **Ctrl + Ñ**

### 3. Copiar y pegar estos comandos UNO POR UNO

**Comando 1:**
```bash
cd frontend
```
Presionar **Enter**

**Comando 2:** (Solo la primera vez)
```bash
npm install
```
Presionar **Enter** y esperar 2-3 minutos

**Comando 3:**
```bash
npm run dev
```
Presionar **Enter**

### 4. Abrir navegador

Ir a: **http://localhost:3000**

✅ **¡Listo! Ya está funcionando.**

---

## 🔄 DÍAS SIGUIENTES (Inicio Rápido)

### 1. Abrir VSCode en carpeta GP-Medical

### 2. Abrir Terminal (Ctrl + Ñ)

### 3. Copiar y pegar:

```bash
cd frontend
npm run dev
```

### 4. Abrir navegador

**http://localhost:3000**

✅ **¡Listo!**

---

## 🛑 DETENER EL PROYECTO

En la terminal: **Ctrl + C**

---

## 🎨 EDITAR Y VER CAMBIOS

### 1. Buscar archivo en VSCode

Lado izquierdo:
```
frontend > src > app > page.tsx
```

### 2. Editar algo

### 3. Guardar: **Ctrl + S**

### 4. Refrescar navegador: **F5**

✅ **¡Verás el cambio!**

---

## ❌ SI HAY ERROR

### Error: "node no se reconoce"

**Solución:**
1. Ir a https://nodejs.org
2. Descargar versión LTS
3. Instalar
4. Reiniciar computadora
5. Intentar de nuevo

### Error: "Cannot find module"

**Solución:**
```bash
cd frontend
rm -rf node_modules
npm install
```

### Error: "Port 3000 is already in use"

**Solución:** Ya está corriendo, solo ve a http://localhost:3000

O si quieres detenerlo:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [número que aparece] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

---

## 📞 NECESITAS MÁS AYUDA?

Dime **exactamente** qué error te sale y te ayudo.
