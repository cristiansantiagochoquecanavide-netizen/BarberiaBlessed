# 🚀 Próximos Pasos - Blessed Barber Lounge

**Tu proyecto está listo para usar. Aquí está el plan paso a paso.**

---

## ✅ Lo que YA está hecho

### Backend (100% completado) ✅
- [x] 7 casos de uso implementados en views.py
- [x] Base de datos PostgreSQL con 5 modelos
- [x] 18 endpoints API con validación completa
- [x] Bitácora de auditoría automática
- [x] Panel admin Django configurado
- [x] Hash de contraseñas seguro
- [x] Sesiones de usuario autenticadas

### Frontend (30% completado) 
- [x] Estructura React profesional
- [x] Vite como bundler
- [x] Tailwind CSS configurado
- [x] CU1: Login funcional
- [x] CU2: Logout en Navbar
- [x] Dashboard con estadísticas
- [x] Servicios HTTP (apiService.js)
- [x] Contexto de autenticación
- [ ] CU3-CU7: Páginas sin código aún

---

## 👉 QUÉ HACER AHORA (Paso a Paso)

### PASO 1: Verifica que Node.js está instalado
**Tiempo**: 5 minutos (o 20 si necesitas instalar)

```bash
node --version
npm --version
```

Si ves versiones: ✅ Listo  
Si ves error: Sigue [frontend/INSTALAR_NODE.md](frontend/INSTALAR_NODE.md)

---

### PASO 2: Instala dependencias del frontend
**Tiempo**: 3-5 minutos

```bash
cd "d:\SEM7-1-2026\SI1 2026-2\barberia_B_R\frontend"
npm install
```

Espera a que termine (verás muchas líneas de instalación)

---

### PASO 3: Inicia el servidor Django
**En una terminal NUEVA:**

```bash
cd "d:\SEM7-1-2026\SI1 2026-2\barberia_B_R"
python manage.py runserver
```

Deberías ver:
```
Starting development server at http://127.0.0.1:8000/
```

⏸️ Deja esta terminal abierta (no la cierres)

---

### PASO 4: Inicia el servidor React
**En OTRA terminal NUEVA:**

```bash
cd "d:\SEM7-1-2026\SI1 2026-2\barberia_B_R\frontend"
npm run dev
```

Deberías ver:
```
VITE v5.0.0  ready in XXX ms
Local:        http://localhost:3000/
```

---

### PASO 5: Prueba el login
**En tu navegador:**

Abre: http://localhost:3000

Deberías ver:
- Fondo negro con letras doradas
- "Blessed Barber Lounge" en la parte superior
- Formulario para usuario y contraseña

**Prueba login con:**
```
Usuario: tu_usuario_django
Contraseña: tu_contraseña
```

Si viste el dashboard: ✅ ¡Funciona todo!

---

## 🔨 PARA IMPLEMENTAR CU3-CU7 (Frontend Pages)

Una vez que el login funciona, necesitas crear 5 páginas más. 

### Patrón a seguir (basado en Login.jsx):

1. **Crear archivo vacío**: `/frontend/src/pages/seguridad_y_personal/MiPagina.jsx`

2. **Estructura mínima**:
```jsx
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiService } from '../../services/apiService'

export default function MiPagina() {
  const navigate = useNavigate()
  const [datos, setDatos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      const resultado = await apiService.miEndpoint() // Reemplaza con el tuyo
      setDatos(resultado)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Cargando...</p>
  if (error) return <p>Error: {error}</p>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gold-400 mb-6">Mi Título</h1>
      {/* Aquí va tu contenido */}
    </div>
  )
}
```

3. **Agregar RUTA** en `/frontend/src/App.jsx`:
```jsx
import MiPagina from './pages/seguridad_y_personal/MiPagina'

// Dentro del Router:
<Route path="/seguridad/mi-pagina" element={<MiPagina />} />
```

---

## 📋 Orden Recomendado para Implementar

### 1️⃣ **CU3: GESTIONAR USUARIOS** (Más complejo = Primero)
- Ubicación: `/frontend/src/pages/seguridad_y_personal/Usuarios.jsx`
- API a usar: `apiService.listarUsuarios()`, `crearUsuario()`, `actualizarUsuario()`, `eliminarUsuario()`
- Componentes necesarios: Tabla de usuarios, Botón crear, Modal de edición
- Tiempo estimado: 3-4 horas
- **Referencia**: Mira `Dashboard.jsx` para ver cómo hace tabla + datos

### 2️⃣ **CU4: GESTIONAR ROLES** (Más simple = Segundo)
- Ubicación: `/frontend/src/pages/seguridad_y_personal/Roles.jsx`
- API a usar: `apiService.listarRoles()`, `crearRol()`, `actualizarRol()`, `eliminarRol()`
- Similar a CU3 pero más pequeño
- Tiempo estimado: 2-3 horas

### 3️⃣ **CU5: GESTIONAR BARBEROS** (Similar a usuarios pero con más campos)
- Ubicación: `/frontend/src/pages/seguridad_y_personal/Barberos.jsx`
- API a usar: `listarBarberos()`, `crearBarbero()`, etc.
- Tiempo estimado: 3-4 horas

### 4️⃣ **CU6: CONSULTAR BITÁCORA** (Tabla con filtros)
- Ubicación: `/frontend/src/pages/seguridad_y_personal/Bitacora.jsx`
- API a usar: `apiService.consultarBitacora()` (ya tiene paginación y filtros)
- Componentes necesarios: Tabla grande, filtros laterales, búsqueda
- Tiempo estimado: 3-4 horas
- **Ventaja**: Los datos ya vienen del backend, solo presentar bien

