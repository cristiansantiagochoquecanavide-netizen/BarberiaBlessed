"""
DOCUMENTACIÓN DE CASOS DE USO - FRONTEND
=========================================

Sistema de Gestión de Barbería B&R
Implementación Frontend en React con Vite

SINCRONIZACIÓN BACKEND-FRONTEND
===============================

El frontend está completamente sincronizado con el backend Django.
Cada caso de uso implementado en Django tiene su correspondiente
implementación en React que se comunica vía API REST.

ESTRUCTURA DEL PROYECTO FRONTEND
================================

/src
├── api/                    # Cliente API para comunicación con backend
│   └── apiClient.js       # (IMPORTANTE) Centraliza todas las llamadas API
├── pages/                 # Páginas/vistas de la aplicación
│   ├── LoginPage.jsx      # CU1: Iniciar sesión
│   ├── DashboardPage.jsx  # Página principal
│   ├── UsuariosPage.jsx   # CU3: Gestionar usuarios
│   ├── RolesPage.jsx      # CU4: Gestionar roles
│   ├── BarberosPage.jsx   # CU5: Gestionar barberos
│   ├── BitacoraPage.jsx   # CU6: Consultar bitácora
│   └── CuentaPage.jsx     # CU7: Cambiar contraseña
├── components/            # Componentes reutilizables
│   └── ProtectedRoute.jsx # Protección de rutas por autenticación
├── contexts/              # Context API para estado global
│   └── AuthContext.jsx    # Contexto de autenticación
├── hooks/                 # Hooks personalizados
│   └── useAuth.js         # Hook para acceder al contexto de auth
├── styles/                # Estilos css de cada sección
│   ├── auth.css           # Estilos de login
│   ├── dashboard.css      # Estilos del dashboard
│   ├── crud.css           # Estilos compartidos de CRUD
│   ├── bitacora.css       # Estilos de bitácora
│   └── cuenta.css         # Estilos de mi cuenta
└── App.jsx                # Router principal

===========================================================================
CASOS DE USO IMPLEMENTADOS
===========================================================================

CU1. INICIAR SESIÓN
====================
Archivo: /src/pages/LoginPage.jsx
API: POST /api/seguridad/login/

Descripción:
• Permite a los usuarios autenticarse en el sistema
• Valida usuario y contraseña contra la base de datos
• Crea sesión HTTP segura

Sincronización con Backend:
✓ loginUsuario() en apiClient.js envía credenciales
✓ Guarda información del usuario en localStorage
✓ Redirige a dashboard si es exitoso
✓ Muestra errores si falla la autenticación

Flujo:
1. Usuario ingresa usuario y contraseña
2. Se valida que los campos no estén vacíos
3. Se llama loginUsuario() del apiClient
4. Si es exitoso, se guarda sesión en localStorage
5. Se redirige al dashboard
6. Si falla, se muestra mensaje de error

Comentarios de Coherencia:
- La contraseña se encripta en el backend con make_password()
- Se verifica con check_password() en el backend
- La sesión se mantiene a través de cookies HTTP


CU2. CERRAR SESIÓN
===================
Descripción:
• Cierra la sesión del usuario actual
• Limpia datos de sesión local

Sincronización con Backend:
✓ logoutUsuario() en apiClient.js
✓ POST /api/seguridad/logout/
✓ Limpia localStorage

Ubicación en UI:
- Botón "Cerrar Sesión" en la barra lateral del dashboard
- Se ejecuta al hacer click en logoutUsuario()


CU3. GESTIONAR USUARIOS
=======================
Archivo: /src/pages/UsuariosPage.jsx
APIs:
  - GET /api/seguridad/usuarios/
  - POST /api/seguridad/usuarios/crear/
  - GET /api/seguridad/usuarios/{id}/
  - PUT /api/seguridad/usuarios/{id}/
  - DELETE /api/seguridad/usuarios/{id}/

Funcionalidades Implementadas:

3.1 Listar Usuarios
Función: listarUsuarios()
Muestra tabla con:
- Username (usuario único)
- Nombre completo
- Email
- Estado (Activo/Inactivo)
- Botones de editar y eliminar

3.2 Crear Usuario
Modal con campos:
- Username * (requerido, único)
- Contraseña * (requerido, mínimo 6 caracteres)
- Nombres * (requerido)
- Apellidos * (requerido)
- Email (validación de email)
- Teléfono
- Cédula de Identidad
- Dirección
- Roles (multi-select)

Validaciones:
✓ Username debe ser único (verificado en backend)
✓ Contraseña mínimo 6 caracteres
✓ Campos requeridos no pueden estar vacíos
✓ Email válido (si se proporciona)

3.3 Editar Usuario
Modal similar a crear, pero:
- Username deshabilitado (no se puede cambiar)
- Contraseña opcional (si está vacía, no se cambia)
- Permite actualizar roles

3.4 Eliminar Usuario
Desactiva el usuario (estado = False)
Confirmación antes de eliminar

Sincronización con Backend:
✓ Crea persona + usuario en una transacción
✓ Asigna roles automáticamente
✓ Registra acciones en bitácora
✓ Validaciones consistentes en ambos lados

Comentarios de Coherencia:
- La tabla Persona y Usuario están relacionadas
- Un usuario siempre tiene una persona asociada
- Los roles se asignan a través de tabla UsuarioRol
- Las acciones se registran en bitácora automáticamente


CU4. GESTIONAR ROLES
====================
Archivo: /src/pages/RolesPage.jsx
APIs:
  - GET /api/seguridad/roles/
  - POST /api/seguridad/roles/crear/
  - PUT /api/seguridad/roles/{id}/
  - DELETE /api/seguridad/roles/{id}/

Funcionalidades:

4.1 Listar Roles
Tabla con:
- Nombre del rol
- Cantidad de usuarios asignados
- Botones de editar y eliminar

4.2 Crear Rol
Modal simple con:
- Nombre del rol * (requerido, único)

4.3 Editar Rol
Permite cambiar el nombre del rol

4.4 Eliminar Rol
Elimina el rol de la base de datos
Nota: Puede tener restricción de FK si hay usuarios asignados

Sincronización con Backend:
✓ crearRol() en apiClient.js
✓ actualizarRol() en apiClient.js
✓ eliminarRol() en apiClient.js
✓ Todas las acciones se registran en bitácora

Comentarios de Coherencia:
- Los roles son independientes de usuarios
- Se asignan a usuarios a través de UsuarioRol
- Cada rol tiene un nombre único


CU5. GESTIONAR BARBEROS
=======================
Archivo: /src/pages/BarberosPage.jsx
APIs:
  - GET /api/seguridad/barberos/
  - POST /api/seguridad/barberos/crear/
  - GET /api/seguridad/barberos/{id}/
  - PUT /api/seguridad/barberos/{id}/
  - DELETE /api/seguridad/barberos/{id}/

Descripción:
Los barberos son personas con atributo es_barbero = True
Se almacenan en la tabla Persona, no en una tabla separada

Funcionalidades:

5.1 Listar Barberos
Tabla con:
- Nombre completo
- Especialidad (ej: Cortes tradicionales)
- Calificación promedio (con estrellas visuales)
- Teléfono
- Estado (Activo/Inactivo)
- Botones de editar y eliminar

5.2 Crear Barbero
Modal con:
- Nombres * (requerido)
- Apellidos * (requerido)
- Especialidad (ej: Cortes, Afeitados, etc.)
- Teléfono
- Email
- Cédula de Identidad
- Dirección

5.3 Editar Barbero
Permite actualizar cualquier campo del barbero

5.4 Desactivar Barbero
Cambia estado_barbero a False

Sincronización con Backend:
✓ Crea o actualiza registro de Persona con es_barbero = True
✓ Calificación promedio se actualiza desde otras funciones
✓ Las acciones se registran en bitácora
✓ Se puede filtrar por es_barbero = True en el backend

Comentarios de Coherencia:
- Los barberos son un tipo de Persona
- Tienen campos especiales: especialidad, calificacion_promedio, comision
- La calificación se actualiza desde el módulo de ventas
- Pueden no tener usuario asociado (no necesariamente users del sistema)


CU6. CONSULTAR BITÁCORA
=======================
Archivo: /src/pages/BitacoraPage.jsx
API: GET /api/seguridad/bitacora/

Descripción:
Vista de auditoría completa del sistema
Registra TODAS las acciones realizadas

Información Mostrada:
- ID de bitácora
- Usuario que realiza la acción
- Rol(es) del usuario
- Tipo de acción (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, etc.)
- Tabla afectada (usuario, persona, rol)
- Descripción detallada de la acción
- Fecha y hora exacta

Filtros Disponibles:
✓ Por tipo de acción (LOGIN, CREATE, UPDATE, DELETE, etc.)
✓ Por tabla afectada (usuario, persona, rol)
✓ Por rango de fechas (desde - hasta)
✓ Por usuario (opcional en futuro)

Estadísticas Mostradas:
✓ Total de registros
✓ Página actual
✓ Acciones principales (top 3)

Sincronización con Backend:
✓ consultarBitacora() en apiClient.js
✓ Soporta paginación (pagina, limite)
✓ Filtrado en el backend
✓ Incluye información relacional (usuario, roles)

Comentarios de Coherencia:
- Cada operación CREATE, UPDATE, DELETE registra automáticamente
- Los logins y logouts también se registran
- Los intentos fallidos de login se registran como INTENTO_FALLIDO
- La bitácora es solo lectura (no se puede eliminar registros)
- Los registros incluyen la zona horaria UTC


CU7. CAMBIAR CONTRASEÑA
=======================
Archivo: /src/pages/CuentaPage.jsx
API: POST /api/seguridad/cambiar-contrasena/

Descripción:
Permite al usuario autenticado cambiar su contraseña

Campos del Formulario:
- Contraseña Actual * (requerido) - se verifica contra la actual
- Contraseña Nueva * (requerido) - mínimo 6 caracteres
- Confirmar Contraseña * (requerido) - debe coincidir con nueva

Validaciones en Frontend:
✓ Todos los campos requeridos
✓ Contraseña nueva mínimo 6 caracteres
✓ Contraseña nueva y confirmación deben coincidir

Validaciones en Backend:
✓ Verifica que la contraseña actual sea correcta
✓ Encripta la nueva contraseña con make_password()
✓ Registra la acción en bitácora como CAMBIO_CONTRASENA

Información del Perfil Mostrada:
- Avatar con inicial del nombre
- Nombre completo
- Username
- ID del usuario
- Hora actual de sesión

Sincronización con Backend:
✓ cambiarContrasena() en apiClient.js
✓ POST /api/seguridad/cambiar-contrasena/
✓ Requiere campos: contraseña_actual, contraseña_nueva, contraseña_nueva_confirmacion
✓ Registra en bitácora

Comentarios de Coherencia:
- Solo el usuario autenticado puede cambiar su propia contraseña
- La contraseña se envía en plano por HTTP (HTTPS en producción)
- Se valida tanto en cliente como en servidor
- El registro en bitácora indica quién cambió la contraseña y cuándo


===========================================================================
COMENTARIOS GENERALES DE SINCRONIZACIÓN
===========================================================================

1. VALIDACIONES CONSISTENTES
   - Frontend: Validaciones de UX (campos requeridos, formatos)
   - Backend: Validaciones de negocio (unicidad, integridad)

2. ERRORES Y MANEJO
   - Los errores del backend se muestran en el frontend
   - Los errores de conexión se manejan gracefully
   - Los intentos de acceso no autorizado redirigen al login

3. SESIONES
   - Autenticación basada en cookies HTTP
   - localStorage se usa para almacenar datos de usuario
   - La sesión se valida en cada llamada API

4. BITÁCORA
   - Todas las operaciones CRUD se registran automáticamente
   - Incluyendo logins, logouts, intentos fallidos
   - Los registros incluyen usuario, tabla, acción y descripción

5. RELACIONES DE DATOS
   - Persona: Base de datos de personas (clientes, barberos)
   - Usuario: Credenciales de acceso al sistema
   - Rol: Roles del sistema
   - UsuarioRol: Relación muchos-a-muchos entre usuario y rol
   - Bitácora: Auditoría de todas las acciones

6. SEGURIDAD
   - Las contraseñas se procesan con hash (bcrypt en Django)
   - Las sesiones están protegidas por CSRF token
   - CORS permite comunicación segura entre frontend y backend
   - Los datos sensibles no se guardan en localStorage

===========================================================================
CÓMO EJECUTAR
===========================================================================

Backend (Django):
1. Activar ambiente virtual: env\\Scripts\\Activate.ps1
2. Ejecutar servidor: python manage.py runserver
3. El servidor estará en: http://localhost:8000

Frontend (React):
1. Navegar a carpeta frontend: cd frontend
2. Instalar dependencias: npm install --legacy-peer-deps
3. Ejecutar servidor Vite: npm run dev
4. La aplicación estará en: http://localhost:5173

La comunicación entre ambos será automática a través de:
- API Base URL: http://localhost:8000/api/seguridad
- Cookies de sesión HTTP

===========================================================================
"""
