/**
 * Aplicación Principal - Barbería B&R
 * 
 * Router de la aplicación con todas las rutas y navegación.
 * 
 * Estructura:
 * - /login: Página de autenticación (CU1)
 * - /recuperar-contrasena: Recuperación de contraseña (CU8)
 * - /dashboard: Dashboard principal (requiere autenticación)
 * - /usuarios: Gestión de usuarios (CU3)
 * - /roles: Gestión de roles (CU4)
 * - /barberos: Gestión de barberos (CU5)
 * - /bitacora: Consulta de bitácora (CU6)
 * - /cuenta: Mi cuenta y cambio de contraseña (CU7)
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Páginas
import LoginPage from './pages/LoginPage';
import RecuperarContraseniaPage from './pages/RecuperarContraseniaPage';
import DashboardPage from './pages/DashboardPage';
import UsuariosPage from './pages/UsuariosPage';
import RolesPage from './pages/RolesPage';
import BarberosPage from './pages/BarberosPage';
import BitacoraPage from './pages/BitacoraPage';
import CuentaPage from './pages/CuentaPage';

// Estilos
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Autenticación */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/recuperar-contrasena" element={<RecuperarContraseniaPage />} />

          {/* Dashboard y páginas protegidas */}
          <Route path="/dashboard" element={<ProtectedRoute element={<DashboardPage />} />} />
          <Route path="/usuarios" element={<ProtectedRoute element={<UsuariosPage />} />} />
          <Route path="/roles" element={<ProtectedRoute element={<RolesPage />} />} />
          <Route path="/barberos" element={<ProtectedRoute element={<BarberosPage />} />} />
          <Route path="/bitacora" element={<ProtectedRoute element={<BitacoraPage />} />} />
          <Route path="/cuenta" element={<ProtectedRoute element={<CuentaPage />} />} />

          {/* Redirecciones */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