### 5️⃣ **CU7: CAMBIAR CONTRASEÑA** (Más simple = Último)
- Ubicación: `/frontend/src/pages/seguridad_y_personal/CambiarContrasena.jsx`
- API a usar: `apiService.cambiarContrasena()`
- Componentes necesarios: Solo un formulario
- Tiempo estimado: 1-2 horas

---

## 🛠️ Utilidades Disponibles

### Funciones API (ya escritas y listas en `apiService.js`):

```javascript
// CU1-2: Login/Logout
apiService.loginUser(username, password)
apiService.logoutUser()

// CU3: Usuarios
apiService.listarUsuarios()
apiService.crearUsuario(datos)
apiService.obtenerUsuario(id)
apiService.actualizarUsuario(id, datos)
apiService.eliminarUsuario(id)

// CU4: Roles
apiService.listarRoles()
apiService.crearRol(datos)
apiService.actualizarRol(id, datos)
apiService.eliminarRol(id)

// CU5: Barberos
apiService.listarBarberos()
apiService.crearBarbero(datos)
apiService.obtenerBarbero(id)
apiService.actualizarBarbero(id, datos)
apiService.eliminarBarbero(id)

// CU6: Bitácora
apiService.consultarBitacora(filtros)

// CU7: Contraseña
apiService.cambiarContrasena(usuarioId, contrasenaActual, contrasenaNew)
```

---

## 🎨 Clases CSS Disponibles (Tailwind)

Ya están listos en `index.css`:

```html
<!-- Botones -->
<button className="btn-gold">Botón principal dorado</button>
<button className="btn-outline">Botón bordado</button>
<button className="btn-dark">Botón oscuro</button>

<!-- Inputs -->
<input className="input-field" type="text" placeholder="..."/>

<!-- Tarjetas -->
<div className="card">Contenido</div>
<div className="card card-hover">Con hover</div>

<!-- Colores de texto -->
<h1 className="text-gold-400">Dorado</h1>
<p className="text-white/80">Blanco 80%</p>
```

---

## 📱 Estructura de Datos (Backend)

### Para CU3 - Usuario:
```json
{
  "id": 1,
  "persona_id": 1,
  "nombre_usuario": "juan",
  "correo": "juan@email.com",
  "estado": "activo",
  "roles": ["administrador"]
}
```

### Para CU5 - Barbero:
```json
{
  "id": 1,
  "persona_id": 1,
  "nombre": "Juan Pérez",
  "especializacion": "Barbas",
  "rating": 4.5,
  "foto": null
}
```

---

## 🐛 Si Algo Falla

### "Cannot GET /api/seguridad/usuarios"
→ Django no corriendo. Ejecuta: `python manage.py runserver`

### "Module not found"
→ En carpeta frontend, ejecuta: `npm install`

### "Port 3000 already in use"
→ Otra ventana está usando el puerto. Ejecuta: `npm run dev -- --port 3001`

### Login no funciona
→ Usuario no existe en Django. Crea uno:
```bash
python manage.py createsuperuser
```

---

## 📚 Documentación a Mano

Mientras trabajas, ten abiertos:

1. **[MAPA_CASOS_USO.md](MAPA_CASOS_USO.md)**
   - Exactamente qué hace cada CU
   - Qué datos recibe y qué retorna

2. **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)**
   - Ejemplos de request/response
   - Errores posibles
   - Formatos esperados

3. **[frontend/README.md](frontend/README.md)**
   - Estructura completa del proyecto
   - Dónde va cada componente

---

## ✨ Checklist Diario

Cada día que trabajes:

```
☐ ¿Terminal Django corriendo?
☐ ¿Terminal React corriendo?
☐ ¿Puedo acceder a http://localhost:3000?
☐ ¿Puedo hacer login?
☐ ¿Los datos vienen desde API?
```

---

## 🎯 Meta Final

Cuando termines los 5 archivos (CU3-CU7):

✅ Botón "Gestionar Usuarios" en sidebar → Abre página con tabla  
✅ Botón "Gestionar Roles" en sidebar → Abre página con tabla  
✅ Botón "Gestionar Barberos" en sidebar → Abre página con tabla  
✅ Botón "Bitácora" en sidebar → Abre tabla con auditoría completa  
✅ Botón "Cambiar Contraseña" en sidebar → Abre formulario  

**Total**: 7 casos de uso completamente funcionales en frontend ✅

---

## 🏁 Resumen

1. **HOY**: Instala Node, ejecuta `npm install && npm run dev`, prueba login
2. **ESTA SEMANA**: Implementa CU3 y CU4
3. **PROXIMA SEMANA**: Implementa CU5, CU6, CU7
4. **LISTO**: Sistema completo en producción

---

## 📞 Necesitas Ayuda?

Revisa esta CARPETA de documentación:

```
/README.md              ← EMPIEZA AQUÍ (índice principal)
/RESUMEN_EJECUTIVO.md   ← Overview del proyecto
/MAPA_CASOS_USO.md      ← Ubicación de cada CU
/API_DOCUMENTATION.md   ← API endpoints con ejemplos
/PROXIMOS_PASOS.md      ← Este archivo
/frontend/README.md     ← Guía frontend específica
/frontend/INSTALAR_NODE.md ← Si necesitas instalar Node
```

---

**¡Ahora sí! Vamos a crear algo increíble.** 🎭✨

*Última actualización: 12 de abril de 2026*
