# 🚀 Guía Rápida de Inicio

## Paso 1: Arrancar el Backend

Abre una **terminal PowerShell** en la raíz del proyecto:

```powershell
# 1. Navegar al proyecto
cd "d:\SEM7-1-2026\SI1 2026-2\barberia_B_R"

# 2. Activar ambiente virtual
.\env\Scripts\Activate.ps1

# 3. Ejecutar servidor Django
python manage.py runserver
```

Deberías ver:
```
Starting development server at http://127.0.0.1:8000/
```

✅ **El backend estará en:** `http://localhost:8000`

---

## Paso 2: Arrancar el Frontend

Abre **otra terminal PowerShell** y ejecuta:

```powershell
# 1. Navegar a la carpeta frontend
cd "d:\SEM7-1-2026\SI1 2026-2\barberia_B_R\frontend"

# 2. Ejecutar servidor de desarrollo
npm run dev
```

Deberías ver:
```
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ **El frontend estará en:** `http://localhost:5173`

---

## Paso 3: Acceder a la Aplicación

🌐 **Abre en tu navegador:**
```
http://localhost:5173
```

Serás redirigido automáticamente a la **página de login**.

---

## Paso 4: Credenciales de Prueba

**Necesitas un usuario en la base de datos PostgreSQL**

Si no tienes usuarios creados previamente, puedes crear uno desde Django Shell:

```powershell
# En la terminal del backend (con ambiente activado)
python manage.py shell

# Dentro de Python shell:
from seguridad_y_personal.models import Persona, Usuario
from django.contrib.auth.hashers import make_password

# Crear una persona
persona = Persona.objects.create(
    nombres="Juan",
    apellidos="Pérez",
    correo="juan@example.com"
)

# Crear usuario
usuario = Usuario.objects.create(
    persona=persona,
    username="juan",
    password=make_password("123456"),
    estado=True
)

exit()
```

**Credenciales:**
```
Usuario: juan
Contraseña: 123456
```

---

## Paso 5: Navegar por la Aplicación

Después de iniciar sesión, verás el **Dashboard** con acceso a:

1. **👥 Gestionar Usuarios**
   - Ver lista de usuarios
   - Crear nuevos usuarios
   - Editar información
   - Desactivar usuarios

2. **🛡️ Gestionar Roles**
   - Ver roles del sistema
   - Crear nuevos roles
   - Editar roles
   - Eliminar roles

3. **✂️ Gestionar Barberos**
   - Ver lista de barberos
   - Crear nuevos barberos
   - Ver especialidad y calificación
   - Editar información

4. **📋 Consultar Bitácora**
   - Ver historial completo de acciones
   - Filtrar por tipo, fecha, tabla
   - Ver quién hizo qué y cuándo

5. **⚙️ Mi Cuenta**
   - Ver información del perfil
   - Cambiar contraseña


---

## Pruebas Rápidas

### Test 1: Crear un Usuario
```
1. Click en "Gestionar Usuarios"
2. Click en "Nuevo Usuario"
3. Llenar:
   - Usuario: "carlos"
   - Contraseña: "123456"
   - Nombres: "Carlos"
   - Apellidos: "López"
   - Email: "carlos@example.com"
4. Click en "Crear Usuario"
✓ El usuario aparecerá en la tabla
```

### Test 2: Crear un Rol
```
1. Click en "Gestionar Roles"
2. Click en "Nuevo Rol"
3. Nombre: "Gerente"
4. Click en "Crear Rol"
✓ El rol aparecerá en la tabla
```

### Test 3: Crear un Barbero
```
1. Click en "Gestionar Barberos"
2. Click en "Nuevo Barbero"
3. Llenar:
   - Nombres: "Roberto"
   - Apellidos: "García"
   - Especialidad: "Cortes modernos"
   - Teléfono: "123-456-7890"
4. Click en "Crear Barbero"
✓ El barbero aparecerá en la tabla
```

