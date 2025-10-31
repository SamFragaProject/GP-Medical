# 🎯 GUÍA PASO A PASO - PARA COMENZAR

Te voy a explicar TODO desde el principio, paso por paso.

---

## 📍 ¿DÓNDE ESTÁS AHORA?

Primero, necesito saber:

**¿Ya tienes el proyecto en tu computadora?**
- ✅ SÍ → Ve a la PARTE 2
- ❌ NO → Ve a la PARTE 1

---

## PARTE 1: DESCARGAR EL PROYECTO (Solo si NO lo tienes)

### Opción A: Si usas GitHub Desktop

1. Abrir GitHub Desktop
2. File > Clone Repository
3. Buscar "GP-Medical"
4. Elegir dónde guardarlo
5. Click "Clone"
6. ✅ Listo, ahora ve a PARTE 2

### Opción B: Si NO usas GitHub Desktop

1. Ir a: https://github.com/SamFragaProject/GP-Medical
2. Click en botón verde "Code"
3. Click en "Download ZIP"
4. Descargar a tu computadora
5. Descomprimir el archivo ZIP
6. ✅ Listo, ahora ve a PARTE 2

---

## PARTE 2: ABRIR EL PROYECTO

### Paso 1: ¿Dónde está tu proyecto?

Busca la carpeta que se llama **"GP-Medical"**

Ejemplo de dónde puede estar:
```
C:\Users\TuNombre\Documents\GP-Medical
```
o
```
/Users/TuNombre/Documents/GP-Medical
```

### Paso 2: Abrir esa carpeta

**Windows:**
1. Abrir el Explorador de archivos
2. Navegar hasta la carpeta GP-Medical
3. Click derecho en la carpeta
4. Buscar "Abrir con Code" o "Open with VSCode"
5. Si no aparece, continúa al Paso 3

**Paso 3: Si no funcionó el paso 2**

1. Abrir VSCode (el ícono azul)
2. En VSCode, ir a: **File > Open Folder**
3. Buscar la carpeta GP-Medical
4. Click en "Seleccionar carpeta" o "Select Folder"
5. ✅ Ahora deberías ver los archivos del proyecto en el lado izquierdo

---

## PARTE 3: VERIFICAR QUE TIENES NODE.JS

### ¿Qué es Node.js?

Es un programa que necesitas para que funcione el proyecto.

### ¿Cómo verifico si lo tengo?

1. En VSCode, abrir la **Terminal**
   - Ir al menú superior: **Terminal > New Terminal**
   - O presionar: `Ctrl + Ñ` (Windows)

2. En la terminal que se abrió (parte de abajo), escribir:
   ```
   node --version
   ```

3. Presionar **Enter**

4. **¿Qué debería pasar?**
   - ✅ **Si ves algo como:** `v18.0.0` o `v20.0.0` → ¡Perfecto! Ve a PARTE 4
   - ❌ **Si dice:** "node no se reconoce" o "command not found" → Necesitas instalar Node.js (continúa abajo)

### ¿Cómo instalo Node.js?

1. Ir a: **https://nodejs.org**
2. Descargar el botón verde que dice **"LTS"** (Recommended)
3. Ejecutar el instalador que se descargó
4. Siguiente, Siguiente, Siguiente (dejar todo por defecto)
5. Cuando termine, **CERRAR VSCode completamente**
6. Volver a abrir VSCode
7. Repetir la verificación de arriba (`node --version`)

---

## PARTE 4: INICIAR EL PROYECTO

Ahora sí, vamos a ver tu proyecto funcionando.

### Paso 1: Abrir la Terminal en VSCode

Si no está abierta:
- Menú: **Terminal > New Terminal**
- O: `Ctrl + Ñ`

Deberías ver algo así en la parte de abajo:
```
PS C:\...\GP-Medical>
```

### Paso 2: Ir a la carpeta "frontend"

En la terminal, escribir EXACTAMENTE esto:
```
cd frontend
```

Presionar **Enter**

Ahora debería decir:
```
PS C:\...\GP-Medical\frontend>
```

### Paso 3: Instalar las cosas que necesita el proyecto

**IMPORTANTE:** Esto solo se hace **UNA VEZ** (la primera vez)

En la terminal, escribir:
```
npm install
```

Presionar **Enter**

**¿Qué va a pasar?**
- Verás muchas líneas de texto pasando
- Va a tardar **2-3 minutos**
- ✅ Cuando termine, volverá a aparecer el cursor

**Si hay error:**
- Copiar el mensaje de error
- Decírmelo
- Te ayudo a solucionarlo

### Paso 4: INICIAR el proyecto

En la terminal, escribir:
```
npm run dev
```

