# ⚡ GUÍA SUPER SIMPLE - Ver tu Proyecto Localmente

Para principiantes - trabajar como siempre has hecho.

---

## 🎯 Lo que Vas a Hacer

1. Abrir el proyecto en VSCode
2. Ejecutar 2 comandos
3. Ver tu proyecto en: **http://localhost:3000**
4. Hacer cambios y verlos al instante
5. ¡Eso es todo!

---

## 📋 Antes de Empezar

### ¿Tienes instalado?

Verifica con estos comandos:

```bash
node --version
```
Debe mostrar algo como: `v18.0.0` o superior

```bash
npm --version
```
Debe mostrar algo como: `9.0.0` o superior

**Si no los tienes:** Descarga Node.js de https://nodejs.org (versión LTS)

---

## 🚀 Pasos Súper Simples

### 1️⃣ Abrir VSCode

```bash
# Si estás en la carpeta GP-Medical:
code .

# Si no estás ahí:
cd ruta/a/GP-Medical
code .
```

### 2️⃣ Abrir Terminal en VSCode

- **Opción 1:** Menú > Terminal > New Terminal
- **Opción 2:** Atajo: `Ctrl + Ñ` (Windows) o `Ctrl + ~` (Mac)

### 3️⃣ Ir a la Carpeta Frontend

En la terminal que se abrió:

```bash
cd frontend
```

### 4️⃣ Instalar Dependencias (Solo Primera Vez)

```bash
npm install
```

⏳ Esto tardará 2-3 minutos la primera vez.

**¿Te da error?** Intenta:
```bash
npm install --legacy-peer-deps
```

### 5️⃣ Iniciar el Servidor

```bash
npm run dev
```

Verás algo como:
```
▲ Next.js 14.1.0
- Local:    http://localhost:3000
✓ Ready in 3.2s
```

### 6️⃣ Abrir en tu Navegador

Ve a: **http://localhost:3000**

✅ **¡Listo!** Deberías ver tu proyecto.

---

## 🎨 Hacer Cambios

### El Flujo Simple:

```
1. Editar archivo en VSCode
   ↓
2. Guardar (Ctrl+S)
   ↓
3. Refrescar navegador (F5)
   ↓
4. Ver cambios al instante ✅
```

### Ejemplo Práctico:

**Cambiar el título de una página:**

1. En VSCode, abrir:
   ```
   frontend/src/app/page.tsx
   ```

2. Buscar algo de texto

3. Cambiar el texto

4. Guardar (`Ctrl+S`)

5. Ir al navegador

6. Refrescar (`F5`)

7. ✅ **¡Verás el cambio!**

---

## 📁 Archivos Importantes

### Páginas:
```
frontend/src/app/
├── page.tsx           ← Página principal
├── auth/
│   └── login/
│       └── page.tsx   ← Login
└── dashboard/
    └── page.tsx       ← Dashboard
```

### Componentes:
```
frontend/src/components/
├── ui/                ← Botones, inputs, etc.
└── ...
```

### Estilos:
```
frontend/src/app/globals.css  ← Estilos globales
```

---

## 🛑 Detener el Servidor

Cuando termines de trabajar:

1. Ve a la terminal donde corre `npm run dev`
2. Presiona: `Ctrl + C`
3. Confirma con: `Y` o `S`

---

## 🔄 Volver a Trabajar (Otro Día)

```bash
# 1. Abrir VSCode
code .

# 2. Abrir terminal (Ctrl + Ñ)

# 3. Ir a frontend
cd frontend

# 4. Iniciar servidor
npm run dev

# 5. Abrir navegador
# http://localhost:3000
```

---

## ⚠️ Problemas Comunes

### Error: "Puerto 3000 ya está en uso"

**Solución 1:** Detener el proceso anterior
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [número] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

**Solución 2:** Usar otro puerto
```bash
npm run dev -- -p 3001
# Ahora abrir: http://localhost:3001
```

### Error: "Cannot find module"

**Solución:** Reinstalar dependencias
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Página en blanco

**Solución:**
1. Ver la consola del navegador (F12)
2. Ver errores en la terminal
3. Verificar que el backend NO es necesario por ahora

### Cambios no se ven

**Solución:**
1. Guardar el archivo (`Ctrl+S`)
2. Esperar 2-3 segundos
3. Hard refresh: `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)

---

## 💡 Tips Útiles

### Hot Reload Automático

Next.js actualiza automáticamente cuando guardas. **No necesitas refrescar** el navegador en la mayoría de casos.

### Ver 2 Ventanas

**Opción 1:** VSCode + Navegador lado a lado
- VSCode a la izquierda
- Navegador a la derecha

**Opción 2:** Segundo monitor
- VSCode en un monitor
- Navegador en otro

### Terminal Siempre Visible

En VSCode:
1. Ver > Appearance > Panel Position
2. Seleccionar "Right" (derecha)

Ahora la terminal estará a un lado.

---

## 🎯 Workflow Diario

```bash
# Mañana:
1. Abrir VSCode
2. Terminal: cd frontend
3. Terminal: npm run dev
4. Navegar a localhost:3000

# Trabajar:
5. Editar archivos
6. Guardar (automáticamente se actualiza)
7. Ver cambios

# Al terminar:
8. Ctrl+C en terminal
9. Cerrar VSCode
```

---

## 📚 Qué Editar Según lo que Quieras Cambiar

### Cambiar Textos:
```
frontend/src/app/*/page.tsx
```

### Cambiar Colores:
```
frontend/src/app/globals.css
frontend/tailwind.config.js
```

### Cambiar Componentes (botones, inputs):
```
frontend/src/components/ui/*
```

### Agregar Nueva Página:
```
Crear: frontend/src/app/nueva-pagina/page.tsx
Acceder: http://localhost:3000/nueva-pagina
```

---

## ⚡ Atajos de VSCode

```
Ctrl+S          Guardar
Ctrl+P          Buscar archivo
Ctrl+F          Buscar en archivo
Ctrl+H          Buscar y reemplazar
Ctrl+Ñ          Abrir/cerrar terminal
Ctrl+B          Abrir/cerrar sidebar
F12             Ir a definición
Alt+↑/↓         Mover línea arriba/abajo
Shift+Alt+↑/↓   Duplicar línea
```

---

## 🎉 Checklist de Inicio

- [ ] Node.js instalado (`node --version`)
- [ ] VSCode abierto en la carpeta correcta
- [ ] Terminal abierta (`Ctrl+Ñ`)
- [ ] En carpeta frontend (`cd frontend`)
- [ ] Dependencias instaladas (`npm install`)
- [ ] Servidor corriendo (`npm run dev`)
- [ ] Navegador en http://localhost:3000
- [ ] Puedo ver el proyecto ✅

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:
1. Copia el error exacto que aparece
2. Dime en qué paso estás
3. Te ayudo a solucionarlo

---

## 🚀 Siguiente Nivel (Opcional)

Una vez que domines esto, puedes:
- Configurar el backend (si lo necesitas)
- Desplegar en Vercel (para compartir)
- Usar Git (para versionar)

**Pero por ahora:** Solo necesitas trabajar localmente. 👍

---

## 📝 Resumen Ultra-Corto

```bash
# Abrir VSCode
code .

# Terminal
cd frontend
npm install        # Solo primera vez
npm run dev        # Cada vez que trabajes

# Navegar a:
http://localhost:3000

# Editar archivos en VSCode
# Guardar (Ctrl+S)
# Ver cambios automáticamente ✅
```

---

**¿Listo para empezar?** Sigue los pasos desde 1️⃣ y estarás trabajando en minutos. 🎯
