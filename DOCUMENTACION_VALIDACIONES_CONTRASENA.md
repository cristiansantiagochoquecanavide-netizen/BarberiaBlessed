# DOCUMENTACIÓN: Validaciones de Contraseña Robustas y Nuevas Funcionalidades

## 📋 Resumen de Cambios Implementados

Se han agregado dos nuevas funcionalidades de seguridad de contraseña:
1. **CU7: Cambiar Contraseña** (Mejorado con validaciones robustas)
2. **CU8: Recuperar Contraseña** (Nuevo)

Ambas con validaciones de contraseña de nivel empresarial.

---

## 🔐 Validaciones de Contraseña Implementadas

### Requisitos Obligatorios:
1. **Mínimo 8 caracteres** - Evita contraseñas débiles cortas
2. **Mayúscula (A-Z)** - Aumenta complejidad
3. **Minúscula (a-z)** - Aumenta complejidad
4. **Número (0-9)** - Evita contraseñas solo de letras
5. **Carácter Especial** (@, #, $, %, !, &, *, -, _, =, +, etc.)

### Ejemplos de Contraseñas Válidas:
- ✅ MiSegura123!
- ✅ Barberia@2025
- ✅ Contraseña#Fuerte123
- ✅ Admin$123Backend

### Ejemplos de Contraseñas NO Válidas:
- ❌ 123456 (solo números)
- ❌ password (minúsculas solamente)
- ❌ Contraseña (sin números ni caracteres especiales)
- ❌ Pass1! (menos de 8 caracteres)

---

## 🔧 BACKEND (Django) - Cambios Realizados

### 1. **Archivo: seguridad_y_personal/views.py**

#### Función: `validar_contrasena_robusta(contrasena)`
```python
def validar_contrasena_robusta(contrasena):
    """
    Valida que la contraseña cumpla con requisitos de seguridad:
    - Mínimo 8 caracteres
    - Al menos 1 mayúscula (A-Z)
    - Al menos 1 minúscula (a-z)
    - Al menos 1 número (0-9)
    - Al menos 1 carácter especial (@, #, $, %, !, &, *, etc.)
    
    Retorna: (es_valida: bool, mensaje: str)
    """
    # Validación 1: Longitud mínima
    if len(contrasena) < 8:
        return False, "La contraseña debe tener mínimo 8 caracteres"
    
    # Validación 2: Mayúsculas (regex: /[A-Z]/)
    if not re.search(r'[A-Z]', contrasena):
        return False, "La contraseña debe contener al menos 1 mayúscula (A-Z)"
    
    # Validación 3: Minúsculas (regex: /[a-z]/)
    if not re.search(r'[a-z]', contrasena):
        return False, "La contraseña debe contener al menos 1 minúscula (a-z)"
    
    # Validación 4: Números (regex: /[0-9]/)
    if not re.search(r'[0-9]', contrasena):
        return False, "La contraseña debe contener al menos 1 número (0-9)"
    
    # Validación 5: Caracteres especiales
    if not re.search(r'[@#$%!&*\-_=+\[\]{};:\'",.<>?/\\`~^|]', contrasena):
        return False, "La contraseña debe contener al menos 1 carácter especial"
    
    return True, "Contraseña válida"
```

**Importes Agregados:**
```python
import re              # Para expresiones regulares
import secrets         # Para generación segura de números aleatorios
import string          # Para acceder a caracteres alfabéticos
```

#### Función: `generar_contrasena_temporal()`
```python
def generar_contrasena_temporal():
    """
    Genera una contraseña temporal segura de 12 caracteres que cumple con
    los requisitos de seguridad (mayúsculas, minúsculas, números, caracteres especiales)
    """
    # ESTRATEGIA: Crear una contraseña que garantice todos los requisitos
    
    # 1. Seleccionar al menos 1 de cada tipo requeri
    contrasena = [
        secrets.choice(string.ascii_uppercase),    # Una mayúscula
        secrets.choice(string.ascii_lowercase),    # Una minúscula
        secrets.choice(string.digits),             # Un número
        secrets.choice('@#$%!&*')                  # Un carácter especial
    ]
    
    # 2. Completar con 8 caracteres más (aleatorios)
    todos_caracteres = (string.ascii_uppercase + string.ascii_lowercase + 
                       string.digits + '@#$%!&*')
    
    for _ in range(8):
        contrasena.append(secrets.choice(todos_caracteres))
    
    # 3. Mezclar aleatoriamente
    import random
    random.shuffle(contrasena)
    
    return ''.join(contrasena)
