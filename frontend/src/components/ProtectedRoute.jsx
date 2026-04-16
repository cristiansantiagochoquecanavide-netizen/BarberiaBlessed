/**
 * Componente de Ruta Protegida
 * 
 * Verifica si el usuario está autenticado antes de permitir
 * acceso a una ruta. Si no está autenticado, redirige al login.
 */

import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const ProtectedRoute = ({ element }) => {
  const { estaAutenticado, cargando } = useAuth();

  // Mientras carga, mostrar un componente de carga
  if (cargando) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5'
      }}>
        <div>Cargando...</div>
      </div>
    );
  }

  // Si no está autenticado, redirigir al login
  if (!estaAutenticado) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, mostrar el elemento
  return element;
};
