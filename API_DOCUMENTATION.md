# Documentación de Casos de Uso - Seguridad y Personal
## Backend - Rutas de API y Funcionalidades

Esta documentación describe los 7 casos de uso implementados en la aplicación "seguridad_y_personal" de Django.

---

## CU1. INICIAR SESIÓN

**Endpoint:** `POST /api/seguridad/login/`

**Descripción:** Autentica un usuario con username y password. Crea una sesión y registra el login en la bitácora.

**Request (JSON):**
```json
{
  "username": "usuario_ejemplo",
  "password": "contraseña123"
}
```

**Response exitoso (200):**
```json
{
  "success": true,
  "mensaje": "Sesión iniciada correctamente",
  "usuario": {
    "id": 1,
    "username": "usuario_ejemplo",
    "nombre": "Juan Pérez"
  }
}
```

**Response fallido (401):**
```json
{
  "success": false,
  "mensaje": "Usuario o contraseña incorrectos"
}
```

---

## CU2. CERRAR SESIÓN

**Endpoint:** `GET/POST /api/seguridad/logout/`

**Descripción:** Cierra la sesión actual del usuario. Registra el logout en la bitácora y limpia los datos de sesión.

**Request:** No requiere parámetros

**Response exitoso (200):**
```json
{
  "success": true,
  "mensaje": "Sesión cerrada correctamente"
}
```

---

## CU3. GESTIONAR USUARIOS

### CU3.1 Listar usuarios

**Endpoint:** `GET /api/seguridad/usuarios/`

**Descripción:** Retorna la lista de todos los usuarios registrados en el sistema. Requiere sesión de administrador.

**Response exitoso (200):**
```json
{
  "success": true,
  "usuarios": [
    {
      "id_usuario": 1,
      "username": "admin",
      "nombre": "Juan Pérez López",
      "correo": "juan@example.com",
      "estado": true,
      "id_persona": 1
    }
  ],
  "total": 1
}
```

### CU3.2 Crear usuario

**Endpoint:** `POST /api/seguridad/usuarios/crear/`

**Descripción:** Crea un nuevo usuario con sus datos personales. Requiere sesión de administrador.

**Request (JSON):**
```json
{
  "username": "nuevo_usuario",
  "password": "Contraseña123",
  "nombres": "Carlos",
  "apellidos": "García López",
  "correo": "carlos@example.com",
  "telefono": "1234567890",
  "ci": "12345678",
  "direccion": "Calle Principal 123",
  "roles": [1, 2]
}
```

**Response exitoso (201):**
```json
{
  "success": true,
  "mensaje": "Usuario creado correctamente",
  "usuario_id": 2
}
```

### CU3.3 Obtener/Actualizar/Eliminar usuario

**Endpoint GET:** `GET /api/seguridad/usuarios/<usuario_id>/`

**Endpoint UPDATE:** `PUT /api/seguridad/usuarios/<usuario_id>/`

**Endpoint DELETE:** `DELETE /api/seguridad/usuarios/<usuario_id>/`

**GET Response (200):**
```json
{
  "success": true,
  "usuario": {
    "id_usuario": 1,
    "username": "admin",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "correo": "juan@example.com",
    "telefono": "+1234567890",
    "ci": "87654321",
    "direccion": "Calle Principal 100",
    "estado": true,
    "roles": ["Administrador", "Gerente"]
  }
}
```

**PUT Request (JSON):**
```json
{
  "nombres": "Juan Carlos",
  "apellidos": "Pérez García",
  "correo": "juancarlos@example.com",
  "estado": true,
  "roles": [1]
}
```

**DELETE Response (200):**
```json
{
  "success": true,
  "mensaje": "Usuario desactivado correctamente"
}
```

---

## CU4. GESTIONAR ROLES

### CU4.1 Listar roles

**Endpoint:** `GET /api/seguridad/roles/`

**Descripción:** Retorna lista de todos los roles disponibles en el sistema.

