# 🏗️ Arquitectura y Flujos de Sincronización

## 1. Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                     │
│                  (Frontend React - Vite)                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Pages (Vistas de Usuario)                          │   │
│  │  ├─ LoginPage (CU1, CU2)                            │   │
│  │  ├─ DashboardPage                                   │   │
│  │  ├─ UsuariosPage (CU3)                              │   │
│  │  ├─ RolesPage (CU4)                                 │   │
│  │  ├─ BarberosPage (CU5)                              │   │
│  │  ├─ BitacoraPage (CU6)                              │   │
│  │  └─ CuentaPage (CU7)                                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Componentes Reutilizables                          │   │
│  │  ├─ ProtectedRoute                                  │   │
│  │  └─ (Otros componentes)                             │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────▼────────────┐
        │  Context API            │
        │  (AuthContext)          │
        │  Estado de Sesión       │
        └────────┬────────────────┘
                 │
┌────────────────▼──────────────────────────────────────────┐
│            CAPA DE SERVICIOS / CLIENTE API                │
│           (apiClient.js - Axios Instance)                 │
│                                                            │
│  🔹 loginUsuario()          → POST /login/                │
│  🔹 logoutUsuario()         → POST /logout/               │
│  🔹 listarUsuarios()        → GET /usuarios/              │
│  🔹 crearUsuario()          → POST /usuarios/crear/       │
│  🔹 actualizarUsuario()     → PUT /usuarios/{id}/         │
│  🔹 eliminarUsuario()       → DELETE /usuarios/{id}/      │
│  🔹 listarRoles()           → GET /roles/                 │
│  🔹 crearRol()              → POST /roles/crear/          │
│  🔹 actualizarRol()         → PUT /roles/{id}/            │
│  🔹 eliminarRol()           → DELETE /roles/{id}/         │
│  🔹 listarBarberos()        → GET /barberos/              │
│  🔹 crearBarbero()          → POST /barberos/crear/       │
│  🔹 actualizarBarbero()     → PUT /barberos/{id}/         │
│  🔹 eliminarBarbero()       → DELETE /barberos/{id}/      │
│  🔹 consultarBitacora()     → GET /bitacora/?...          │
│  🔹 cambiarContrasena()     → POST /cambiar-contrasena/   │
│                                                            │
│  Manejo centralizado de:                                  │
│  - Configuración de base URL                              │
│  - Headers HTTP (Content-Type, etc.)                      │
│  - Cookies de sesión (withCredentials)                    │
│  - Interceptores de error                                 │
│  - Validación de autenticación                            │
└──────────────────┬─────────────────────────────────────────┘
                   │ HTTP + Cookies
                   │ CORS Habilitado
┌──────────────────▼─────────────────────────────────────────┐
│         CAPA DE APLICACIÓN / API REST                      │
│            (Backend Django - Port 8000)                    │
│                                                            │
│  Vistas (Views) en seguridad_y_personal/views.py          │
│  ├─ iniciar_sesion()      [CU1] → Validar credenciales   │
│  ├─ cerrar_sesion()       [CU2] → Limpiar sesión         │
│  ├─ listar_usuarios()     [CU3] → SELECT * FROM usuario  │
│  ├─ crear_usuario()       [CU3] → INSERT usuario+persona  │
│  ├─ detalle_usuario()     [CU3] → GET/PUT/DELETE usuario │
│  ├─ listar_roles()        [CU4] → SELECT * FROM rol      │
│  ├─ crear_rol()           [CU4] → INSERT rol             │
│  ├─ detalle_rol()         [CU4] → PUT/DELETE rol         │
│  ├─ listar_barberos()     [CU5] → SELECT FROM persona    │
│  ├─ crear_barbero()       [CU5] → INSERT persona         │
│  ├─ detalle_barbero()     [CU5] → GET/PUT/DELETE persona │
│  ├─ consultar_bitacora()  [CU6] → SELECT FROM bitacora   │
│  └─ cambiar_contrasena()  [CU7] → UPDATE password        │
│                                                            │
│  Funcionalidades Comunes:                                 │
│  - Encriptación de contraseñas (make_password)            │
│  - Validación de datos                                    │
│  - Transacciones ACID                                     │
│  - Registro automático en bitácora                        │
│  - Sesiones HTTP seguras                                  │
│  - Manejo de errores                                      │
└──────────────────┬─────────────────────────────────────────┘
                   │ SQL Queries
