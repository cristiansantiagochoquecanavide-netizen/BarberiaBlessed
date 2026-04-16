/**
 * Cliente API para comunicación con el backend Django
 * 
 * Este módulo centraliza todas las llamadas a la API del backend.
 * Maneja autenticación, sesiones y errores de forma consistente.
 */

import axios from 'axios';

// Configuración del cliente API
const API_BASE_URL = 'http://localhost:8000/api/seguridad';

// Crear instancia de axios con configuraciones por defecto
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Incluir cookies de sesión
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para manejar errores
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Si es un error de autenticación, limpiar sesión local
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('usuario');
      localStorage.removeItem('sessionId');
      // Opcionalmente redirigir al login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============= CASOS DE USO: SEGURIDAD Y PERSONAL =============

/**
 * CU1. Iniciar sesión
 * POST /api/seguridad/login/
 */
export const loginUsuario = async (username, password) => {
  try {
    const response = await apiClient.post('/login/', {
      username,
      password
    });
    
    // Guardar información de sesión en localStorage
    if (response.data.success) {
      localStorage.setItem('usuario', JSON.stringify(response.data.usuario));
    }
    
    return response.data;
  } catch (error) {
    // Log completo del error para debugging
    console.error('Error en login:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Mensaje de error más específico
    let mensaje = 'Error al iniciar sesión';
    if (error.response?.status === 403) {
      mensaje = 'Error CORS: El servidor no acepta peticiones desde este origen. Verifica la configuración Django.';
    } else if (error.response?.status === 401 || error.response?.status === 400) {
      mensaje = error.response?.data?.mensaje || 'Usuario o contraseña incorrectos';
    } else if (!error.response) {
      mensaje = 'Error de conexión: No puedes conectar con el servidor. ¿Está Django corriendo en http://localhost:8000?';
    }
    
    return {
      success: false,
      mensaje: mensaje
    };
  }
};

/**
 * CU2. Cerrar sesión
 * GET/POST /api/seguridad/logout/
 */
export const logoutUsuario = async () => {
  try {
    const response = await apiClient.post('/logout/');
    
    // Limpiar sesión local
    localStorage.removeItem('usuario');
    localStorage.removeItem('sessionId');
    
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al cerrar sesión'
    };
  }
};

/**
 * CU3. Gestionar usuarios
 */

// Listar todos los usuarios
export const listarUsuarios = async () => {
  try {
    const response = await apiClient.get('/usuarios/');
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al listar usuarios'
    };
  }
};

// Obtener detalles de un usuario específico
export const obtenerUsuario = async (usuarioId) => {
  try {
    const response = await apiClient.get(`/usuarios/${usuarioId}/`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al obtener usuario'
    };
  }
};

// Crear nuevo usuario
export const crearUsuario = async (datos) => {
  try {
    const response = await apiClient.post('/usuarios/crear/', datos);
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al crear usuario'
    };
  }
};

// Actualizar usuario
export const actualizarUsuario = async (usuarioId, datos) => {
  try {
    const response = await apiClient.put(`/usuarios/${usuarioId}/`, datos);
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al actualizar usuario'
    };
  }
};

// Eliminar/Desactivar usuario
export const eliminarUsuario = async (usuarioId) => {
  try {
    const response = await apiClient.delete(`/usuarios/${usuarioId}/`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al eliminar usuario'
    };
  }
};

/**
 * CU4. Gestionar roles
 */

// Listar todos los roles
export const listarRoles = async () => {
  try {
    const response = await apiClient.get('/roles/');
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al listar roles'
    };
  }
};

// Obtener detalles de un rol específico
export const obtenerRol = async (rolId) => {
  try {
    const response = await apiClient.get(`/roles/${rolId}/`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al obtener rol'
    };
  }
};

// Crear nuevo rol
export const crearRol = async (datos) => {
  try {
    const response = await apiClient.post('/roles/crear/', datos);
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al crear rol'
    };
  }
};

// Actualizar rol
export const actualizarRol = async (rolId, datos) => {
  try {
    const response = await apiClient.put(`/roles/${rolId}/`, datos);
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al actualizar rol'
    };
  }
};

// Eliminar rol
export const eliminarRol = async (rolId) => {
  try {
    const response = await apiClient.delete(`/roles/${rolId}/`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al eliminar rol'
    };
  }
};

/**
 * CU5. Gestionar barberos (Personas con es_barbero=True)
 */

// Listar todos los barberos
export const listarBarberos = async () => {
  try {
    const response = await apiClient.get('/barberos/');
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al listar barberos'
    };
  }
};

// Obtener detalles de un barbero específico
export const obtenerBarbero = async (barberoId) => {
  try {
    const response = await apiClient.get(`/barberos/${barberoId}/`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al obtener barbero'
    };
  }
};

// Crear nuevo barbero
export const crearBarbero = async (datos) => {
  try {
    const response = await apiClient.post('/barberos/crear/', datos);
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al crear barbero'
    };
  }
};

// Actualizar barbero
export const actualizarBarbero = async (barberoId, datos) => {
  try {
    const response = await apiClient.put(`/barberos/${barberoId}/`, datos);
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al actualizar barbero'
    };
  }
};

// Eliminar/Desactivar barbero
export const eliminarBarbero = async (barberoId) => {
  try {
    const response = await apiClient.delete(`/barberos/${barberoId}/`);
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al eliminar barbero'
    };
  }
};

/**
 * CU6. Consultar bitácora
 */

export const consultarBitacora = async (filtros = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Agregar filtros si existen
    if (filtros.usuario_id) params.append('usuario_id', filtros.usuario_id);
    if (filtros.tabla_afectada) params.append('tabla_afectada', filtros.tabla_afectada);
    if (filtros.accion) params.append('accion', filtros.accion);
    if (filtros.fecha_inicio) params.append('fecha_inicio', filtros.fecha_inicio);
    if (filtros.fecha_fin) params.append('fecha_fin', filtros.fecha_fin);
    if (filtros.pagina) params.append('pagina', filtros.pagina);
    if (filtros.limite) params.append('limite', filtros.limite);
    
    const queryString = params.toString();
    const url = queryString ? `/bitacora/?${queryString}` : '/bitacora/';
    
    const response = await apiClient.get(url);
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al consultar bitácora'
    };
  }
};

/**
 * CU7. Cambiar contraseña
 */

export const cambiarContrasena = async (contrasenaActual, contrasenaNueva, confirmacion) => {
  try {
    const response = await apiClient.post('/cambiar-contrasena/', {
      'contraseña_actual': contrasenaActual,
      'contraseña_nueva': contrasenaNueva,
      'contraseña_nueva_confirmacion': confirmacion
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      mensaje: error.response?.data?.mensaje || 'Error al cambiar contraseña'
    };
  }
};

// Función auxiliar para obtener usuario de la sesión local
export const getUsuarioActual = () => {
  const usuarioJSON = localStorage.getItem('usuario');
  return usuarioJSON ? JSON.parse(usuarioJSON) : null;
};

export default apiClient;
