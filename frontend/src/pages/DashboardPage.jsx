/**
 * Dashboard Principal
 * 
 * Página principal después del login. Incluye:
 * - Menú lateral de navegación
 * - Área principal con información del usuario
 * - Acceso rápido a funcionalidades principales
 * 
 * Organización de menú según módulos:
 * - Gestión de Usuarios
 * - Gestión de Roles
 * - Gestión de Barberos
 * - Consultar Bitácora
 * - Mi Cuenta
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { logoutUsuario } from '../api/apiClient';
import {
  Menu,
  Users,
  Shield,
  Scissors,
  ActivitySquare,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import '../styles/dashboard.css';

export const DashboardPage = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const handleLogout = async () => {
    const resultado = await logoutUsuario();
    if (resultado.success) {
      logout();
      navigate('/login');
    }
  };

  const menuItems = [
    {
      id: 'usuarios',
      label: 'Gestionar Usuarios',
      icon: Users,
      ruta: '/usuarios',
      descripcion: 'Crear, editar y eliminar usuarios del sistema'
    },
    {
      id: 'roles',
      label: 'Gestionar Roles',
      icon: Shield,
      ruta: '/roles',
      descripcion: 'Administrar roles y permisos'
    },
    {
      id: 'barberos',
      label: 'Gestionar Barberos',
      icon: Scissors,
      ruta: '/barberos',
      descripcion: 'Gestionar información de los barberos'
    },
    {
      id: 'bitacora',
      label: 'Consultar Bitácora',
      icon: ActivitySquare,
      ruta: '/bitacora',
      descripcion: 'Ver auditoría del sistema'
    },
    {
      id: 'cuenta',
      label: 'Mi Cuenta',
      icon: Settings,
      ruta: '/cuenta',
      descripcion: 'Cambiar contraseña y perfil'
    }
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className={`sidebar ${menuAbierto ? 'abierto' : ''}`}>
        <div className="sidebar-header">
          <div className="app-brand">
            <span className="brand-icon">✂️</span>
            <span className="brand-name">B&R</span>
          </div>
          <button
            className="close-menu"
            onClick={() => setMenuAbierto(false)}
          >
            <X size={24} />
          </button>
        </div>

        {/* Info de usuario en sidebar */}
        <div className="user-info-sidebar">
          <div className="avatar">{usuario?.nombre?.charAt(0)?.toUpperCase()}</div>
          <div className="user-details">
            <p className="user-name">{usuario?.nombre}</p>
            <p className="user-username">{usuario?.username}</p>
          </div>
        </div>

        {/* Menú */}
        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className="menu-item"
              onClick={() => {
                navigate(item.ruta);
                setMenuAbierto(false);
              }}
            >
              <item.icon size={20} />
              <span className="menu-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="sidebar-footer">
          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="main-content">
        {/* Barra Superior */}
        <header className="top-bar">
          <button
            className="menu-toggle"
            onClick={() => setMenuAbierto(!menuAbierto)}
          >
            <Menu size={24} />
          </button>
          <div className="top-bar-right">
            <span className="time">{new Date().toLocaleTimeString()}</span>
            <div className="user-profile">
              <div className="avatar-small">
                {usuario?.nombre?.charAt(0)?.toUpperCase()}
              </div>
              <span>{usuario?.nombre}</span>
            </div>
          </div>
        </header>

        {/* Contenido */}
        <div className="dashboard-content">
          {/* Bienvenida */}
          <section className="welcome-section">
            <div className="welcome-header">
              <h1>¡Bienvenido, {usuario?.nombre?.split(' ')[0]}!</h1>
              <p>Sistema de Gestión de Barbería B&R</p>
            </div>
          </section>

          {/* Grid de acceso rápido */}
          <section className="quick-access">
            <h2>Acceso Rápido</h2>
            <div className="access-grid">
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  className="access-card"
                  onClick={() => navigate(item.ruta)}
                >
                  <div className="card-icon">
                    <item.icon size={32} />
                  </div>
                  <h3>{item.label}</h3>
                  <p>{item.descripcion}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Estadísticas/Info */}
          <section className="dashboard-info">
            <div className="info-card">
              <h3>📋 Funcionalidades Disponibles</h3>
              <ul>
                <li><strong>CU1:</strong> Iniciar sesión ✅</li>
                <li><strong>CU2:</strong> Cerrar sesión ✅</li>
                <li><strong>CU3:</strong> Gestionar usuarios - Crear, editar y eliminar</li>
                <li><strong>CU4:</strong> Gestionar roles - Crear y administrar</li>
                <li><strong>CU5:</strong> Gestionar barberos - Control del personal</li>
                <li><strong>CU6:</strong> Consultar bitácora - Auditoría completa</li>
                <li><strong>CU7:</strong> Cambiar contraseña - Seguridad de cuenta</li>
              </ul>
            </div>
          </section>
        </div>
      </main>

      {/* Overlay para cerrar sidebar en móvil */}
      {menuAbierto && (
        <div className="overlay" onClick={() => setMenuAbierto(false)} />
      )}
    </div>
  );
};

export default DashboardPage;
