# 🗺️ MAPA DE CASOS DE USO - FRONTEND Y BACKEND

## Tabla Resumen

| CU | Nombre | Ubicación Backend | Ubicación Frontend | Estado |
|----|----|----|----|-----|
| **CU1** | Iniciar Sesión | `views.py:iniciar_sesion()` | `pages/seguridad_y_personal/Login.jsx` | ✅ |
| **CU2** | Cerrar Sesión | `views.py:cerrar_sesion()` | `components/Navbar.jsx` | ✅ |
| **CU3** | Gestionar Usuarios | `views.py:listar_usuarios/crear_usuario/detalle_usuario()` | `pages/seguridad_y_personal/Usuarios.jsx` | ⏳ Por crear |
| **CU4** | Gestionar Roles | `views.py:listar_roles/crear_rol/detalle_rol()` | `pages/seguridad_y_personal/Roles.jsx` | ⏳ Por crear |
| **CU5** | Gestionar Barberos | `views.py:listar_barberos/crear_barbero/detalle_barbero()` | `pages/seguridad_y_personal/Barberos.jsx` | ⏳ Por crear |
| **CU6** | Consultar Bitácora | `views.py:consultar_bitacora()` | `pages/seguridad_y_personal/Bitacora.jsx` | ⏳ Por crear |
| **CU7** | Cambiar Contraseña | `views.py:cambiar_contrasena()` | `pages/seguridad_y_personal/CambiarContrasena.jsx` | ⏳ Por crear |

---

## 📍 BACKEND - Ubicación de Funciones

### Django - Archivo: `seguridad_y_personal/views.py`

```
seguridad_y_personal/
└── views.py
    ├── home()                          # Página inicio
    ├── index()                         # Índice usuarios
    ├── crear_usuario()                 # Página crear usuario (deprecada)
    ├── registrar_bitacora()            # ⭐ Función auxiliar (registra todas las acciones)
    │
    ├── ========== CU1: INICIAR SESIÓN ==========
    ├── iniciar_sesion()                # POST/GET login
    │   └── Endpoints: POST /api/seguridad/login/
    │   └── Autentica usuario con username/password
    │   └── Crea sesión y registra LOGIN en bitácora
    │
    ├── ========== CU2: CERRAR SESIÓN ==========
    ├── cerrar_sesion()                 # GET/POST logout
    │   └── Endpoints: GET/POST /api/seguridad/logout/
    │   └── Limpia sesión y registra LOGOUT en bitácora
    │
    ├── ========== CU3: GESTIONAR USUARIOS ==========
    ├── validar_sesion_admin()          # Valida permisos
    ├── listar_usuarios()               # GET /api/seguridad/usuarios/
    ├── crear_usuario()                 # POST /api/seguridad/usuarios/crear/
    ├── detalle_usuario()               # GET/PUT/DELETE /api/seguridad/usuarios/<id>/
    │
    ├── ========== CU4: GESTIONAR ROLES ==========
    ├── listar_roles()                  # GET /api/seguridad/roles/
    ├── crear_rol()                     # POST /api/seguridad/roles/crear/
    ├── detalle_rol()                   # PUT/DELETE /api/seguridad/roles/<id>/
    │
    ├── ========== CU5: GESTIONAR BARBEROS ==========
    ├── listar_barberos()               # GET /api/seguridad/barberos/
    ├── crear_barbero()                 # POST /api/seguridad/barberos/crear/
    ├── detalle_barbero()               # GET/PUT/DELETE /api/seguridad/barberos/<id>/
    │
    ├── ========== CU6: CONSULTAR BITÁCORA ==========
    ├── consultar_bitacora()            # GET /api/seguridad/bitacora/
    │   └── Retorna tabla completa de auditoría
    │   └── Filtros: usuario, rol, tabla, acción, fechas
    │   └── Estadísticas automáticas
    │
    └── ========== CU7: CAMBIAR CONTRASEÑA ==========
        └── cambiar_contrasena()        # POST /api/seguridad/cambiar-contrasena/
            └── Verifica contraseña actual
            └── Actualiza en base de datos
            └── Registra cambio en bitácora
```

### Django - Archivo: `seguridad_y_personal/admin.py`

```
admin.py
├── PersonaAdmin         # Vista de personas en admin
├── UsuarioAdmin         # Vista de usuarios en admin
├── RolAdmin             # Vista de roles en admin
├── UsuarioRolAdmin      # Vista de asignación de roles
└── BitacoraAdmin        # Vista de bitácora (solo lectura)
```

---