**Response exitoso (200):**
```json
{
  "success": true,
  "roles": [
    {
      "id_rol": 1,
      "nombre": "Administrador",
      "usuarios_asignados": 2
    },
    {
      "id_rol": 2,
      "nombre": "Barbero",
      "usuarios_asignados": 5
    }
  ],
  "total": 2
}
```

### CU4.2 Crear rol

**Endpoint:** `POST /api/seguridad/roles/crear/`

**Descripción:** Crea un nuevo rol en el sistema.

**Request (JSON):**
```json
{
  "nombre": "Supervisor"
}
```

**Response exitoso (201):**
```json
{
  "success": true,
  "mensaje": "Rol creado correctamente",
  "rol_id": 3
}
```

### CU4.3 Actualizar/Eliminar rol

**Endpoint PUT:** `PUT /api/seguridad/roles/<rol_id>/`

**Endpoint DELETE:** `DELETE /api/seguridad/roles/<rol_id>/`

**PUT Request (JSON):**
```json
{
  "nombre": "Super Administrador"
}
```

**PUT Response (200):**
```json
{
  "success": true,
  "mensaje": "Rol actualizado correctamente"
}
```

---

## CU5. GESTIONAR BARBEROS

### CU5.1 Listar barberos

**Endpoint:** `GET /api/seguridad/barberos/`

**Descripción:** Retorna lista de todos los barberos registrados.

**Response exitoso (200):**
```json
{
  "success": true,
  "barberos": [
    {
      "id_persona": 5,
      "nombres": "Miguel",
      "apellidos": "Rodríguez",
      "correo": "miguel@example.com",
      "telefono": "9876543210",
      "especialidad": "Corte Clásico",
      "calificacion_promedio": "4.50",
      "estado": true,
      "comision": 1
    }
  ],
  "total": 1
}
```

### CU5.2 Crear barbero

**Endpoint:** `POST /api/seguridad/barberos/crear/`

**Descripción:** Registra una nueva persona como barbero en el sistema.

**Request (JSON):**
```json
{
  "nombres": "Roberto",
  "apellidos": "Martínez",
  "correo": "roberto@example.com",
  "telefono": "5555555555",
  "ci": "98765432",
  "direccion": "Avenida Central 50",
  "especialidad": "Barba y Afeitado"
}
```

**Response exitoso (201):**
```json
{
  "success": true,
  "mensaje": "Barbero creado correctamente",
  "barbero_id": 6
}
```

### CU5.3 Obtener/Actualizar/Eliminar barbero

**Endpoint GET:** `GET /api/seguridad/barberos/<barbero_id>/`

**Endpoint UPDATE:** `PUT /api/seguridad/barberos/<barbero_id>/`

**Endpoint DELETE:** `DELETE /api/seguridad/barberos/<barbero_id>/`

**PUT Request (JSON):**
```json
{
  "especialidad": "Diseño de Cejas",
  "estado": true
}
```

---

## CU6. CONSULTAR BITÁCORA

**Endpoint:** `GET /api/seguridad/bitacora/`

**Descripción:** Retorna registros de la bitácora con filtros opcionales y paginación.

**Parámetros de Query:**
- `usuario_id`: Filtrar por ID de usuario
- `tabla_afectada`: Filtrar por tabla
- `accion`: Filtrar por acción (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, etc.)
- `fecha_inicio`: Filtrar desde una fecha (YYYY-MM-DD)
- `fecha_fin`: Filtrar hasta una fecha (YYYY-MM-DD)
- `pagina`: Número de página (default: 1)
- `limite`: Registros por página (default: 50)

**Ejemplo de request:**
```
GET /api/seguridad/bitacora/?usuario_id=1&accion=LOGIN&pagina=1&limite=20
```

