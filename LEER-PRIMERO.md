# 👋 EMPIEZA AQUÍ - LO MÁS FÁCIL

Para personas sin experiencia en desarrollo - **super simple**.

---

## ⚡ INICIO RÁPIDO (2 clics)

### Windows:

1. **Doble click** en: `INICIAR-PROYECTO.bat`
2. Esperar a que se abra el navegador
3. ✅ ¡Listo!

### Mac/Linux:

```bash
./INICIAR-PROYECTO.sh
```

---

## 🎯 ¿Qué Pasará?

1. Se instalarán las dependencias (solo primera vez)
2. Se iniciará el servidor
3. Se abrirá en: **http://localhost:3000**
4. ¡Verás tu proyecto!

---

## 🎨 Hacer Cambios

### 1. Abrir VSCode

```bash
code .
```

### 2. Editar Archivos

Los archivos importantes están en:
```
frontend/src/app/
```

### 3. Guardar

Presionar `Ctrl+S`

### 4. Ver Cambios

- Los cambios aparecen **automáticamente** en el navegador
- Si no aparecen, refrescar: `F5`

---

## 🛑 Detener

Presionar `Ctrl+C` en la terminal

---

## 📚 Guía Completa

Si necesitas más detalles, lee:
- **DESARROLLO-LOCAL-SIMPLE.md** ← Guía detallada paso a paso

---

## 🆘 Problemas?

### "No se encuentra node o npm"

**Solución:** Instalar Node.js
1. Ve a: https://nodejs.org
2. Descarga la versión LTS
3. Instalar y reiniciar la computadora
4. Intentar de nuevo

### "Puerto 3000 en uso"

**Solución:** Alguien más está usando ese puerto
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [número] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### "Error al instalar dependencias"

**Solución:** Limpiar y reinstalar
```bash
cd frontend
rm -rf node_modules
npm install
```

---

## 🎉 ¡Eso es Todo!

Así de simple. Ahora puedes:
- ✅ Ver tu proyecto localmente
- ✅ Hacer cambios
- ✅ Ver resultados al instante
- ✅ No necesitas saber Git, GitHub, Vercel, etc.

---

**¿Listo?** Haz doble click en `INICIAR-PROYECTO.bat` (Windows) o ejecuta `./INICIAR-PROYECTO.sh` (Mac/Linux) 🚀