## 🎨 FRONTEND - Estructura de Componentes y Páginas

### React - Carpeta: `frontend/src/`

```
src/
├── pages/
│   ├── Dashboard.jsx                                    # ⭐ Panel principal
│   │   ├── Estadísticas en tiempo real
│   │   ├── Últimas acciones
│   │   └── Accesos rápidos
│   │
│   └── seguridad_y_personal/
│       ├── Login.jsx                                   # ✅ CU1: INICIAR SESIÓN
│       │   ├── Formulario username/password
│       │   ├── Validación local y con backend
│       │   └── Almacenamiento de sesión
│       │
│       ├── Usuarios.jsx                                # ⏳ CU3: GESTIONAR USUARIOS
│       │   ├── Tabla de usuarios
│       │   ├── Formulario crear usuario
│       │   ├── Modal editar usuario
│       │   ├── Botón eliminar (desactivar)
│       │   └── Búsqueda y filtros
│       │
│       ├── Roles.jsx                                   # ⏳ CU4: GESTIONAR ROLES
│       │   ├── Tabla de roles
│       │   ├── Formulario crear rol
│       │   ├── Modal editar rol
│       │   ├── Botón eliminar rol
│       │   └── Mostrar usuarios asignados
│       │
│       ├── Barberos.jsx                                # ⏳ CU5: GESTIONAR BARBEROS
│       │   ├── Tabla de barberos
│       │   ├── Formulario crear barbero
│       │   ├── Modal editar barbero
│       │   ├── Botón desactivar
│       │   ├── Ver calificación
│       │   └── Filtros por especialidad
│       │
│       ├── Bitacora.jsx                                # ⏳ CU6: CONSULTAR BITÁCORA
│       │   ├── Tabla de auditoría
│       │   ├── Filtros avanzados:
│       │   │   ├── Por usuario
│       │   │   ├── Por rol
│       │   │   ├── Por acción
│       │   │   └── Por rango de fechas
│       │   ├── Paginación
│       │   ├── Detalles de cada acción
│       │   └── Estadísticas
│       │
│       └── CambiarContrasena.jsx                      # ⏳ CU7: CAMBIAR CONTRASEÑA
│           ├── Validar contraseña actual
│           ├── Campos nueva contraseña
│           ├── Confirmación de contraseña
│           └── Validaciones de seguridad
│
├── components/
│   ├── Navbar.jsx                                      # ✅ CU2: CERRAR SESIÓN
│   │   ├── Botón logout
│   │   ├── Información usuario
│   │   └── Reloj en tiempo real
│   │
│   ├── Sidebar.jsx                                     # 🗂️ Navegación principal
│   │   ├── Menú principal
│   │   ├── Menús desplegables
│   │   └── Accesos rápidos a CUs
│   │
│   └── seguridad_y_personal/
│       ├── UsuarioForm.jsx                             # Formulario reutilizable
│       ├── RolForm.jsx                                 # Formulario reutilizable
│       ├── BarberoForm.jsx                             # Formulario reutilizable
│       ├── BitacoraTable.jsx                           # Tabla reutilizable
│       └── FilterPanel.jsx                             # Panel de filtros
│
├── services/
│   └── apiService.js                                   # 🔌 Llamadas HTTP
│       ├── loginUser()              ← CU1
│       ├── logoutUser()             ← CU2
│       ├── listarUsuarios()         ← CU3
│       ├── crearUsuario()           ← CU3
│       ├── actualizarUsuario()      ← CU3
│       ├── eliminarUsuario()        ← CU3
│       ├── listarRoles()            ← CU4
│       ├── crearRol()               ← CU4
│       ├── actualizarRol()          ← CU4
│       ├── eliminarRol()            ← CU4
│       ├── listarBarberos()         ← CU5
│       ├── crearBarbero()           ← CU5
│       ├── actualizarBarbero()      ← CU5
│       ├── eliminarBarbero()        ← CU5
│       ├── consultarBitacora()      ← CU6
│       └── cambiarContrasena()      ← CU7
│
├── context/
│   └── AuthContext.jsx                                 # 🔐 Contexto de autenticación
│       └── Mantiene estado de usuario
│
└── styles/
    └── index.css                                       # 🎨 Estilos Tailwind
        ├── Variables de color
        ├── Componentes personalizados
        └── Animaciones
```

---

## 🔀 Flujo de Datos

### Ejemplo CU1: Login