┌──────────────────▼─────────────────────────────────────────┐
│            CAPA DE DATOS                                   │
│         (PostgreSQL Database)                              │
│                                                            │
│  Tablas Principales:                                      │
│  📦 persona (Clientes, Barberos)                          │
│  👤 usuario (Credenciales de sistema)                     │
│  🔑 rol (Roles del sistema)                               │
│  🔗 usuario_rol (Relación M:N)                            │
│  📝 bitacora (Auditoría)                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Flujos de Datos por Caso de Uso

### CU1: Iniciar Sesión

```
┌─────────────────┐
│ Usuario ingresa │
│ usuario/pwd     │
└────────┬────────┘
         │
         ▼
    LoginPage.jsx
    ┌──────────────────────────────┐
    │ 1. Validar campos locales     │
    │ 2. Llamar loginUsuario()      │
    └──────────┬───────────────────┘
              │
              ▼
    apiClient.js
    ┌──────────────────────────────┐
    │ POST /api/seguridad/login/   │
    │ Body: {username, password}   │
    │ Headers: JSON                │
    └──────────┬───────────────────┘
              │
              ▼
    Backend Django (views.py)
    ┌────────────────────────────────┐
    │ 1. Buscar usuario en DB        │
    │ 2. Validar contraseña          │
    │ 3. Crear sesión HTTP           │
    │ 4. Registrar LOGIN en bitácora │
    │ 5. Retornar JSON con datos    │
    └──────────┬────────────────────┘
              │
              ▼
    Response: {
      success: true,
      usuario: {
        id: 1,
        username: "juan",
        nombre: "Juan Pérez"
      }
    }
    │
    ▼
    LoginPage.jsx
    ┌──────────────────────────────┐
    │ 1. Guardar en localStorage   │
    │ 2. login() de AuthContext    │
    │ 3. Redirigir a /dashboard    │
    └──────────────────────────────┘
```

**Sincronización:**
- ✅ Contraseña encriptada en BD
- ✅ Sesión HTTP con cookies
- ✅ Validaciones en cliente y servidor
- ✅ localStorage como respaldo

---

### CU3: Crear Usuario

```
┌─────────────────────────┐
│ Usuario llena formulario│
│ (usuario, password, etc)|
└────────┬────────────────┘
         │
         ▼
    UsuariosPage.jsx
    ┌──────────────────────────────────┐
    │ handleSubmit() en modal           │
    │ 1. Validar campos requeridos      │
    │ 2. Llamar crearUsuario()          │
    └──────────┬───────────────────────┘
              │
              ▼
    apiClient.js
    ┌──────────────────────────────────┐
    │ POST /usuarios/crear/             │
    │ Body: {                           │
    │   username, password,             │
    │   nombres, apellidos,             │
    │   correo, telefono, ci,           │
    │   direccion, roles: [1,2]         │
    │ }                                 │
    └──────────┬───────────────────────┘
              │
              ▼
    Backend Django
    ┌────────────────────────────────────────┐
    │ 1. Validar username es único           │
    │ 2. Crear Persona (INSERT)              │
    │ 3. Crear Usuario (INSERT)              │
    │    - Encriptar password con hash       │
    │    - Estado = True                     │
    │ 4. Asignar roles (INSERT UsuarioRol)   │
    │ 5. Registrar en Bitácora (CREATE)      │
    │    - usuario_id                        │
    │    - tabla_afectada: "usuario"         │
    │    - accion: "CREATE"                  │
    │    - descripcion: "Usuario creado..."  │
    │ 6. Transacción COMMIT (si todo OK)     │
    └──────────┬───────────────────────────┘
              │
              ▼
    Response: {
      success: true,
      usuario_id: 42
    }
    │
    ▼
    UsuariosPage.jsx
    ┌──────────────────────────────────┐
    │ 1. Cerrar modal                  │
    │ 2. Llamar cargarDatos() de nuevo │
    │ 3. Refrescar tabla con GET       │
    │ 4. Mostrar nuevo usuario         │
    └──────────────────────────────────┘
```

**Coordinación:**
- Frontend valida formato/campos requeridos
- Backend valida integridad de datos y reglas de negocio
- Base de datos asegura consistencia con constraints
- Bitácora registra automáticamente al crear

---

### CU6: Consultar Bitácora

