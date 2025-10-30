# 🏥 GP-Medical - Sistema de Medicina del Trabajo

## 🎯 Enfoque Especializado

Este sistema está **específicamente diseñado para Medicina del Trabajo** (Occupational Medicine), no es una clínica general.

---

## ✅ Funcionalidades Completadas

### 1. **Dashboard** (/dashboard)
**Estado:** ✅ **COMPLETADO Y FUNCIONAL**

**Características:**
- Muestra datos en **tiempo real** desde la API
- Estadísticas del día:
  - Total de trabajadores registrados
  - Citas de exámenes ocupacionales del día
  - Ingresos del mes
  - Tasa de ocupación
- Lista de **trabajadores recientes** (últimos 5)
- **Exámenes ocupacionales de hoy** con:
  - Hora del examen
  - Tipo de examen (ingreso, periódico, etc.)
  - Estado (confirmada, en espera, completada)
- Acciones rápidas para:
  - Registrar nuevo trabajador
  - Agendar examen
  - Ver reportes

**API Integrada:**
- `GET /api/v1/pacientes/` - Lista de trabajadores
- `GET /api/v1/citas/today` - Exámenes de hoy

---

### 2. **Trabajadores** (/dashboard/pacientes)
**Estado:** ✅ **COMPLETADO Y FUNCIONAL**

**Características:**
- **Búsqueda en tiempo real** por:
  - Nombre
  - Expediente
  - CURP
  - Empresa
- **Tabla completa** con información ocupacional:
  - Expediente médico
  - Nombre completo
  - Edad calculada automáticamente
  - Género (con badge de color)
  - **Empresa/Cliente**
  - **Puesto de trabajo**
  - Teléfono
- **Formulario completo** de registro con:

  **Datos Personales:**
  - Nombre, apellidos, fecha de nacimiento
  - Género, CURP

  **⭐ Información Laboral (Medicina del Trabajo):**
  - Empresa/Cliente (ej: Coca-Cola FEMSA)
  - Puesto (ej: Operador de montacargas)
  - Área/Departamento (ej: Almacén)

  **Contacto:**
  - Teléfono, Email

  **Identificaciones:**
  - RFC, NSS (Número de Seguro Social)

  **Dirección completa**

- **Acciones CRUD:**
  - ✅ Crear nuevo trabajador
  - ✅ Editar trabajador existente
  - ✅ Eliminar trabajador
  - ⏳ Ver expediente completo

**API Integrada:**
- `GET /api/v1/pacientes/` - Lista con búsqueda
- `POST /api/v1/pacientes/` - Crear trabajador
- `PUT /api/v1/pacientes/{id}` - Actualizar
- `DELETE /api/v1/pacientes/{id}` - Eliminar

**Generación Automática:**
- Número de expediente auto-generado (EXP-000001, EXP-000002, etc.)

---

### 3. **Agenda de Exámenes** (/dashboard/agenda)
**Estado:** ✅ **COMPLETADO Y FUNCIONAL**

**Características:**
- **Calendario navegable:**
  - Botones para día anterior/siguiente
  - Botón "Hoy" para volver al día actual
  - Muestra fecha completa en español

- **Estadísticas del día:**
  - Total de exámenes programados
  - Confirmados
  - Pendientes
  - No asistió

- **Timeline por hora** (8:00 - 19:00):
  - Muestra exámenes agendados con:
    - Nombre del trabajador
    - Tipo de examen ocupacional
    - Empresa y puesto del trabajador
    - Estado (nueva, confirmada, en espera, completada)
    - Duración en minutos
  - **Horarios disponibles:**
    - Click en horario vacío para agendar
    - Auto-completa fecha y hora

- **⭐ Tipos de Exámenes Ocupacionales:**
  1. **Examen de Ingreso** - Para nuevos trabajadores
  2. **Examen Periódico** - Vigilancia anual/semestral
  3. **Examen de Egreso** - Al terminar relación laboral
  4. **Examen de Reingreso** - Regreso después de ausencia prolongada
  5. **Cambio de Puesto** - Evaluación para nueva posición
  6. **Post-Accidente** - Después de accidente laboral
  7. **Reintegración Post-Incapacidad** - Regreso tras incapacidad
  8. **Vigilancia Especial** - Para exposición a riesgos específicos