```

#### Endpoint: `cambiar_contrasena(request)` - MEJORADO
**POST** `/api/seguridad/cambiar-contrasena/`

**Requiere Autenticación:** Sí

**Parámetros JSON:**
```json
{
  "contrasena_actual": "Tu contraseña actual",
  "contrasena_nueva": "Tu contraseña nueva (debe cumplir validaciones)",
  "contrasena_confirmacion": "Confirmación de nueva contraseña"
}
```

**Validaciones Realizadas:**
1. Usuario debe estar autenticado
2. Campos no vacíos
3. Las nuevas contraseñas coinciden
4. Nueva contraseña ≠ contraseña actual
5. **Nueva contraseña cumple con requisitos de seguridad**
6. Contraseña actual es correcta

**Respuesta Exitosa:**
```json
{
  "success": true,
  "mensaje": "Contraseña cambiada correctamente"
}
```

**Respuesta Error:**
```json
{
  "success": false,
  "mensaje": "Descripción del error"
}
```

**Registra en Bitácora:**
- `accion: "CAMBIO_CONTRASENA_EXITOSO"` (éxito)
- `accion: "INTENTO_CAMBIO_CONTRASENA_FALLIDO"` (error)

---

#### Endpoint: `recuperar_contrasena(request)` - NUEVO
**POST** `/api/seguridad/recuperar-contrasena/`

**Requiere Autenticación:** No (público)

**Parámetros JSON:**
```json
{
  "username": "nombre_del_usuario_que_olvidó_contraseña"
}
```

**Validaciones:**
1. Username requerido
2. Usuario debe existir
3. Usuario debe estar activo

**Respuesta Exitosa:**
```json
{
  "success": true,
  "mensaje": "Contraseña temporal generada correctamente",
  "contrasena_temporal": "Kx7!mPq2@Yz9",
  "nota": "Esta contraseña temporal debería ser enviada por email"
}
```

**Registra en Bitácora:**
- `accion: "RECUPERACION_CONTRASENA"`
- `descripcion: "Se generó contraseña temporal para usuario [username]"`

---

### 2. **Archivo: seguridad_y_personal/urls.py**

Se agregó la nueva ruta:
```python
# CU8. Recuperar contraseña
path('recuperar-contrasena/', views.recuperar_contrasena, name='recuperar_contrasena'),
```

---

## 🎨 FRONTEND (React) - Cambios Realizados

### 1. **Archivo: frontend/src/api/apiClient.js**

#### Función: `cambiarContrasena()`
```javascript
/**
 * CU7. Cambiar contraseña
 * POST /api/seguridad/cambiar-contrasena/
 */
