# 🔄 Workflow de Desarrollo - Editar, Push, Previsualizar

Guía completa para trabajar con VSCode, GitHub y Vercel.

---

## 🎯 El Flujo Completo

```
1. Editar en VSCode           ← Tu computadora
        ↓
2. Git push a GitHub           ← Subir cambios
        ↓
3. Vercel detecta y despliega  ← Automático
        ↓
4. Ver preview en navegador    ← Revisar cambios
        ↓
5. ¿Está bien? → Merge a main  ← Publicar
   ¿Hay errores? → Volver al paso 1
```

---

## 🚀 Setup Inicial (Una sola vez)

### 1. Configurar Vercel

**En tu proyecto de Vercel:**
1. Settings > Git
2. Asegúrate que esté conectado a tu repo de GitHub
3. **Production Branch:** `main` (o `master`)
4. **Automatic Deployments:** ✅ Activado

**Root Directory:**
1. Settings > General > Root Directory
2. Cambiar a: `frontend`
3. Save

### 2. Verificar Git en tu Computadora

```bash
cd GP-Medical

# Verificar que estás en el repo correcto
git remote -v
# Debe mostrar tu repo de GitHub

# Verificar tu branch
git branch
# Debe mostrar tu branch actual
```

---

## 💻 Workflow Día a Día

### Opción A: Editar y Preview (Recomendado)

Trabaja en una **branch separada** para ver previews:

```bash
# 1. Crear branch para tus cambios
git checkout -b mi-cambio

# 2. Editar en VSCode
# ... haz tus cambios ...

# 3. Ver cambios localmente (opcional)
cd frontend
npm run dev
# Ver en: http://localhost:3000

# 4. Subir a GitHub
git add .
git commit -m "feat: descripción de tu cambio"
git push -u origin mi-cambio

# 5. ✅ Vercel automáticamente creará un PREVIEW
# Recibirás una URL como:
# https://gp-medical-abc123.vercel.app
```

**Ver el Preview:**
1. Ve a tu proyecto en Vercel
2. Tab **Deployments**
3. Verás tu branch `mi-cambio`
4. Click en la URL para ver los cambios

**Si está bien, merge a producción:**
```bash
# 6. Cambiar a main
git checkout main

# 7. Merge tus cambios
git merge mi-cambio

# 8. Push a producción
git push origin main

# 9. Vercel desplegará a producción automáticamente
```

### Opción B: Directo a Producción (Más rápido, más riesgoso)

Si quieres publicar directamente sin preview:

```bash
# 1. Asegúrate de estar en main
git checkout main
git pull

# 2. Editar en VSCode
# ... haz tus cambios ...

# 3. Subir cambios
git add .
git commit -m "feat: tu cambio"
git push

# 4. ✅ Vercel desplegará automáticamente a producción
# Ver en tu URL principal: https://tu-proyecto.vercel.app
```

---

## 🎨 Ejemplos de Edición Común

### Ejemplo 1: Cambiar Texto en Login

```bash
# 1. Abrir archivo en VSCode
# frontend/src/app/auth/login/page.tsx

# 2. Editar lo que quieras

# 3. Guardar (Ctrl+S)

# 4. Commit y push
git add frontend/src/app/auth/login/page.tsx
git commit -m "fix: actualizar texto de login"
git push

# 5. ✅ En 2-3 minutos verás cambios en Vercel
```

### Ejemplo 2: Cambiar Estilos/Colores

```bash
# 1. Editar
# frontend/src/app/globals.css

# 2. Commit y push
git add frontend/src/app/globals.css
git commit -m "style: actualizar colores principales"
git push

# 3. ✅ Vercel desplegará automáticamente
```

### Ejemplo 3: Agregar Nueva Página

```bash
# 1. Crear archivo
# frontend/src/app/nueva-seccion/page.tsx

# 2. Commit y push
git add frontend/src/app/nueva-seccion/
git commit -m "feat: agregar sección nueva"
git push

# 3. ✅ Accesible en: https://tu-url.vercel.app/nueva-seccion
```

---

## 📱 Ver Previews en Vercel

### En el Dashboard de Vercel:

1. **Deployments** tab
2. Verás lista de deployments:
   ```
   ✅ Production    main              2m ago
   🔄 Preview       mi-cambio         1m ago
   ✅ Preview       fix-bug           10m ago
   ```

3. Click en cualquier deployment para:
   - Ver la URL del preview
   - Ver logs de build
   - Ver errores si los hay
   - Comparar con versión anterior

### URLs de Preview:

- **Producción:** `https://tu-proyecto.vercel.app`
- **Preview branch:** `https://gp-medical-git-mi-cambio-usuario.vercel.app`
- **Preview PR:** `https://gp-medical-pr-123-usuario.vercel.app`

---

## 🔧 Scripts Útiles

He creado scripts para facilitar el workflow:

### Deploy Rápido

```bash
# Usar el script de deployment rápido
./deploy-preview.sh "descripción del cambio"
```

### Comandos Útiles

```bash
# Ver estado actual
git status

# Ver diferencias
git diff

# Ver historial
git log --oneline -10

# Deshacer último commit (sin perder cambios)
git reset --soft HEAD~1

# Limpiar cambios no guardados
git checkout .
```

---

## 🐛 Troubleshooting

### "Build Failed" en Vercel