### Test 4: Consultar Bitácora
```
1. Click en "Consultar Bitácora"
2. Verá registro de:
   - Login del usuario actual
   - Creación de usuario
   - Creación de rol
   - Creación de barbero
✓ Cada acción está registrada con usuario, fecha y hora
```

### Test 5: Cambiar Contraseña
```
1. Click en "Mi Cuenta"
2. Ingresar contraseña actual: "123456"
3. Nueva contraseña: "654321"
4. Confirmar: "654321"
5. Click en "Cambiar Contraseña"
✓ El mensaje de éxito aparecerá
✓ La nueva contraseña ya funciona en el login
```

---

## 📦 Problemas Comunes

### ❌ "Conexión rechazada" en backend
**Solución:**
- Asegurar que Django se ejecute en otra terminal
- Ver que el servidor esté en `http://127.0.0.1:8000/`
- Revisar que PostgreSQL esté corriendo

### ❌ "No se conecta al backend" en frontend
**Solución:**
- Verificar que el backend esté en puerto 8000
- Inspeccionar la consola del navegador (F12) para ver errores de API
- Verificar CORS necesario

### ❌ "ValueError: invalid literal for int()"
**Solución:**
- La base de datos PostgreSQL debe estar configurada
- Revisar credenciales en `settings.py`

### ❌ "npm: comando no encontrado"
**Solución:**
- Instalar Node.js desde https://nodejs.org/
- Reiniciar la terminal después de instalar

---

## 📊 Arquitectura Resumida

```
                    Tu Navegador
                         │
                         │ http://localhost:5173
                         ▼
                  ┌─────────────────┐
                  │  Frontend React │
                  │   (Vite)        │
                  │  5173 port      │
                  └────────┬────────┘
                           │
                   API REST (JSON)
                           │
                  ┌────────▼────────┐
                  │ Backend Django  │
                  │   8000 port     │
                  └────────┬────────┘
                           │
                  ┌────────▼────────┐
                  │  PostgreSQL DB  │
                  │  Barberia_B     │
                  └─────────────────┘
```

---

## 🔑 Operaciones Principales

| Acción | Ruta | HTTP | Sincronización |
|--------|------|------|-----------------|
| Login | `/api/seguridad/login/` | POST | Sesión HTTP + localStorage |
| Logout | `/api/seguridad/logout/` | POST | Limpia sesión |
| Listar Usuarios | `/api/seguridad/usuarios/` | GET | GET en apiClient.js |
| Crear Usuario | `/api/seguridad/usuarios/crear/` | POST | Nuevo + Persona |
| Editar Usuario | `/api/seguridad/usuarios/{id}/` | PUT | Actualiza Persona |
| Eliminar Usuario | `/api/seguridad/usuarios/{id}/` | DELETE | Desactiva (estado=False) |
| Ver Bitácora | `/api/seguridad/bitacora/` | GET | Con filtros |
| Cambiar Contraseña | `/api/seguridad/cambiar-contrasena/` | POST | Encriptada en backend |

---

## 📞 Soporte

Si algo no funciona:
1. Abre **F12** en el navegador
2. Ve a la pestaña **Console** o **Network**
3. Revisa los errores
4. Verifica que ambos servidores estén corriendo
5. Limpia cache del navegador (Ctrl+Shift+Supr)

---

## ✅ Checklist de Inicio

- [ ] Backend Django corriendo en `http://localhost:8000`
- [ ] Frontend React corriendo en `http://localhost:5173`
- [ ] PostgreSQL corriendo
- [ ] Usuario creado en la base de datos (o usando shell)
- [ ] Navegar a `http://localhost:5173`
- [ ] Iniciar sesión con credenciales
- [ ] Ver Dashboard
- [ ] Probar crear usuario/rol/barbero
- [ ] Consultar bitácora
- [ ] Cambiar contraseña

---

**¡Todo listo! 🎉 Tu aplicación está funciona completa.** 

Ahora puedes explorar todas las funcionalidades del sistema de gestión de barbería.