```
Frontend                          Backend                        Base Datos
═════════════════════════════════════════════════════════════════════════════

Usuario ingresa datos
    ↓
Login.jsx captura formulario
    ↓
apiService.loginUser()
    ↓
POST /api/seguridad/login/ ─────→ iniciar_sesion() ─────→ Usuario.objects.get()
                                     ↓
                                Valida contraseña
                                     ↓
                                registrar_bitacora() ───→ Inserta en Bitacora
                                     ↓
respuesta JSON ←────────────────────┘
    ↓
AuthContext.setUser()
    ↓
localStorage.setItem()
    ↓
navigate('/dashboard')
```

---

## 📡 API REST Endpoints

### Rutas Configuradas - `frontend/vite.config.js`

```javascript
proxy: {
  '/api': {
    target: 'http://127.0.0.1:8000',
    changeOrigin: true,
  }
}
```

### URL Base
```
http://127.0.0.1:8000/api/seguridad/
```

### Endpoints por CU

| CU | Método | Endpoint | Función |
|----|--------|----------|---------|
| **CU1** | POST | `/login/` | Autenticar usuario |
| **CU2** | GET | `/logout/` | Cerrar sesión |
| **CU3** | GET | `/usuarios/` | Listar usuarios |
| **CU3** | POST | `/usuarios/crear/` | Crear usuario |
| **CU3** | GET | `/usuarios/<id>/` | Obtener detalles |
| **CU3** | PUT | `/usuarios/<id>/` | Actualizar usuario |
| **CU3** | DELETE | `/usuarios/<id>/` | Eliminar usuario |
| **CU4** | GET | `/roles/` | Listar roles |
| **CU4** | POST | `/roles/crear/` | Crear rol |
| **CU4** | PUT | `/roles/<id>/` | Actualizar rol |
| **CU4** | DELETE | `/roles/<id>/` | Eliminar rol |
| **CU5** | GET | `/barberos/` | Listar barberos |
| **CU5** | POST | `/barberos/crear/` | Crear barbero |
| **CU5** | GET | `/barberos/<id>/` | Obtener barbero |
| **CU5** | PUT | `/barberos/<id>/` | Actualizar barbero |
| **CU5** | DELETE | `/barberos/<id>/` | Eliminar barbero |
| **CU6** | GET | `/bitacora/` | Consultar bitácora |
| **CU7** | POST | `/cambiar-contrasena/` | Cambiar contraseña |

---

## ✅ Checklist de Implementación

### Backend ✅
- [x] CU1: Login completamente funcional
- [x] CU2: Logout completamente funcional
- [x] CU3: CRUD de usuarios implementado
- [x] CU4: CRUD de roles implementado
- [x] CU5: CRUD de barberos implementado
- [x] CU6: Bitácora con filtros implementada
- [x] CU7: Cambiar contraseña implementado
- [x] Admin de Django configurado

### Frontend ✅
- [x] Estructura del proyecto creada
- [x] Estilos y diseño aplicados
- [x] CU1: Login completamente funcional
- [x] CU2: Logout en navbar
- [x] Dashboard básico
- [ ] CU3: Gestionar usuarios (próxima tarea)
- [ ] CU4: Gestionar roles (próxima tarea)
- [ ] CU5: Gestionar barberos (próxima tarea)
- [ ] CU6: Consultar bitácora (próxima tarea)
- [ ] CU7: Cambiar contraseña (próxima tarea)

---

## 🚀 Comandos Rápidos

### Terminal 1: Backend
```bash
cd "d:\SEM7-1-2026\SI1 2026-2\barberia_B_R"
python manage.py runserver
```

### Terminal 2: Frontend
```bash
cd "d:\SEM7-1-2026\SI1 2026-2\barberia_B_R\frontend"
npm install
npm run dev
```

### Accesos
- **Frontend**: http://localhost:3000
- **Backend API**: http://127.0.0.1:8000/api/seguridad/
- **Admin Django**: http://127.0.0.1:8000/admin/

---

## 📚 Archivos Importantes

| Archivo | Propósito |
|---------|-----------|
| `backend/seguridad_y_personal/views.py` | Lógica de casos de uso |
| `backend/seguridad_y_personal/models.py` | Modelos de datos |
| `backend/seguridad_y_personal/admin.py` | Panel de administración |
| `frontend/src/App.jsx` | Enrutamiento principal |
| `frontend/src/services/apiService.js` | Cliente HTTP |
| `frontend/src/pages/Dashboard.jsx` | Panel principal |
| `frontend/src/pages/seguridad_y_personal/Login.jsx` | Autenticación |

---

**Última actualización**: 12 de abril de 2026
