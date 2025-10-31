# 📺 TUTORIAL PASO A PASO CON IMÁGENES (Texto)

Te voy a mostrar **exactamente** qué verás en cada paso.

---

## 🎬 ESCENA 1: ABRIR EL PROYECTO

### TU PANTALLA SE VERÁ ASÍ:

```
┌─────────────────────────────────────┐
│  📁 Explorador de Archivos          │
├─────────────────────────────────────┤
│  📂 Documentos                      │
│    📂 Proyectos                     │
│      📂 GP-Medical  ← ESTA CARPETA │
│        📄 README.md                 │
│        📂 frontend                  │
│        📂 backend                   │
└─────────────────────────────────────┘
```

### QUÉ HACER:

1. **Click DERECHO** en la carpeta "GP-Medical"
2. Buscar opción que diga: **"Abrir con Code"** o **"Open with VSCode"**
3. Click en esa opción

### SI NO VES ESA OPCIÓN:

1. Abrir VSCode (ícono azul)
2. Ir a menú: **File > Open Folder**
3. Buscar carpeta GP-Medical
4. Click en **"Seleccionar carpeta"**

---

## 🎬 ESCENA 2: DENTRO DE VSCODE

### TU PANTALLA SE VERÁ ASÍ:

```
┌─────────────────────────────────────────────────────────┐
│ VSCode - GP-Medical                                     │
├──────────────┬──────────────────────────────────────────┤
│ EXPLORADOR   │                                          │
│              │                                          │
│ ▼ GP-Medical │         (área de edición)               │
│   📄 README  │                                          │
│   📂 frontend│                                          │
│   📂 backend │                                          │
│   📂 docs    │                                          │
│              │                                          │
│              │                                          │
└──────────────┴──────────────────────────────────────────┘
```

### QUÉ HACER:

**Abrir la Terminal:**

Ir al menú superior: **Terminal > New Terminal**

O presionar: **Ctrl + Ñ** (la tecla de la eñe)

---

## 🎬 ESCENA 3: TERMINAL ABIERTA

### TU PANTALLA SE VERÁ ASÍ:

```
┌─────────────────────────────────────────────────────────┐
│ VSCode - GP-Medical                                     │
├──────────────┬──────────────────────────────────────────┤
│ EXPLORADOR   │                                          │
│              │                                          │
│ ▼ GP-Medical │         (área de edición)               │
│   📄 README  │                                          │
│   📂 frontend│                                          │
├──────────────┴──────────────────────────────────────────┤
│ TERMINAL                                                │
│                                                         │
│ PS C:\Users\TuNombre\GP-Medical>  █                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

El cursor █ está parpadeando, esperando que escribas.

### QUÉ HACER:

**Escribir (o copiar y pegar):**
```
cd frontend
```

**Presionar:** Enter

---

## 🎬 ESCENA 4: DENTRO DE FRONTEND

### TU TERMINAL SE VERÁ ASÍ:

```
┌─────────────────────────────────────────────────────────┐
│ TERMINAL                                                │
│                                                         │
│ PS C:\Users\TuNombre\GP-Medical> cd frontend           │
│ PS C:\Users\TuNombre\GP-Medical\frontend>  █           │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

¿Ves que ahora dice `\frontend>` al final? ✅ Perfecto.

### QUÉ HACER (SOLO PRIMERA VEZ):

**Escribir:**
```
npm install
```

**Presionar:** Enter

---

## 🎬 ESCENA 5: INSTALANDO DEPENDENCIAS

### TU TERMINAL SE VERÁ ASÍ:

```
┌─────────────────────────────────────────────────────────┐
│ TERMINAL                                                │
│                                                         │
│ PS C:\...\GP-Medical\frontend> npm install             │
│                                                         │
│ added 324 packages in 2m                               │
│                                                         │
│ 45 packages are looking for funding                    │
│   run `npm fund` for details                           │
│                                                         │
│ PS C:\...\GP-Medical\frontend>  █                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

Verás MUCHAS líneas de texto pasando rápido.

**Esperar 2-3 minutos** hasta que vuelva a aparecer el cursor █

✅ Cuando veas el cursor de nuevo, continúa.

**IMPORTANTE:** Solo necesitas hacer `npm install` **UNA VEZ** (la primera vez)

---

## 🎬 ESCENA 6: INICIAR EL PROYECTO

### QUÉ HACER:

**Escribir:**
```
npm run dev
```

**Presionar:** Enter

### TU TERMINAL SE VERÁ ASÍ:

```
┌─────────────────────────────────────────────────────────┐
│ TERMINAL                                                │
│                                                         │
│ PS C:\...\GP-Medical\frontend> npm run dev             │
│                                                         │
│   ▲ Next.js 14.1.0                                     │
│   - Local:    http://localhost:3000                    │
│                                                         │
│  ✓ Ready in 3.2s                                       │
│                                                         │
│  ○ Compiling / ...                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

