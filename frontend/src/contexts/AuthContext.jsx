/**
 * Contexto de autenticación
 * 
 * Proporciona el estado y funciones relacionadas con la autenticación
 * a todos los componentes de la aplicación.
 */

import { createContext, useState, useEffect } from 'react';
import { getUsuarioActual } from '../api/apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Estado
  const [usuario, setUsuario] = useState(null);
  const [estaAutenticado, setEstaAutenticado] = useState(false);
  const [cargando, setCargando] = useState(true);

  // Al montar el componente, verificar si hay sesión activa
  useEffect(() => {
    const usuarioGuardado = getUsuarioActual();
    if (usuarioGuardado) {
      setUsuario(usuarioGuardado);
      setEstaAutenticado(true);
    }
    setCargando(false);
  }, []);

  // Función para establecer usuario autenticado
  const login = (usuarioData) => {
    setUsuario(usuarioData);
    setEstaAutenticado(true);
  };

  // Función para cerrar sesión
  const logout = () => {
    setUsuario(null);
    setEstaAutenticado(false);
    localStorage.removeItem('usuario');
  };

  const valor = {
    usuario,
    estaAutenticado,
    cargando,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
};