Presionar **Enter**

**¿Qué va a pasar?**

Verás algo como esto:
```
▲ Next.js 14.1.0
- Local:    http://localhost:3000

✓ Ready in 3.2s
```

✅ **¡PERFECTO!** El proyecto está corriendo.

### Paso 5: Ver el proyecto en tu navegador

1. Abrir tu navegador (Chrome, Edge, Firefox)
2. En la barra de direcciones, escribir:
   ```
   http://localhost:3000
   ```
3. Presionar **Enter**

✅ **¡LISTO!** Deberías ver tu proyecto.

---

## PARTE 5: HACER CAMBIOS Y VERLOS

Ahora que el proyecto está corriendo, vamos a hacer un cambio.

### Ejemplo: Cambiar un texto

#### Paso 1: En VSCode, buscar un archivo

1. En el lado izquierdo de VSCode, verás una lista de carpetas
2. Click en: **frontend**
3. Click en: **src**
4. Click en: **app**
5. Click en el archivo: **page.tsx**

#### Paso 2: Editar el archivo

1. Buscar algún texto (cualquier texto que veas)
2. Cambiar ese texto por otra cosa
3. **Guardar**: Presionar `Ctrl + S`

#### Paso 3: Ver el cambio

1. Ir a tu navegador donde está **http://localhost:3000**
2. Presionar **F5** para refrescar
3. ✅ **¡Deberías ver tu cambio!**

---

## PARTE 6: CUANDO TERMINES DE TRABAJAR

### ¿Cómo detengo el proyecto?

1. Ir a la terminal en VSCode (parte de abajo)
2. Presionar: **Ctrl + C**
3. Puede que te pregunte algo, presionar: **Y** o **S**
4. ✅ El proyecto se detuvo

### ¿Cómo vuelvo a iniciarlo mañana?

1. Abrir VSCode
2. Abrir la carpeta GP-Medical
3. Abrir terminal: `Ctrl + Ñ`
4. Escribir: `cd frontend`
5. Escribir: `npm run dev`
6. Ir a: http://localhost:3000
7. ✅ Listo

---

## 📋 RESUMEN ULTRA-CORTO

Para la **PRIMERA VEZ:**
```
1. Abrir VSCode en carpeta GP-Medical
2. Terminal: cd frontend
3. Terminal: npm install  (solo primera vez)
4. Terminal: npm run dev
5. Navegar a: http://localhost:3000
```

Para **DÍAS SIGUIENTES:**
```
1. Abrir VSCode en carpeta GP-Medical
2. Terminal: cd frontend
3. Terminal: npm run dev
4. Navegar a: http://localhost:3000
```

---

## ❓ PREGUNTAS FRECUENTES

### "¿Qué es la terminal?"

Es la ventana negra (o azul) que aparece en la parte de abajo de VSCode donde escribes comandos.

### "¿Qué significa 'cd frontend'?"

Es un comando que significa "ir a la carpeta frontend".
**cd** = Change Directory (cambiar carpeta)

### "¿Qué es npm?"

Es un programa que viene con Node.js. Instala y maneja las herramientas del proyecto.

### "¿Por qué tarda tanto 'npm install'?"

Porque está descargando todas las herramientas que el proyecto necesita. Solo pasa la primera vez.

### "¿Puedo cerrar VSCode?"

Sí, pero si cierras la terminal, el proyecto se detiene. Tendrás que iniciarlo de nuevo con `npm run dev`.

### "¿Qué pasa si reinicio mi computadora?"

Nada malo. Solo tendrás que volver a ejecutar `npm run dev`.

---

## 🆘 AYUDA ESPECÍFICA

Si estás atorado en algún paso, dime:

1. **¿En qué PARTE estás?** (1, 2, 3, 4, 5 o 6)
2. **¿En qué PASO exacto?**
3. **¿Qué mensaje de error ves?** (cópialo completo)

Y te ayudo específicamente con eso.

---

## ✅ CHECKLIST DE VERIFICACIÓN

Marca lo que ya hiciste:

- [ ] Tengo la carpeta GP-Medical en mi computadora
- [ ] Puedo abrir VSCode
- [ ] Puedo ver los archivos del proyecto en VSCode
- [ ] Tengo Node.js instalado (node --version funciona)
- [ ] Pude hacer `cd frontend`
- [ ] Pude hacer `npm install` (solo primera vez)
- [ ] Pude hacer `npm run dev`
- [ ] Puedo ver el proyecto en http://localhost:3000
- [ ] Pude cambiar un texto y verlo reflejado

---

**¿En qué paso estás ahora?** Dime y te ayudo específicamente. 🙂