**Response exitoso (200):**
```json
{
  "success": true,
  "bitacoras": [
    {
      "id_bitacora": 1,
      "usuario": "admin",
      "tabla_afectada": "usuario",
      "accion": "LOGIN",
      "descripcion": "Usuario admin inició sesión",
      "fecha_hora": "2026-04-12T10:30:45.123456Z"
    }
  ],
  "total": 150,
  "pagina": 1,
  "limite": 20,
  "paginas_totales": 8
}
```

---

## CU7. CAMBIAR CONTRASEÑA

**Endpoint:** `POST /api/seguridad/cambiar-contrasena/`

**Descripción:** Cambia la contraseña del usuario autenticado. Requiere contraseña actual correcta.

**Request (JSON):**
```json
{
  "contraseña_actual": "ContraseñaActual123",
  "contraseña_nueva": "NuevaContraseña456",
  "contraseña_nueva_confirmacion": "NuevaContraseña456"
}
```

**Response exitoso (200):**
```json
{
  "success": true,
  "mensaje": "Contraseña cambiada correctamente"
}
```

**Response fallido - Contraseña actual incorrecta (401):**
```json
{
  "success": false,
  "mensaje": "Contraseña actual incorrecta"
}
```

**Response fallido - Contraseñas no coinciden (400):**
```json
{
  "success": false,
  "mensaje": "Las contraseñas nuevas no coinciden"
}
```

---

## Características Transversales

### Autenticación y Autorización
- Las operaciones CRUD requieren que el usuario esté autenticado (sesión)
- Las operaciones sensibles require validación de administrador (`validar_sesion_admin()`)
- Se utilizan hash de contraseñas con `make_password()` de Django

### Registros en Bitácora
Todas las acciones se registran automáticamente:
- LOGIN / LOGOUT
- CREATE / UPDATE / DELETE de usuarios, roles y barberos
- INTENTO_FALLIDO, INTENTO_CAMBIO_CONTRASENA_FALLIDO
- CAMBIO_CONTRASENA

### Manejo de Errores
- Validación de campos requeridos
- Verificación de unicidad (username, correo)
- Excepciones capturadas y retornadas como JSON
- Códigos HTTP apropiados (200, 201, 400, 401, 403, 404, 500)

### Seguridad
- Pasword hashing seguro
- Validaciones de sesión
- CSRF protection en vistas POST
- Contraseña mínima de 6 caracteres

---

## Modelos Utilizados

- **Usuario**: Datos de autenticación con relación a Persona
- **Persona**: Información personal (pueden ser clientes, barberos o ambos)
- **Rol**: Definición de roles en el sistema
- **UsuarioRol**: Relación muchos-a-muchos entre Usuario y Rol
- **Bitácora**: Registro de auditoría de todas las acciones

---

## Rutas compiladas

```
POST   /api/seguridad/login/                    → Iniciar sesión
GET    /api/seguridad/logout/                   → Cerrar sesión
GET    /api/seguridad/usuarios/                 → Listar usuarios
POST   /api/seguridad/usuarios/crear/           → Crear usuario
GET    /api/seguridad/usuarios/<id>/            → Obtener usuario
PUT    /api/seguridad/usuarios/<id>/            → Actualizar usuario
DELETE /api/seguridad/usuarios/<id>/            → Eliminar usuario
GET    /api/seguridad/roles/                    → Listar roles
POST   /api/seguridad/roles/crear/              → Crear rol
PUT    /api/seguridad/roles/<id>/               → Actualizar rol
DELETE /api/seguridad/roles/<id>/               → Eliminar rol
GET    /api/seguridad/barberos/                 → Listar barberos
POST   /api/seguridad/barberos/crear/           → Crear barbero
GET    /api/seguridad/barberos/<id>/            → Obtener barbero
PUT    /api/seguridad/barberos/<id>/            → Actualizar barbero
DELETE /api/seguridad/barberos/<id>/            → Eliminar barbero
GET    /api/seguridad/bitacora/                 → Consultar bitácora
POST   /api/seguridad/cambiar-contrasena/       → Cambiar contraseña
```