**Causa:** Errores de compilación

**Solución:**
```bash
# Probar build localmente
cd frontend
npm run build

# Si hay errores, corrígelos
# Luego push de nuevo
git add .
git commit -m "fix: corregir errores de build"
git push
```

### "No se ven mis cambios"

**Causa:** Caché del navegador

**Solución:**
1. Hard refresh: `Ctrl + Shift + R` (Windows/Linux) o `Cmd + Shift + R` (Mac)
2. O abrir en ventana incógnita
3. Esperar 2-3 minutos (el build tarda un poco)

### "Error 404" en algunas páginas

**Causa:** Ruteo de Next.js

**Solución:** Verificar que el archivo existe en `frontend/src/app/`

### "Cannot find module"

**Causa:** Falta instalar dependencia

**Solución:**
```bash
cd frontend
npm install nombre-del-paquete
git add package.json package-lock.json
git commit -m "deps: agregar paquete X"
git push
```

---

## 📊 Monitorear Deployments

### Ver Logs en Tiempo Real:

1. Ir a Vercel > tu proyecto
2. Click en el deployment en progreso
3. Ver **Building** logs
4. Si hay errores, aparecerán aquí

### Notificaciones:

- **GitHub:** Vercel comenta en los PRs con el preview
- **Email:** Recibes email si el build falla
- **Slack/Discord:** (Opcional) Configurar en Settings > Integrations

---

## 🎯 Recomendaciones

### Para Desarrollo:

✅ **SÍ hacer:**
- Trabajar en branches separadas
- Probar localmente con `npm run dev`
- Commits pequeños y frecuentes
- Mensajes de commit descriptivos
- Ver preview antes de merge a main

❌ **NO hacer:**
- Push directo a main sin probar
- Commits gigantes con muchos cambios
- Subir archivos `.env` con secretos
- Ignorar errores de build

### Estructura de Commits:

```bash
# Buenos ejemplos:
git commit -m "feat: agregar página de reportes"
git commit -m "fix: corregir bug en login"
git commit -m "style: mejorar diseño del dashboard"
git commit -m "refactor: simplificar componente tabla"

# Malos ejemplos:
git commit -m "cambios"
git commit -m "fix"
git commit -m "asdfasdf"
```

---

## 🚦 Workflow Completo en Práctica

### Caso Real: "Quiero cambiar el color del botón de login"

```bash
# 1. Crear branch
git checkout -b cambiar-color-boton

# 2. Abrir VSCode
code .

# 3. Editar archivo
# frontend/src/components/ui/button.tsx
# Cambiar el color del botón

# 4. Ver localmente (opcional)
cd frontend
npm run dev
# Verificar en http://localhost:3000

# 5. Commit
git add frontend/src/components/ui/button.tsx
git commit -m "style: cambiar color botón login a azul"

# 6. Push
git push -u origin cambiar-color-boton

# 7. Ver en Vercel
# Ir a Vercel > Deployments
# Click en tu branch "cambiar-color-boton"
# Copiar URL del preview
# Abrir en navegador

# 8a. Si está bien - Merge
git checkout main
git merge cambiar-color-boton
git push origin main

# 8b. Si hay que corregir - Repetir
# Editar más
git add .
git commit -m "style: ajustar tono de azul"
git push
# Vercel automáticamente actualizará el preview
```

---

## 📱 Compartir Previews

Puedes compartir la URL de preview con otros:

```
https://gp-medical-git-mi-branch-usuario.vercel.app

Perfecto para:
- Mostrar a tu equipo
- Pedir feedback
- Probar en diferentes dispositivos
- Compartir progreso con cliente
```

---

## ⚡ Atajos y Tips

### Alias Git Útiles (Opcional)

Agregar a `~/.gitconfig`:

```ini
[alias]
    s = status
    a = add .
    c = commit -m
    p = push
    l = log --oneline -10
    d = diff
```

Uso:
```bash
git s          # en vez de git status
git a          # en vez de git add .
git c "mensaje"  # en vez de git commit -m "mensaje"
git p          # en vez de git push
```

### VSCode Extensions Recomendadas:

- **GitLens** - Ver historial de cambios
- **Git Graph** - Ver árbol de branches
- **Error Lens** - Ver errores inline
- **Prettier** - Formateo automático
- **ES7+ React Snippets** - Snippets para React

---

## 🎉 Checklist de Workflow

Antes de cada cambio:
- [ ] `git pull` (obtener últimos cambios)
- [ ] Crear branch nueva
- [ ] Editar en VSCode
- [ ] Probar localmente (opcional)
- [ ] Commit con mensaje descriptivo
- [ ] Push a GitHub
- [ ] Ver preview en Vercel
- [ ] Si está bien, merge a main
- [ ] Verificar producción

---

## 📞 Siguiente Nivel

Una vez domines este workflow, puedes:

1. **Configurar Backend** - Ver `DEPLOYMENT.md`
2. **Configurar CI/CD** - Tests automáticos antes de deploy
3. **Agregar Dominio Custom** - Tu propio dominio
4. **Configurar Analytics** - Ver métricas de uso
5. **Branch Protection** - Requerir reviews antes de merge

---

**¡Listo!** Ahora puedes editar, push y ver cambios en segundos. 🚀

¿Dudas? Pregunta lo que necesites.
