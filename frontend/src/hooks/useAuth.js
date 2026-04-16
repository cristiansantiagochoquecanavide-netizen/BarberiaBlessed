/**
 * Hook personalizado para autenticación
 * 
 * Proporciona una forma cómoda de acceder al contexto de autenticación
 * desde cualquier componente.
 */

import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export const useAuth = () => {
  const contexto = useContext(AuthContext);
  
  if (!contexto) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  
  return contexto;
};
