# 🎨 Vista Previa del Sistema GP-Medical

## 🖼️ Capturas de Pantalla (Descripción)

### 1. **Pantalla de Login**
```
┌─────────────────────────────────────┐
│                                     │
│         GP-Medical                  │
│   Sistema de Gestión Clínica       │
│                                     │
│  ┌───────────────────────────────┐ │
│  │  Iniciar Sesión               │ │
│  │                               │ │
│  │  Email: [____________]        │ │
│  │  Password: [_________]        │ │
│  │                               │ │
│  │  [  Iniciar Sesión  ]        │ │
│  │                               │ │
│  │  ¿Olvidaste tu contraseña?   │ │
│  └───────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```
- Gradiente azul-verde de fondo
- Card con sombra elegante
- Dark mode disponible

---

### 2. **Dashboard Principal**

```
┌─────────────────────────────────────────────────────────────┐
│ GP-Medical    Dashboard                    Dr. Juan Pérez   │
├─────────────────────────────────────────────────────────────┤
│ [☰]  Sidebar                                                │
│                                                              │
│  ¡Bienvenido de nuevo!                                      │
│  Aquí está un resumen de tu actividad clínica              │
│                                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │
│  │ 👥 1,234│ │ 📅 45   │ │ 💰$125K │ │ 📈 87%  │         │
│  │Pacientes│ │Citas Hoy│ │Ingresos │ │Ocupación│         │
│  │ +12.5%  │ │ +8 vs   │ │ +18.2%  │ │ +5.1%   │         │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘         │
│                                                              │
│  ┌─ Pacientes Recientes ──────┐ ┌─ Próximas Citas ─────┐ │
│  │                             │ │                       │ │
│  │ 👤 María García López       │ │ 11:00 Pedro González │ │
│  │    45 años • Hoy 10:30 AM   │ │       Consulta Gen.  │ │
│  │    [Completada]             │ │                       │ │
│  │                             │ │ 11:30 Laura Ramírez  │ │
│  │ 👤 Juan Martínez            │ │       Seguimiento    │ │
│  │    32 años • Hoy 09:00 AM   │ │                       │ │
│  │    [En consulta]            │ │ 12:00 Roberto López  │ │
│  │                             │ │       Primera Vez    │ │
│  └─────────────────────────────┘ └───────────────────────┘ │
│                                                              │
│  ┌─ Acciones Rápidas ────────────────────────────────────┐ │
│  │  [+ Nuevo Paciente]  [📅 Agendar Cita]  [📊 Reportes]│ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Colores:**
- Cards blancos con sombras sutiles
- Primario: Azul (#3B82F6)
- Secundario: Verde (#10B981)
- Gradientes en avatares
- Badges de colores según estado

---

### 3. **Módulo Pacientes**

```
┌─────────────────────────────────────────────────────────────┐
│ GP-Medical    Pacientes                    Dr. Juan Pérez   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Pacientes                        [⬇ Exportar] [+ Nuevo]   │
│  Gestiona el directorio maestro de pacientes               │
│                                                              │
│  ┌───────────────────────────────────────────┐ [🔍 Filtros]│
│  │ 🔍 Buscar por nombre, expediente, CURP... │             │
│  └───────────────────────────────────────────┘             │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Expediente │ Nombre            │ Edad │ Email    │ ⋮ │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ EXP-001234 │ 👤 María García  │ 45   │ maria@..│ ⋮ │  │
│  │ EXP-001235 │ 👤 Juan Martínez │ 32   │ juan@.. │ ⋮ │  │
│  │ EXP-001236 │ 👤 Ana Sánchez   │ 28   │ ana@..  │ ⋮ │  │
│  │ EXP-001237 │ 👤 Carlos Hern.  │ 55   │ carlos@.│ ⋮ │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  Mostrando 6 de 1,234 pacientes    [◀ Anterior] [Siguiente]│
└─────────────────────────────────────────────────────────────┘
```

**Características:**
- Tabla responsive
- Avatares con iniciales coloridas
- Hover effects
- Búsqueda en tiempo real
- Paginación

---

### 4. **Módulo Agenda**

```
┌─────────────────────────────────────────────────────────────┐
│ GP-Medical    Agenda de Citas                Dr. Juan Pérez │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Agenda de Citas                              [+ Nueva Cita]│
│  Gestiona las citas y consultas del día                    │
│                                                              │
│  [◀] 📅 Miércoles, 15 de enero de 2025 [▶]                │
│       [Día] [Semana] [Mes]                                 │
│                                                              │
│  [32 Total] [24 Confirmadas] [6 Nuevas] [2 No asistió]    │
│                                                              │
│  Dr. Juan Pérez - Consultorio 1          │ Lista de Espera │
│                                           │                 │
│  08:00 ┌──────────────────────────────┐  │ ⏱️ Ana Sánchez  │
│  09:00 │ ✅ María García             │  │  Llegó 9:50 AM  │
│        │ Consulta General (30 min)   │  │                 │
│        └──────────────────────────────┘  │                 │
│  09:30 ┌──────────────────────────────┐  │                 │
│        │ ✅ Juan Martínez             │  │ Notas del Día   │
│        │ Seguimiento (30 min)         │  │                 │
│        └──────────────────────────────┘  │ 📌 Junta equipo │
│  10:00 ┌──────────────────────────────┐  │    1:00 PM      │
│        │ 🔵 Ana Sánchez               │  │                 │
│        │ Primera Vez (45 min)         │  │ [+ Agregar Nota]│
│        │ [EN CONSULTA]                │  │                 │
│        └──────────────────────────────┘  │                 │
│  11:00 ┌──────────────────────────────┐  │                 │
│        │ 🟢 Carlos Hernández          │  │                 │
│        │ Procedimiento (60 min)       │  │                 │
│        │ [CONFIRMADA]                 │  │                 │
│        └──────────────────────────────┘  │                 │
│  12:00 [      Horario disponible      ]  │                 │
│  12:30 ┌──────────────────────────────┐  │                 │
│        │ 🟢 Laura Ramírez             │  │                 │
│        └──────────────────────────────┘  │                 │
└─────────────────────────────────────────────────────────────┘
```

**Colores por Estado:**
- ✅ Gris: Completada
- 🔵 Azul: En consulta (borde destacado)
- 🟢 Verde: Confirmada
- 🟣 Morado: Nueva

---

### 5. **Sidebar de Navegación**

```
┌─────────────────────┐
│   GP-Medical        │
├─────────────────────┤
│ 🏠 Dashboard        │
│ 👥 Pacientes        │
│ 📅 Agenda           │
│ 📋 Expedientes      │
│ 💊 Recetas          │
│ 🔬 Laboratorio      │
│ 📦 Inventario       │
│ 💳 Facturación      │
│ 📧 CRM              │
│ 📊 Reportes         │
│ ⚙️  Configuración   │
├─────────────────────┤
│ 🚪 Cerrar Sesión    │
└─────────────────────┘
```

**Características:**
- Colapsable en móvil
- Iconos lucide-react
- Item activo destacado
- Gradiente en logo

---

## 🎨 Paleta de Colores

### Modo Claro:
```css
--primary: #3B82F6      (Azul)
--secondary: #10B981    (Verde)
--background: #FFFFFF   (Blanco)
--foreground: #1F2937   (Gris oscuro)
--muted: #F3F4F6       (Gris claro)
```

### Modo Oscuro:
```css
--primary: #60A5FA      (Azul claro)
--secondary: #34D399    (Verde claro)
--background: #111827   (Gris muy oscuro)
--foreground: #F9FAFB   (Casi blanco)
--muted: #374151       (Gris medio)
```

---

## 📱 Responsive Design

### Desktop (>1024px):
- Sidebar fijo a la izquierda
- Contenido principal con padding generoso
- Tablas completas

### Tablet (768px - 1024px):
- Sidebar colapsable
- Cards en 2 columnas
- Navegación adaptada

### Mobile (<768px):
- Sidebar como drawer
- Cards en 1 columna
- Tablas scrollables horizontalmente
- Bottom navigation (opcional)

---

## ✨ Elementos Visuales Destacados

### 1. **Avatares con Gradiente:**
```css
/* Automáticamente generado por inicial */
background: linear-gradient(135deg, #3B82F6, #10B981);
border-radius: 50%;
color: white;
```

### 2. **Cards con Hover:**
```css
box-shadow: 0 1px 3px rgba(0,0,0,0.1);
transition: all 0.2s;

&:hover {
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}
```

### 3. **Badges de Estado:**
- 🟢 Verde: Completado/Activo
- 🔵 Azul: En progreso
- 🟡 Amarillo: Pendiente
- 🔴 Rojo: Cancelado/Error
- 🟣 Morado: Nuevo

### 4. **Gradientes de Fondo:**
```css
/* Login page */
background: linear-gradient(135deg,
  rgba(59, 130, 246, 0.1) 0%,
  rgba(255, 255, 255, 1) 50%,
  rgba(16, 185, 129, 0.1) 100%
);
```

---

## 🌓 Dark Mode

**Toggle automático:** Detecta preferencia del sistema
**Manual:** Switch en configuración (próximamente)

**Todos los componentes soportan dark mode:**
- Cards
- Inputs
- Buttons
- Tables
- Modals
- Sidebar

---

## 🎬 Animaciones

### Smooth Transitions:
```css
transition: all 0.2s ease-in-out;
```

### Page Transitions:
- Fade in al cargar
- Smooth scroll
- Loading states

### Micro-interactions:
- Button hover effects
- Card lift on hover
- Input focus rings
- Ripple effects

---

## 🖱️ Interacciones

### Cards Clickeables:
- Cursor pointer
- Hover effect
- Active state
- Touch feedback (móvil)

### Forms:
- Validación en tiempo real
- Error messages
- Success feedback
- Auto-save indicators

### Tables:
- Row hover highlight
- Sort indicators
- Filter badges
- Inline editing (próximamente)

---

## 📐 Layout

```
┌─────────────────────────────────────────┐
│ TopBar (Fixed)                          │
├──────┬──────────────────────────────────┤
│      │                                  │
│ Side │  Main Content                    │
│ bar  │  (Scrollable)                    │
│ Fix  │                                  │
│ ed   │  ┌─────────────────────────┐    │
│      │  │  Card                   │    │
│      │  └─────────────────────────┘    │
│      │                                  │
└──────┴──────────────────────────────────┘
```

**Márgenes:**
- Container: max-w-7xl
- Padding: 1rem (mobile), 2rem (desktop)
- Gap: 1.5rem entre cards

---

## 🚀 Cómo Verlo en Vivo

```bash
# 1. Descarga/clona el proyecto
git clone https://github.com/SamFragaProject/GP-Medical.git
cd GP-Medical

# 2. Inicia con Docker
docker-compose up -d

# 3. Abre en tu navegador
# http://localhost:3000

# 4. Explora:
# - Login (cualquier email/pass)
# - Dashboard
# - Pacientes
# - Agenda
# - Todas las secciones
```

---

## 📸 Capturas Reales

Para ver capturas reales del sistema:

1. **Inicia el sistema** (instrucciones arriba)
2. **Navega** a http://localhost:3000
3. **Explora** todos los módulos
4. **Cambia** a dark mode (icono sol/luna)
5. **Resize** la ventana para ver responsive

**¡El diseño es mucho más bonito en vivo que en ASCII art! 🎨✨**

---

## 💡 Personalización Visual

### Cambiar Colores:

Edita `frontend/src/app/globals.css`:

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* Tu color primario */
  --secondary: 142.1 76.2% 36.3%; /* Tu color secundario */
}
```

### Cambiar Logo:

```tsx
// frontend/src/app/dashboard/layout.tsx
<span>GP-Medical</span>
// Reemplaza con <img> o tu logo
```

---

**¡El sistema se ve espectacular! La única forma de apreciarlo completamente es verlo en vivo. 🚀**