- **Formulario de agendación:**
  - Búsqueda de trabajador (por nombre o expediente)
  - Selección de tipo de examen ocupacional
  - Fecha y hora
  - Duración personalizable (15-180 minutos)
  - Motivo/Observaciones (ej: "Examen de altura, audiometría, espirometría")
  - Estado de la cita

- **Sidebar informativo:**
  - Lista de todas las citas del día
  - Referencia rápida de tipos de examen

**API Integrada:**
- `GET /api/v1/citas/?fecha=YYYY-MM-DD` - Exámenes por fecha
- `POST /api/v1/citas/` - Crear examen
- `PUT /api/v1/citas/{id}` - Actualizar
- `DELETE /api/v1/citas/{id}` - Cancelar

---

## 🔄 Flujo de Trabajo Típico

### Como Recepcionista:
1. Login con `recepcion@clinica.com`
2. **Nuevo trabajador llega de una empresa:**
   - Ir a "Trabajadores"
   - Click en "Nuevo Trabajador"
   - Registrar:
     - Datos personales del trabajador
     - **Empresa cliente** (ej: Bimbo, Coca-Cola, etc.)
     - **Puesto** (ej: Operador, Chofer, etc.)
     - **Área** (ej: Producción, Logística)
   - Guardar → Se genera expediente automático
3. **Agendar examen ocupacional:**
   - Ir a "Agenda"
   - Seleccionar fecha
   - Click en horario disponible
   - Seleccionar trabajador
   - Elegir **tipo de examen** (ingreso, periódico, etc.)
   - Confirmar

### Como Médico:
1. Login con `dr.perez@clinica.com`
2. Ver Dashboard con exámenes del día
3. Ir a "Agenda" → ver todos los exámenes programados
4. Click en examen para ver detalles del trabajador
5. Realizar examen ocupacional
6. ⏳ (Pendiente) Registrar en expediente clínico

---

## ⏳ Pendiente de Completar

### Módulos con API pero sin UI completa:

1. **Expedientes Clínicos** (/dashboard/expedientes)
   - Backend: ✅ Modelos completos (SOAP, signos vitales, diagnósticos CIE-10)
   - Frontend: ❌ Pendiente crear UI

2. **Recetas Médicas** (/dashboard/recetas)
   - Backend: ✅ Modelo completo con QR
   - Frontend: ❌ Pendiente crear UI

3. **Órdenes de Estudios** (Lab/Imagenología)
   - Backend: ✅ Modelo completo
   - Frontend: ❌ Pendiente crear UI

4. **Inventario/Farmacia**
   - Backend: ✅ Kardex completo
   - Frontend: ❌ Pendiente crear UI

5. **Facturación CFDI 4.0**
   - Backend: ✅ Estructura completa
   - Frontend: ❌ Pendiente crear UI

6. **CRM/Campañas**
   - Backend: ✅ Modelo completo
   - Frontend: ❌ Pendiente crear UI

7. **Reportes**
   - Backend: ✅ Modelo de auditoría
   - Frontend: ❌ Pendiente crear UI

---

## 🎨 Diseño Visual

**Elementos de Medicina del Trabajo:**
- 💼 Icono de maletín (Briefcase) en títulos
- 🏢 Énfasis en "Empresa/Cliente"
- 👔 Información de "Puesto" y "Área"
- 🔬 Tipos de exámenes ocupacionales claramente identificados
- 📋 Terminología específica:
  - "Trabajadores" en lugar de "Pacientes"
  - "Exámenes ocupacionales" en lugar de "Consultas"
  - "Empresa/Cliente" prominente

**Colores por estado:**
- 🟢 Confirmada → Verde
- 🟡 En Espera → Amarillo
- 🟣 Nueva → Morado
- ⚫ Completada → Gris
- 🔴 Cancelada → Rojo
- 🟠 No Asistió → Naranja

---

## 🚀 Cómo Probar

### 1. Iniciar servicios:
```bash
cd /home/user/GP-Medical
docker-compose up -d
sleep 10
docker-compose exec backend bash init_db.sh
```

### 2. Acceder:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000

### 3. Usuarios demo:
Ver archivo `USUARIOS_DEMO.md` para credenciales completas.

**Roles principales:**
- **Admin:** admin@clinica.com / admin123
- **Médico:** dr.perez@clinica.com / medico123
- **Recepción:** recepcion@clinica.com / recepcion123

### 4. Probar funcionalidad:

