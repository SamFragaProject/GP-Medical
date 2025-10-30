# 🚀 Solución: Error 404 en Vercel

## 🔍 Diagnóstico

El error `404: NOT_FOUND` en Vercel ocurre porque **Vercel no sabe que tu frontend está en la carpeta `/frontend`**.

Por defecto, Vercel busca el proyecto en la raíz, pero tu estructura es:
```
GP-Medical/
├── backend/          ← API (NO se despliega en Vercel)
└── frontend/         ← Next.js (ESTO debe desplegarse)
```

---

## ✅ SOLUCIÓN 1: Configurar Root Directory en Vercel (RECOMENDADO)

### Paso 1: Ir a Project Settings

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto "GP-Medical"
3. Click en **Settings** (arriba derecha)

### Paso 2: Cambiar Root Directory

1. En el menú lateral, click en **General**
2. Busca la sección **"Root Directory"**
3. Click en **Edit**
4. Cambia de `.` (raíz) a: **`frontend`**
5. Click en **Save**

### Paso 3: Configurar Variables de Entorno

1. En Settings, ir a **Environment Variables**
2. Agregar:
   ```
   Name: NEXT_PUBLIC_API_URL
   Value: https://tu-backend.railway.app/api/v1
   ```
   (Reemplaza con la URL real de tu backend)

3. Importante: Asegúrate de seleccionar los 3 environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

### Paso 4: Redesplegar

1. Ve a la pestaña **Deployments**
2. Click en los 3 puntos (`...`) del último deployment
3. Click en **Redeploy**
4. ✅ Debería funcionar ahora

---

## ✅ SOLUCIÓN 2: Usando vercel.json (Alternativa)

Si prefieres no cambiar el Root Directory, puedes usar el archivo `vercel.json` que ya creé.

### Verificar vercel.json

El archivo `/vercel.json` ya fue creado con:
```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/.next"
}
```

### Redesplegar

1. Hacer commit del vercel.json:
```bash
git add vercel.json
git commit -m "fix: add vercel.json for deployment"
git push
```

2. Vercel detectará el cambio y redesplegará automáticamente

---

## 🔧 Verificar Configuración de Build

En Vercel Project Settings > Build & Development Settings:

### Configuración recomendada:

**Si usaste Solución 1 (Root Directory):**
```
Root Directory: frontend
Framework Preset: Next.js
Build Command: npm run build (default)
Output Directory: .next (default)
Install Command: npm install (default)
```

**Si usaste Solución 2 (vercel.json):**
```
Root Directory: . (raíz)
Framework Preset: Next.js
Build Command: cd frontend && npm run build
Output Directory: frontend/.next
Install Command: cd frontend && npm install
```

---

## 🌐 Configurar Backend URL

Tu frontend necesita conectarse al backend. Hay 3 opciones:

### Opción A: Desplegar Backend en Railway (Recomendado)

1. Seguir la guía en `DEPLOYMENT.md`
2. Obtener URL del backend (ej: `https://gp-medical-api.railway.app`)
3. Configurar en Vercel Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://gp-medical-api.railway.app/api/v1
   ```

### Opción B: Usar Backend Local (Solo para pruebas)

**NO recomendado para producción**, pero para probar:

1. Configurar en Vercel:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
   ```
2. ⚠️ Solo funcionará cuando ejecutes el backend localmente

### Opción C: Desplegar Backend en Render/Cloud Run

Seguir las guías correspondientes y usar esa URL.

---

## 🔍 Verificar que Funciona

### 1. Check de Build

Después de redesplegar, verifica en la pestaña **Deployments**:
- ✅ Status debe ser "Ready"
- ✅ No debe haber errores en el build log

### 2. Acceder a la URL

1. Click en el deployment exitoso
2. Click en **Visit**
3. Deberías ver la página de login

### 3. Verificar Console

1. Abrir DevTools (F12)
2. Ver tab **Console**
3. Si hay errores de CORS o "Failed to fetch":
   - El frontend está bien
   - Necesitas configurar el backend (ver siguiente sección)

---

## 🔒 Configurar CORS en Backend

Una vez que el frontend funcione, necesitas configurar CORS en tu backend.

### Si Backend en Railway:

1. Ir a Railway dashboard
2. Tu servicio backend > Variables
3. Actualizar:
   ```
   CORS_ORIGINS=https://tu-proyecto.vercel.app
   ```
4. Railway redesplegará automáticamente

### Si Backend Local:

Editar `backend/.env`:
```env
CORS_ORIGINS=https://tu-proyecto.vercel.app,http://localhost:3000
```

---

## 📊 Checklist de Deployment

- [ ] Root Directory configurado en Vercel como `frontend`
- [ ] Variables de entorno configuradas (`NEXT_PUBLIC_API_URL`)
- [ ] Deployment exitoso (Status: Ready)
- [ ] Página de login visible
- [ ] Backend desplegado y accesible
- [ ] CORS configurado en backend
- [ ] Login funcional

---

## ❓ Troubleshooting

### Error: "Failed to compile"

**Causa:** Errores de TypeScript o sintaxis

**Solución:**
```bash
cd frontend
npm run build
```
Corregir errores mostrados

### Error: "Cannot find module"

**Causa:** Dependencias faltantes

**Solución:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Error: "CORS policy"

**Causa:** Backend no permite requests desde Vercel

**Solución:** Configurar CORS en backend (ver sección arriba)

### Página en blanco sin errores

**Causa:** JavaScript no se ejecuta

**Solución:**
1. Verificar que `NEXT_PUBLIC_API_URL` está configurado
2. Ver errores en Console (F12)
3. Verificar que el backend está respondiendo

---

## 📞 Próximos Pasos

Una vez que el frontend funcione en Vercel:

1. **Desplegar Backend** - Seguir `DEPLOYMENT.md`
2. **Configurar Dominio** (Opcional) - En Vercel Settings > Domains
3. **Configurar SSL** - Vercel lo hace automáticamente
4. **Monitoreo** - Vercel Analytics en Settings

---

## 🎯 Resumen Rápido

**Para solucionar el 404:**

1. Ve a Vercel Project > Settings > General
2. Cambia Root Directory a `frontend`
3. Agrega variable: `NEXT_PUBLIC_API_URL=https://tu-backend.railway.app/api/v1`
4. Redeploy
5. ✅ Listo

---

**¿Aún tienes el error 404?** Verifica:
- Que guardaste los cambios en Vercel
- Que redesplegaste después de los cambios
- Que el directorio `frontend` existe en tu repositorio
- Logs del deployment para errores específicos
