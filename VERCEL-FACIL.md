# ⚡ Solución FÁCIL - Desplegar Frontend en Vercel

## 🎯 Configuración Simple (3 clics)

### 1️⃣ Root Directory

En Vercel Project Settings:
```
General > Root Directory > Edit
Cambiar a: frontend
Save
```

### 2️⃣ Build Settings

En **Settings > General > Build & Development Settings**:

Dejar todo en **AUTOMÁTICO**:
- Framework Preset: **Next.js** (auto-detectado)
- Build Command: **(vacío - usa default)**
- Output Directory: **(vacío - usa default)**
- Install Command: **(vacío - usa default)**

### 3️⃣ Environment Variables (Opcional por ahora)

Settings > Environment Variables > Add:
```
Name: NEXT_PUBLIC_API_URL
Value: http://localhost:8000/api/v1
```

(Puedes cambiarlo después cuando tengas backend)

---

## 🚀 Redesplegar

1. Deployments > Click en último deployment
2. Click en los 3 puntos `...`
3. **Redeploy**
4. ✅ ¡Debería funcionar!

---

## ❓ Si Sigue Fallando

Borra el proyecto de Vercel y créalo de nuevo:

### Paso 1: Borrar Proyecto
1. Settings > General > Delete Project (al final)
2. Escribir el nombre y confirmar

### Paso 2: Crear de Nuevo
1. New Project
2. Importar tu repo de GitHub
3. **IMPORTANTE:** En la configuración antes de deploy:
   ```
   Root Directory: frontend  ← Cambiar aquí ANTES de deploy
   Framework: Next.js (auto)
   Build Command: (dejar vacío)
   Output Directory: (dejar vacío)
   Install Command: (dejar vacío)
   ```
4. Add Environment Variable (opcional):
   ```
   NEXT_PUBLIC_API_URL = http://localhost:8000/api/v1
   ```
5. **Deploy**

---

## ✅ Checklist

- [ ] Root Directory configurado como `frontend`
- [ ] Build settings en automático
- [ ] NO hay vercel.json en el repo
- [ ] Redesplegar
- [ ] Debería verse la página de login

---

## 🎉 Una vez que funcione

La página se verá, pero:
- Login NO funcionará (necesitas backend)
- Ver `DEPLOYMENT.md` para desplegar el backend

---

**¿Sigues con problemas?** Envíame el error exacto que aparece.
