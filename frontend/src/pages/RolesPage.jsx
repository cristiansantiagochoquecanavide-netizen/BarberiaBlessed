/**
 * CU4. Página de Gestión de Roles
 * 
 * Permite:
 * - Listar todos los roles
 * - Crear nuevos roles
 * - Editar roles existentes
 * - Eliminar roles
 * 
 * Sincronización: Conectado directamente con la API del backend
 */

import { useState, useEffect } from 'react';
import { listarRoles, crearRol, actualizarRol, eliminarRol } from '../api/apiClient';
import { Plus, Edit2, Trash2, ChevronLeft, AlertCircle } from 'lucide-react';
import '../styles/crud.css';

export const RolesPage = () => {
  const [roles, setRoles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [rolEditando, setRolEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '' });

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    setCargando(true);
    setError('');
    const resultado = await listarRoles();
    if (resultado.success) {
      setRoles(resultado.roles || []);
    } else {
      setError('Error al cargar roles');
    }
    setCargando(false);
  };

  const handleAbrirModal = (rol = null) => {
    if (rol) {
      setRolEditando(rol);
      setForm({ nombre: rol.nombre });
    } else {
      setRolEditando(null);
      setForm({ nombre: '' });
    }
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setRolEditando(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nombre.trim()) {
      setError('El nombre del rol es requerido');
      return;
    }

    let resultado;
    if (rolEditando) {
      resultado = await actualizarRol(rolEditando.id_rol, form);
    } else {
      resultado = await crearRol(form);
    }

    if (resultado.success) {
      handleCerrarModal();
      cargarRoles();
    } else {
      setError(resultado.mensaje || 'Error al guardar rol');
    }
  };

  const handleEliminar = async (rolId) => {
    if (window.confirm('¿Eliminar este rol?')) {
      const resultado = await eliminarRol(rolId);
      if (resultado.success) {
        cargarRoles();
      } else {
        setError(resultado.mensaje || 'Error al eliminar rol');
      }
    }
  };

  return (
    <div className="crud-container">
      <div className="crud-header">
        <div className="header-left">
          <h1>Gestión de Roles (CU4)</h1>
          <p>Crear y administrar roles del sistema</p>
        </div>
        <button className="btn-primary" onClick={() => handleAbrirModal()}>
          <Plus size={20} />
          Nuevo Rol
        </button>
      </div>

      {error && (
        <div className="error-box">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      <div className="crud-content">
        {cargando ? (
          <div className="loading">Cargando roles...</div>
        ) : roles.length === 0 ? (
          <div className="empty-state">
            <p>No hay roles registrados</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre del Rol</th>
                  <th>Usuarios Asignados</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((rol) => (
                  <tr key={rol.id_rol}>
                    <td className="id-cell">{rol.id_rol}</td>
                    <td className="font-mono">{rol.nombre}</td>
                    <td>{rol.usuarios_asignados}</td>
                    <td className="actions">
                      <button
                        className="btn-icon edit"
                        onClick={() => handleAbrirModal(rol)}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleEliminar(rol.id_rol)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalAbierto && (
        <div className="modal-overlay" onClick={handleCerrarModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{rolEditando ? 'Editar Rol' : 'Nuevo Rol'}</h2>
              <button className="close-btn" onClick={handleCerrarModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group-2col">
                <div>
                  <label>Nombre del Rol *</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({ nombre: e.target.value })}
                    placeholder="Ej: Administrador, Barbero, Cliente"
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCerrarModal}>
                  <ChevronLeft size={18} />
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {rolEditando ? 'Actualizar' : 'Crear'} Rol
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolesPage;