export const cambiarContrasena = async (contrasenaActual, contrasenaNueva, confirmacion) => {
  try {
    const response = await apiClient.post('/cambiar-contrasena/', {
      contrasena_actual: contrasenaActual,      // Contraseña actual del usuario
      contrasena_nueva: contrasenaNueva,        // Nueva contraseña
      contrasena_confirmacion: confirmacion     // Confirmación
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al cambiar contraseña'
    };
  }
};
```

#### Función: `recuperarContrasena()` - NUEVA
```javascript
/**
 * CU8. Recuperar contraseña
 * POST /api/seguridad/recuperar-contrasena/
 */
export const recuperarContrasena = async (username) => {
  try {
    const response = await apiClient.post('/recuperar-contrasena/', {
      username: username  // Usuario que olvidó contraseña
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al recuperar contraseña'
    };
  }
};
```

---

### 2. **Archivo: frontend/src/pages/CuentaPage.jsx**

#### Mejoras Principales:

1. **Validaciones en Tiempo Real**
```javascript
// La función valida mientras el usuario está escribiendo
const validarContrasenaNueva = (contrasena) => {
  const tieneMinimo8 = contrasena.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(contrasena);
  const tieneMinuscula = /[a-z]/.test(contrasena);
  const tieneNumero = /[0-9]/.test(contrasena);
  const tieneEspecial = /[@#$%!&*\-_=+\[\]{};:'",./<>?\\`~^|]/.test(contrasena);
  
  // Actualiza visualización en tiempo real
  setValidaciones({
    longitud: tieneMinimo8,
    mayuscula: tieneMayuscula,
    minuscula: tieneMinuscula,
    numero: tieneNumero,
    especial: tieneEspecial
  });
};
```

2. **Validaciones Visuales en Componente**
El componente muestra:
- ✓ o ✗ para cada requisito
- Colores: verde (válido) / rojo (inválido)
- Indicador de coincidencia de contraseñas
- Botón deshabilitado hasta que se cumplan todos los requisitos

3. **Información de Seguridad**
Se muestra:
- Recomendaciones de cambio cada 3 meses
- Advertencia de no usar en otros servicios
- Importancia de no compartir contraseña

---

### 3. **NUEVO Archivo: frontend/src/pages/RecuperarContraseniaPage.jsx**

Componente completo para recuperación de contraseña con:

1. **Paso 1: Solicitar Recuperación**
```javascript
// Usuario ingresa su nombre de usuario
// Backend genera contraseña temporal
// Se muestra la contraseña temporal (debería ser por email en producción)
```

2. **Paso 2: Mostrar Contraseña Temporal**
```
Tu contraseña temporal es: Kx7!mPq2@Yz9
- Botón para copiar
- Instrucciones claras
- Enlace para ir a login
```

3. **Características:**
- Validación de username
- Manejo robusto de errores
- Instrucciones paso a paso
- Información de seguridad
- Botón copiar al portapapeles

---

### 4. **Archivo: frontend/src/App.jsx**

Se agregó:
```javascript
import RecuperarContraseniaPage from './pages/RecuperarContraseniaPage';

<Route path="/recuperar-contrasena" element={<RecuperarContraseniaPage />} />
```

---

### 5. **Archivo: frontend/src/pages/LoginPage.jsx**

Se agregó enlace:
```javascript
<div className="auth-links">
  <button
    type="button"
    onClick={() => navigate('/recuperar-contrasena')}
    className="link-button"
  >
    <KeyRound size={18} />
    ¿Olvidaste tu contraseña?
  </button>
</div>
```

---

## 📱 Flujos de Usuario

### Flujo 1: Cambiar Contraseña (CU7)
```
Usuario Autenticado → Mi Cuenta → Cambiar Contraseña
    ↓
Ingresar contraseña actual
Ingresar contraseña nueva (se valida en tiempo real)
Ver requisitos marcados en tiempo real (✓ o ✗)
Confirmar contraseña nueva
    ↓
Backend valida nuevamente
    ↓
Éxito → Mensaje de éxito y limpiar
Error → Mostrar mensaje de error específico
```

### Flujo 2: Recuperar Contraseña (CU8)
```
Usuario sin autenticar → Login → "¿Olvidaste tu contraseña?"
    ↓
Ingresar nombre de usuario
    ↓
Backend busca usuario y genera contraseña temporal
    ↓
Se muestra contraseña temporal (debería enviarse por email)
    ↓
Usuario copia contraseña
Usuario va a Login
Usuario inicia sesión con contraseña temporal
Usuario va a Mi Cuenta y cambia a contraseña nueva
```

---

## 🔒 Seguridad Implementada

1. **Backend:**
   - Validaciones en servidor (no confiar en cliente)
   - Hasheado de contraseña con `make_password()`
   - Verificación con `check_password()`
   - Registro en bitácora de todo intento
   - Contraseña temporal generada con `secrets` (criptográficamente segura)

2. **Frontend:**
   - Validaciones visuales en tiempo real
   - Feedback inmediato al usuario
   - Botón deshabilitado hasta cumplir requisitos
   - No almacenar contraseña en localStorage

3. **Requisitos de Contraseña:**
   - Evita: `123456`, `password`, etc.
   - Requiere mezcla de caracteres
   - Mínimo 8 caracteres
   - Caracteres especiales obligatorios

---

## 🧪 Pruebas Recomendadas

### Backend:
```bash
# Test cambiar contraseña
POST /api/seguridad/cambiar-contrasena/
{
  "contrasena_actual": "ActualPassword123!",
  "contrasena_nueva": "NewPassword456@",
  "contrasena_confirmacion": "NewPassword456@"
}

# Test recuperar contraseña
POST /api/seguridad/recuperar-contrasena/
{
  "username": "juan_barbero"
}
```

### Frontend:
1. Ir a login, hacer clic en "¿Olvidaste tu contraseña?"
2. Ingresar nombre de usuario
3. Ver contraseña temporal generada
4. Copiar contraseña
5. Ir a login e ingresar con contraseña temporal
6. Ir a Mi Cuenta
7. Cambiar contraseña a una nueva que cumpla requisitos
8. Ver validación en tiempo real de requisitos

---

## 🚀 Próximos Pasos (Para Producción)

1. **Email Integration:**
   - Enviar contraseña temporal por email en vez de mostrarla en pantalla
   - Usar Django-Celery para tareas asincrónicas

2. **2FA (Two-Factor Authentication):**
   - Agregar autenticación de dos factores

3. **Reset Password Link:**
   - En vez de mostrar contraseña temporal, generar link con token

4. **Expiración de Contraseña Temporal:**
   - Las contraseñas temporales expiren en 24 horas

5. **Historial de Cambios:**
   - Guardar historial en tabla `HistorialCambiosContraseña`

---

## 📚 Referencias

- **Django Password Hashing:** https://docs.djangoproject.com/en/6.0/topics/auth/passwords/
- **Python `secrets`:** https://docs.python.org/3/library/secrets.html
- **Regex de Validación:** `re.search(patrón, cadena)`
- **React Hooks:** `useState` para estado local

---

## ✅ Implementación Completada

- ✅ Backend validaciones robustas
- ✅ Endpoint cambiar contraseña mejorado
- ✅ Nuevo endpoint recuperar contraseña
- ✅ Frontend con validaciones en tiempo real
- ✅ Nueva página de recuperación
- ✅ Integración en rutas
- ✅ Comentarios completos en código
- ✅ Bitácora de acciones

**Todos los nuevos códigos están totalmente comentados en español.**
