/**
 * CU3. Página de Gestión de Usuarios
 * 
 * Permite:
 * - Listar todos los usuarios
 * - Crear nuevos usuarios
 * - Editar información de usuarios
 * - Desactivar usuarios
 * 
 * Comentarios de implementación:
 * - Se sincroniza con la API del backend
 * - Validación de datos en el cliente
 * - Muestra estado de carga y errores
 */

import { useState, useEffect } from 'react';
import {
  listarUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  listarRoles
} from '../api/apiClient';
import { Plus, Edit2, Trash2, ChevronLeft, AlertCircle } from 'lucide-react';
import '../styles/crud.css';

export const UsuariosPage = () => {
  // Estados
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [roles, setRoles] = useState([]);

  // Datos del formulario
  const [form, setForm] = useState({
    username: '',
    password: '',
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    ci: '',
    direccion: '',
    roles: []
  });

  // Cargar usuarios y roles al montar
  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    setError('');
    
    // Cargar usuarios
    const resultUsuarios = await listarUsuarios();
    if (resultUsuarios.success) {
      setUsuarios(resultUsuarios.usuarios || []);
    } else {
      setError('Error al cargar usuarios');
    }

    // Cargar roles
    const resultRoles = await listarRoles();
    if (resultRoles.success) {
      setRoles(resultRoles.roles || []);
    }

    setCargando(false);
  };

  const handleAbrirModal = (usuario = null) => {
    if (usuario) {
      setUsuarioEditando(usuario);
      setForm({
        username: usuario.username,
        password: '',
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        telefono: usuario.telefono || '',
        ci: usuario.ci || '',
        direccion: usuario.direccion || '',
        roles: usuario.roles || []
      });
    } else {
      setUsuarioEditando(null);
      setForm({
        username: '',
        password: '',
        nombres: '',
        apellidos: '',
        correo: '',
        telefono: '',
        ci: '',
        direccion: '',
        roles: []
      });
    }
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setUsuarioEditando(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validar campos requeridos
    if (!form.username.trim() || !form.nombres.trim() || !form.apellidos.trim()) {
      setError('Por favor complete los campos requeridos');
      return;
    }

    let resultado;
    
    if (usuarioEditando) {
      // Actualizar usuario
      const datosActualizar = { ...form };
      delete datosActualizar.password; // No enviar password si está vacío
      if (!datosActualizar.password) {
        delete datosActualizar.password;
      }
      resultado = await actualizarUsuario(usuarioEditando.id_usuario, datosActualizar);
    } else {
      // Crear nuevo usuario
      if (!form.password.trim()) {
        setError('La contraseña es requerida para nuevo usuario');
        return;
      }
      resultado = await crearUsuario(form);
    }

    if (resultado.success) {
      handleCerrarModal();
      cargarDatos();
    } else {
      setError(resultado.mensaje || 'Error al guardar usuario');
    }
  };

  const handleEliminar = async (usuarioId) => {
    if (window.confirm('¿Desactivar este usuario?')) {
      const resultado = await eliminarUsuario(usuarioId);
      if (resultado.success) {
        cargarDatos();
      } else {
        setError(resultado.mensaje || 'Error al eliminar usuario');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="crud-container">
      {/* Encabezado */}
      <div className="crud-header">
        <div className="header-left">
          <h1>Gestión de Usuarios (CU3)</h1>
          <p>Crear, editar y eliminar usuarios del sistema</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => handleAbrirModal()}
        >
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="error-box">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de usuarios */}
      <div className="crud-content">
        {cargando ? (
          <div className="loading">Cargando usuarios...</div>
        ) : usuarios.length === 0 ? (
          <div className="empty-state">
            <p>No hay usuarios registrados</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Nombre Completo</th>
                  <th>Email</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((usuario) => (
                  <tr key={usuario.id_usuario}>
                    <td className="font-mono">{usuario.username}</td>
                    <td>{usuario.nombre}</td>
                    <td>{usuario.correo}</td>
                    <td>
                      <span className={`badge ${usuario.estado ? 'activo' : 'inactivo'}`}>
                        {usuario.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-icon edit"
                        onClick={() => handleAbrirModal(usuario)}
                        title="Editar"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleEliminar(usuario.id_usuario)}
                        title="Desactivar"
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

      {/* Modal */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={handleCerrarModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
              <button
                className="close-btn"
                onClick={handleCerrarModal}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {/* Usuario */}
              <div className="form-group-2col">
                <div>
                  <label>Usuario *</label>
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleInputChange}
                    disabled={!!usuarioEditando}
                    required
                  />
                </div>
              </div>

              {/* Contraseña */}
              {!usuarioEditando && (
                <div className="form-group-2col">
                  <div>
                    <label>Contraseña *</label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleInputChange}
                      required={!usuarioEditando}
                    />
                  </div>
                </div>
              )}

              {/* Nombres y Apellidos */}
              <div className="form-group-2col">
                <div>
                  <label>Nombres *</label>
                  <input
                    type="text"
                    name="nombres"
                    value={form.nombres}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <label>Apellidos *</label>
                  <input
                    type="text"
                    name="apellidos"
                    value={form.apellidos}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Email y Teléfono */}
              <div className="form-group-2col">
                <div>
                  <label>Email</label>
                  <input
                    type="email"
                    name="correo"
                    value={form.correo}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={form.telefono}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* CI y Dirección */}
              <div className="form-group-2col">
                <div>
                  <label>CI</label>
                  <input
                    type="text"
                    name="ci"
                    value={form.ci}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label>Dirección</label>
                  <input
                    type="text"
                    name="direccion"
                    value={form.direccion}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleCerrarModal}
                >
                  <ChevronLeft size={18} />
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {usuarioEditando ? 'Actualizar' : 'Crear'} Usuario
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsuariosPage;