¿Ves esto?: `http://localhost:3000` ✅ **¡PERFECTO!**

**NO CIERRES LA TERMINAL** - debe quedarse así.

---

## 🎬 ESCENA 7: ABRIR EN NAVEGADOR

### QUÉ HACER:

1. Abrir tu navegador (Chrome, Edge, Firefox)
2. En la barra de direcciones (arriba), escribir:
   ```
   http://localhost:3000
   ```
3. Presionar Enter

### TU NAVEGADOR SE VERÁ ASÍ:

```
┌─────────────────────────────────────────────────────────┐
│  ← → ⟳  http://localhost:3000                 🔍 👤 ⚙  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│              GP-Medical                                 │
│         Sistema de Gestión Clínica                      │
│                                                         │
│              [  Login  ]                                │
│                                                         │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

✅ **¡LISTO!** Ya está funcionando tu proyecto.

---

## 🎬 ESCENA 8: EDITAR UN ARCHIVO

### QUÉ HACER:

Volver a VSCode

### EN EL EXPLORADOR (LADO IZQUIERDO):

```
┌──────────────┐
│ EXPLORADOR   │
│              │
│ ▼ GP-Medical │
│   ▼ frontend │
│     ▼ src    │
│       ▼ app  │
│         📄 page.tsx  ← CLICK AQUÍ
│         📄 globals.css
│         📂 auth
│         📂 dashboard
└──────────────┘
```

### HACER CLICK EN: page.tsx

### TU PANTALLA SE VERÁ ASÍ:

```
┌─────────────────────────────────────────────────────────┐
│ page.tsx                                                │
├─────────────────────────────────────────────────────────┤
│ 1  export default function Home() {                     │
│ 2    return (                                           │
│ 3      <div>                                            │
│ 4        <h1>Bienvenido a GP-Medical</h1>               │
│ 5        <p>Sistema de gestión clínica</p>              │
│ 6      </div>                                           │
│ 7    )                                                  │
│ 8  }                                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### QUÉ HACER:

1. Click en la línea 4 donde dice "Bienvenido a GP-Medical"
2. Cambiar el texto por lo que quieras
3. Presionar: **Ctrl + S** (para guardar)

### TU PANTALLA SE VERÁ ASÍ:

```
┌─────────────────────────────────────────────────────────┐
│ page.tsx                                                │
├─────────────────────────────────────────────────────────┤
│ 1  export default function Home() {                     │
│ 2    return (                                           │
│ 3      <div>                                            │
│ 4        <h1>Hola Mundo</h1>  ← CAMBIADO              │
│ 5        <p>Sistema de gestión clínica</p>              │
│ 6      </div>                                           │
│ 7    )                                                  │
│ 8  }                                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🎬 ESCENA 9: VER EL CAMBIO

### QUÉ HACER:

1. Volver al navegador
2. Presionar **F5** (refrescar)

### TU NAVEGADOR SE VERÁ ASÍ:

```
┌─────────────────────────────────────────────────────────┐
│  ← → ⟳  http://localhost:3000                 🔍 👤 ⚙  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                                         │
│              Hola Mundo  ← ¡CAMBIÓ!                    │
│         Sistema de Gestión Clínica                      │
│                                                         │
│                                                         │
│                                                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

✅ **¡FUNCIONÓ!** Tu cambio se ve reflejado.

---

## 🎬 ESCENA 10: CUANDO TERMINES

### QUÉ HACER:

En VSCode, ir a la terminal y presionar: **Ctrl + C**

### TU TERMINAL SE VERÁ ASÍ:

```
┌─────────────────────────────────────────────────────────┐
│ TERMINAL                                                │
│                                                         │
│  ○ Compiling / ...                                     │
│  ^C                                                    │
│  Terminate batch job (Y/N)?  █                         │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Escribir:** Y

**Presionar:** Enter

✅ El servidor se detuvo.

---

## 🔄 MAÑANA, PARA VOLVER A TRABAJAR

### COMANDOS RÁPIDOS:

```bash
cd frontend
npm run dev
```

Abrir navegador: **http://localhost:3000**

✅ **¡Listo para trabajar de nuevo!**

---

## 📊 RESUMEN VISUAL

```
    ABRIR VSCODE
         ↓
    ABRIR TERMINAL (Ctrl+Ñ)
         ↓
    cd frontend
         ↓
    npm install (solo 1ra vez)
         ↓
    npm run dev
         ↓
    ABRIR NAVEGADOR
    localhost:3000
         ↓
    ✅ ¡FUNCIONA!
         ↓
    EDITAR en VSCode
         ↓
    GUARDAR (Ctrl+S)
         ↓
    REFRESCAR navegador (F5)
         ↓
    ✅ ¡VER CAMBIOS!
```

---

**¿En qué escena estás atorado?** Dime el número y te ayudo. 🙂
