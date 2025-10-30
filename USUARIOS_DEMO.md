# 👥 Usuarios Demo - GP-Medical

Este documento lista todos los usuarios de prueba configurados en el sistema.

## 🚀 Inicio Rápido

### 1. Iniciar el Sistema

```bash
# Con Docker
docker-compose up -d

# Espera que los servicios estén listos (10 segundos)
# Luego inicializa la base de datos:
docker-compose exec backend bash init_db.sh
```

### 2. Accede al Sistema

Abre tu navegador en: **http://localhost:3000**

Verás una pantalla con **6 tarjetas de usuarios demo**. Haz clic en cualquiera para iniciar sesión automáticamente.

---

## 👤 Usuarios por Rol

### 1. **Administrador** 👨‍💼
- **Email:** `admin@clinica.com`
- **Password:** `admin123`
- **Permisos:** Gestión completa del sistema
- **Acceso a:**
  - Todos los módulos
  - Configuración del sistema
  - Gestión de usuarios
  - Reportes y analytics
  - Configuración de empresa y sedes

---

### 2. **Médico General** 🩺
- **Email:** `dr.perez@clinica.com`
- **Password:** `medico123`
- **Nombre:** Dr. Juan Pérez
- **Cédula:** 1234567
- **Especialidad:** Medicina General
- **Acceso a:**
  - Dashboard médico
  - Agenda de citas
  - Expedientes clínicos
  - Recetas médicas
  - Órdenes de estudio
  - Historial de pacientes

---

### 3. **Pediatra** 👶
- **Email:** `dra.martinez@clinica.com`
- **Password:** `medico123`
- **Nombre:** Dra. María Martínez
- **Cédula:** 2345678
- **Especialidad:** Pediatría
- **Acceso a:**
  - Dashboard médico
  - Agenda de citas
  - Expedientes clínicos
  - Recetas pediátricas
  - Órdenes de estudio
  - Historial de pacientes

---

### 4. **Recepción** 📋
- **Email:** `recepcion@clinica.com`
- **Password:** `recepcion123`
- **Nombre:** Ana González
- **Acceso a:**
  - Dashboard de recepción
  - Gestión de pacientes
  - Agenda de citas (crear/modificar)
  - Check-in de pacientes
  - Admisión
  - Sala de espera

---

### 5. **Enfermería** 💉
- **Email:** `enfermeria@clinica.com`
- **Password:** `enfermeria123`
- **Nombre:** Laura Sánchez
- **Acceso a:**
  - Dashboard de enfermería
  - Lista de pacientes
  - Signos vitales
  - Triage
  - Apoyo en procedimientos
  - Órdenes de laboratorio

---

### 6. **Caja** 💰
- **Email:** `caja@clinica.com`
- **Password:** `caja123`
- **Nombre:** Carlos Rodríguez
- **Acceso a:**
  - Dashboard de caja
  - Órdenes de cobro
  - Registro de pagos
  - Corte de caja
  - Facturación CFDI
  - Reportes de ingresos

---

## 📊 Datos de Prueba Incluidos

El sistema se inicializa con:

### Empresa
- **Nombre:** Clínica San Rafael
- **RFC:** CSR850101ABC
- **Dirección:** Av. Principal 123, CDMX

### Sede
- **Nombre:** Sede Principal
- **Horario:** Lunes a Viernes 8:00-20:00, Sábado 9:00-14:00

### Pacientes (5)
1. María García López (45 años) - EXP-001234
2. Juan Martínez Rodríguez (32 años) - EXP-001235
3. Ana Sánchez Pérez (28 años) - EXP-001236
4. Carlos Hernández Torres (55 años) - EXP-001237
5. Laura Ramírez Gómez (38 años) - EXP-001238

### Citas (5 citas del día de hoy)
- 09:00 - María García con Dr. Pérez (Completada)
- 09:30 - Juan Martínez con Dr. Pérez (Completada)
- 10:00 - Ana Sánchez con Dr. Pérez (En espera)
- 11:00 - Carlos Hernández con Dr. Pérez (Confirmada)
- 14:00 - Laura Ramírez con Dra. Martínez (Nueva)

### Consultorios (3)
- Consultorio 1
- Consultorio 2
- Sala de Procedimientos

---

## 🔄 Reiniciar Datos

Si quieres reiniciar todos los datos a su estado inicial:

```bash
# Detener servicios
docker-compose down

# Eliminar volúmenes (¡CUIDADO! Esto borra todo)
docker-compose down -v

# Iniciar de nuevo
docker-compose up -d

# Esperar 10 segundos
sleep 10

# Reinicializar base de datos
docker-compose exec backend bash init_db.sh
```

---

## 🎭 Flujo de Prueba Sugerido

### Como Médico:
1. Login como **dr.perez@clinica.com**
2. Ve al Dashboard - verás tus citas del día
3. Ve a Agenda - verás el timeline de hoy
4. Ve a Pacientes - explora los expedientes
5. Crea una nota clínica
6. Genera una receta

### Como Recepción:
1. Login como **recepcion@clinica.com**
2. Ve a Pacientes - busca y edita
3. Ve a Agenda - crea una cita nueva
4. Haz check-in de un paciente
5. Ve la sala de espera

### Como Administrador:
1. Login como **admin@clinica.com**
2. Accede a todos los módulos
3. Ve a Configuración
4. Revisa Reportes
5. Gestiona usuarios

---

## 🔐 Seguridad

⚠️ **IMPORTANTE:** Estos son usuarios de PRUEBA.

**En producción:**
- Cambia TODAS las contraseñas
- Elimina usuarios demo
- Configura contraseñas seguras (mínimo 12 caracteres)
- Habilita 2FA
- Usa HTTPS
- Configura firewall

---

## 🛠️ Crear Nuevos Usuarios

### Vía API:

```bash
curl -X POST http://localhost:8000/api/v1/usuarios/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "email": "nuevo@clinica.com",
    "username": "nuevousuario",
    "password": "password123",
    "nombre": "Nombre",
    "apellido_paterno": "Apellido",
    "empresa_id": 1
  }'
```

### Vía Interfaz:
1. Login como Admin
2. Ve a Configuración → Usuarios
3. Click en "Nuevo Usuario"
4. Completa el formulario
5. Asigna roles

---

## 📞 Soporte

¿Problemas con el login?

1. Verifica que el backend esté corriendo: `docker-compose ps`
2. Verifica que la BD esté inicializada: `docker-compose logs backend`
3. Reinicia los servicios: `docker-compose restart`
4. Revisa la consola del navegador (F12)

---

## 🎉 ¡Listo!

Ahora puedes explorar el sistema completo con usuarios reales y datos de prueba.

**Próximos pasos:**
- Explora todos los módulos
- Prueba crear/editar/eliminar
- Prueba diferentes roles
- Revisa los permisos por rol
- Personaliza según tu clínica

