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
  X,
  ChevronDown
} from 'lucide-react';
import '../styles/dashboard.css';

export const DashboardPage = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [grupoAbierto, setGrupoAbierto] = useState(true); // Grupo "Seguridad y Personal" abierto por defecto

  const handleLogout = async () => {
    const resultado = await logoutUsuario();
    if (resultado.success) {
      logout();
      navigate('/login');
    }
  };

  // Estructura de menú con grupos
  const grupos = [
    {
      id: 'seguridad',
      nombre: 'Seguridad y Personal',
      items: [
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
        }
      ]
    }
  ];

  // Items fuera de grupo
  const itemsAdicionales = [
    {
      id: 'cuenta',
      label: 'Mi Cuenta',
      icon: Settings,
      ruta: '/cuenta',
      descripcion: 'Cambiar contraseña y perfil'
    }
  ];

  // Obtener todos los items para el acceso rápido
  const todosLosItems = [
    ...grupos.flatMap(g => g.items),
    ...itemsAdicionales
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
          {/* Grupo: Seguridad y Personal */}
          <div className="menu-group">
            <button
              className="menu-group-header"
              onClick={() => setGrupoAbierto(!grupoAbierto)}
            >
              <span>Seguridad y Personal</span>
              <ChevronDown
                size={18}
                style={{
                  transform: grupoAbierto ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.3s'
                }}
              />
            </button>

            {grupoAbierto && (
              <div className="menu-group-items">
                {grupos[0].items.map((item) => (
                  <button
                    key={item.id}
                    className="menu-item menu-item-submenu"
                    onClick={() => {
                      navigate(item.ruta);
                      setMenuAbierto(false);
                    }}
                  >
                    <item.icon size={18} />
                    <span className="menu-label">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Items adicionales */}
          {itemsAdicionales.map((item) => (
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
              {todosLosItems.map((item) => (
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