```
┌──────────────────┐
│ Usuario hace click│
│ en "Bitácora"    │
└────────┬─────────┘
         │
         ▼
    BitacoraPage.jsx (cargaInicial)
    ┌──────────────────────────────────┐
    │ useState inicializa:              │
    │ - registros: []                  │
    │ - cargando: true                 │
    │ - filtros: {...}                 │
    └──────────┬───────────────────────┘
              │
              ▼
    useEffect → cargarBitacora()
    │
    ▼
    apiClient.js
    ┌──────────────────────────────────────────┐
    │ GET /bitacora/?                          │
    │   accion=...&tabla_afectada=...          │
    │   &fecha_inicio=...&fecha_fin=...        │
    └──────────┬───────────────────────────────┘
              │
              ▼
    Backend Django
    ┌──────────────────────────────────────────┐
    │ consultarBitacora(request)               │
    │ 1. Obtener parámetros de filtro          │
    │ 2. SELECT FROM bitacora                  │
    │ 3. Filtrar:                              │
    │    - WHERE usuario_id = ...              │
    │    - onde tabla_afectada LIKE ...        │
    │    - WHERE accion LIKE ...               │
    │    - WHERE fecha_hora >= ... AND <= ...  │
    │ 4. ORDER BY fecha_hora DESC              │
    │ 5. LIMIT y OFFSET (paginación)           │
    │ 6. Para cada registro, incluir:          │
    │    - usuario.nombres, usuario.apellidos │
    │    - usuario_roles relacionados          │
    │    - tipos de usuario (barbero/cliente)  │
    │ 7. Contar acciones por tipo              │
    │ 8. Retornar JSON completo                │
    └──────────┬───────────────────────────────┘
              │
              ▼
    Response: {
      success: true,
      bitacoras: [
        {
          id_bitacora: 1,
          usuario: {
            id: 1,
            username: "juan",
            nombre_completo: "Juan Pérez",
            tipos: ["Barbero"]
          },
          roles: ["Gerente"],
          accion: {
            tipo: "LOGIN",
            tabla_afectada: "usuario",
            descripcion: "Usuario juan inició sesión"
          },
          fecha_hora: "2026-04-13T14:30:00Z",
          fecha_hora_formato: "13/04/2026 14:30:00"
        }
      ],
      estadisticas: {
        total_registros: 150,
        acciones_por_tipo: [...]
      }
    }
    │
    ▼
    BitacoraPage.jsx
    ┌──────────────────────────────────────────┐
    │ 1. setState registros = response.bitacoras│
    │ 2. setState estadisticas = response.est. │
    │ 3. Renderizar tarjetas de registros      │
    │ 4. Mostrar estadísticas                  │
    │ 5. Permitir filtros para nueva búsqueda  │
    └──────────────────────────────────────────┘
```

**Sincronización:**
- Backend almacena cada acción de forma centralizada
- Frontend visualiza lo que el backend registra
- No hay diferencia entre lo que se ve y lo que está en BD

---

## 3. Validaciones Coordinadas

### Ejemplo: Crear Usuario

```
┌──────────────────────────────────────┐
│         FRONTEND (Cliente)           │
│                                      │
│ Validaciones de UX:                 │
│ ✓ Campo requerido no vacío           │
│ ✓ Email tiene @                      │
│ ✓ Contraseña >= 6 caracteres         │
│ ✓ Confirmar contraseña coincide      │
│                                      │
│ Si pasa → Envía al servidor          │
└────────────┬─────────────────────────┘
             │
             ▼ JSON HTTP POST
             │
┌────────────▼─────────────────────────┐
│       BACKEND (Servidor)             │
│                                      │
│ Validaciones de Negocio:             │
│ ✓ Username ÚNICO en BD               │
│ ✓ Email ÚNICO en BD                  │
│ ✓ Roles existen en BD                │
│ ✓ Integridad de datos                │
│ ✓ Constraints de BD                  │
│                                      │
│ Si pasa → INSERT en BD               │
│ Si falla → Retorna error             │
└────────────┬──────────────────────────┘
             │
             ▼ JSON Response
             │
┌────────────▼──────────────────────────┐
│       FRONTEND (Actualiza UI)        │
│                                      │
│ Si exitoso:                          │
│ - Cerrar modal                       │
│ - Refresco tabla                    │
│ - Mostrar nuevo usuario              │
│                                      │
│ Si error:                            │
│ - Mostrar mensaje de error           │
│ - Mantener modal abierto             │
└──────────────────────────────────────┘
```

---

## 4. Ciclo de Vida de una Operación CRUD