**Test 1: Registrar trabajador**
1. Login como Recepción
2. Ir a "Trabajadores"
3. Click "Nuevo Trabajador"
4. Llenar formulario con:
   - Nombre: Pedro Ramírez
   - Empresa: Coca-Cola FEMSA
   - Puesto: Operador de montacargas
   - Área: Almacén
5. Guardar
6. Verificar que aparece en la tabla

**Test 2: Agendar examen ocupacional**
1. Ir a "Agenda"
2. Click en horario disponible (ej: 10:00)
3. Seleccionar trabajador recién creado
4. Tipo: "Examen de Ingreso"
5. Duración: 45 minutos
6. Motivo: "Examen de ingreso + audiometría"
7. Guardar
8. Verificar que aparece en timeline

**Test 3: Ver Dashboard**
1. Ir a Dashboard
2. Verificar que muestra:
   - Trabajadores totales
   - Citas de hoy
   - Lista de últimos trabajadores
   - Exámenes programados para hoy

---

## 📊 Datos de Prueba

El sistema incluye 5 trabajadores de ejemplo:
1. María García López (45 años) - EXP-001234
2. Juan Martínez Rodríguez (32 años) - EXP-001235
3. Ana Sánchez Pérez (28 años) - EXP-001236
4. Carlos Hernández Torres (55 años) - EXP-001237
5. Laura Ramírez Gómez (38 años) - EXP-001238

Y 5 citas de exámenes ocupacionales para hoy.

---

## 🔐 Permisos por Rol

### Administrador
✅ Acceso completo a todo el sistema

### Médico
✅ Dashboard
✅ Agenda (ver y gestionar sus citas)
✅ Trabajadores (ver y consultar)
⏳ Expedientes clínicos (pendiente UI)
⏳ Recetas (pendiente UI)

### Recepción
✅ Dashboard
✅ Trabajadores (CRUD completo)
✅ Agenda (crear/modificar citas)
❌ Expedientes clínicos
❌ Facturación

### Enfermería
✅ Dashboard
✅ Lista de trabajadores
⏳ Signos vitales (pendiente UI)
⏳ Triage (pendiente UI)

### Caja
✅ Dashboard
⏳ Órdenes de cobro (pendiente UI)
⏳ Facturación CFDI (pendiente UI)

---

## 🎯 Siguientes Pasos

### Prioridad Alta:
1. **Expediente Clínico Ocupacional**
   - SOAP notes específicas para medicina del trabajo
   - Historia laboral
   - Exposición a riesgos
   - Aptitud para el trabajo

2. **Certificados de Aptitud**
   - Generar certificado de "Apto/No Apto" para trabajar
   - Incluir restricciones si las hay
   - Firma digital del médico

3. **Órdenes de Estudios**
   - Audiometrías
   - Espirometrías
   - Rayos X
   - Análisis de laboratorio

### Prioridad Media:
4. Facturación CFDI 4.0
5. Reportes estadísticos
6. CRM para empresas cliente

### Mejoras futuras:
- Integración con equipos médicos (audiómetro, espirómetro)
- Firma electrónica avanzada (FIEL)
- Portal para empresas cliente
- App móvil para trabajadores

---

## 📞 Soporte Técnico

**Backend:** FastAPI + PostgreSQL
- API Docs: http://localhost:8000/docs
- Logs: `docker-compose logs backend`

**Frontend:** Next.js 14 + Tailwind + shadcn/ui
- Puerto: 3000
- Logs: `docker-compose logs frontend`

**Reiniciar todo:**
```bash
docker-compose restart
```

**Reiniciar base de datos:**
```bash
docker-compose down -v
docker-compose up -d
sleep 10
docker-compose exec backend bash init_db.sh
```

---

## ✨ Resumen

**Lo que FUNCIONA hoy:**
- ✅ Sistema de login con 6 roles
- ✅ Dashboard con datos en vivo
- ✅ Gestión de trabajadores (CRUD completo)
- ✅ Agenda de exámenes ocupacionales (CRUD completo)
- ✅ Búsqueda en tiempo real
- ✅ Auto-generación de expedientes
- ✅ Enfoque en medicina del trabajo

**Lo que necesita UI:**
- ⏳ Expediente clínico ocupacional
- ⏳ Recetas médicas
- ⏳ Órdenes de estudios
- ⏳ Inventario/Farmacia
- ⏳ Facturación CFDI
- ⏳ Reportes

**La base está completa. Los módulos restantes solo necesitan interfaces de usuario conectadas a las APIs existentes.**