```
        ┌─────────────────┐
        │  1. El usuario  │
        │  hace una acción│
        └────────┬────────┘
                 │
    ┌────────────▼────────────┐
    │ 2. React captura evento │
    │    (onClick, submit)    │
    └────────────┬────────────┘
                 │
    ┌────────────▼────────────────┐
    │ 3. Validar en cliente      │
    │    ¿Es válido?             │
    └────┬─────────────┬──────────┘
         │ No          │ Sí
         ▼             │
    Mostrar error      │
         │             │
         ▼             ▼
    ┌────────────────────────────┐
    │ 4. Llamar función apiClient│
    │    (ejemplo: crearUsuario) │
    └────────────┬───────────────┘
                 │
    ┌────────────▼──────────────────┐
    │ 5. Axios hace HTTP request   │
    │    (POST /api/seguridad/...) │
    │    Con credenciales (cookies)│
    └────────────┬──────────────────┘
                 │
    ┌────────────▼──────────────────┐
    │ 6. Django recibe request     │
    │    Valida autenticación      │
    │    Procesa datos             │
    │    Ejecuta lógica            │
    │    Accede a BD               │
    │    Registra en bitácora      │
    │    Retorna JSON              │
    └────────────┬──────────────────┘
                 │
    ┌────────────▼──────────────────┐
    │ 7. Axios intercepta response │
    │    ¿É exitoso? ¿Error?       │
    └────┬─────────────┬────────────┘
         │ Error (401) │ Error (500) │ OK (200)
         ▼             ▼             ▼
    Limpiar   Mostrar error   Actualizar
    sesión    del servidor    estado React
    Ir a                      Refrescar tabla
    login                     Mostrar éxito
         │                    │
         └────────┬───────────┘
                  │
    ┌────────────▼──────────────────┐
    │ 8. React renderiza cambios   │
    │    (actualiza componentes)   │
    │    (actualiza HTML del DOM)  │
    └──────────────────────────────┘
```

---

## 5. Sesiones e Identificación

```
PRIMERA VEZ (Login):
1. Usuario envía credenciales
2. Backend valida y crea sesión
3. Backend retorna cookie de sesión
4. No vosotros guarda cookie automáticamente
5. localStorage también guarda datos

SIGUIENTES PETICIONES:
1. Cliente envía cualquier petición
2. Navegador incluye cookie automáticamente
3. Backend lee cookie y valida sesión
4. Si sesión es válida → Procesa
5. Si sesión expirada → 401 Unauthorized
6. Interceptor de axios detecta 401
7. Si 401 → Limpia localStorage
8. Si 401 → Redirige a /login

LOGOUT:
1. Usuario hace click en "Cerrar Sesión"
2. Cliente envía POST /logout
3. Backend invalida sesión
4. Cliente limpia localStorage
5. Cliente redirige a /login
```

---

## 6. Manejo de Errores

```
┌────────────────────────────────────┐
│      Error en Frontend             │
│                                    │
│ Validaciones fallidas              │
│ → Mostrar en campo del formulario   │
│ → No enviar al servidor            │
└────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│      Error en API Client           │
│                                    │
│ Conexión perdida                   │
│ Timeout                            │
│ → Mostrar "Error de conexión"      │
│ → Permitir reintentar              │
└────────────────────────────────────┘
         │
         ▼
┌────────────────────────────────────┐
│      Error en Backend              │
│                                    │
│ Datos duplicados                   │
│ Integridad violada                 │
│ Archivo no encontrado              │
│ → Retorna JSON con mensaje         │
│ → Status code 400/404/500 etc      │
│ → Frontend muestra mensaje al user │
└────────────────────────────────────┘
```

---

## 7. Matriz de Sincronización

| Operación | Frontend | Backend | BD | Bitácora |
|-----------|----------|---------|-----|----------|
| Login | Valida campos | Valida credenciales | Query usuario | Registra LOGIN |
| Logout | Limpia localStorage | Invalida sesión | - | Registra LOGOUT |
| Crear usuario | Modal validación | INSERT Persona+Usuario | Nuevo registro | CREATE |
| Editar usuario | Modal con datos | UPDATE usuario | Modificar | UPDATE |
| Eliminar usuario | Confirmación | UPDATE estado | estado=False | DELETE |
| Crear rol | Validar nombre | INSERT rol | Nuevo | CREATE |
| Editar rol | Validar nombre | UPDATE rol | Modificar | UPDATE |
| Listar bitácora | Mostrar filtros | SELECT con joins | Query | - |
| Cambiar contraseña | Validar formato | Hash new pwd | UPDATE password | CAMBIO |

---

## Conclusión

La arquitectura está diseñada para:

✅ **Separación de responsabilidades:**
- Frontend: UI y validaciones de UX
- Backend: Lógica de negocio y seguridad
- BD: Persistencia e integridad

✅ **Sincronización bidireccional:**
- Cambios en BD se reflejan en UI
- Cambios en UI se guardan en BD

✅ **Robustez:**
- Validaciones en múltiples capas
- Manejo de errores en cada punto
- Bitácora para auditoría

✅ **Mantenibilidad:**
- API centralizada (apiClient.js)
- Componentes reutilizables
- Código comentado y documentado
