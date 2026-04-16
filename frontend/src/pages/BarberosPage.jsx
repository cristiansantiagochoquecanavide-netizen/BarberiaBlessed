/**
 * CU5. Página de Gestión de Barberos
 * 
 * Permite:
 * - Listar todos los barberos
 * - Crear nuevos barberos
 * - Editar información de barberos
 * - Desactivar barberos
 * 
 * Sincronización: Conectado con la tabla Persona (es_barbero=True) del backend
 */

import { useState, useEffect } from 'react';
import {
  listarBarberos,
  crearBarbero,
  actualizarBarbero,
  eliminarBarbero
} from '../api/apiClient';
import { Plus, Edit2, Trash2, ChevronLeft, AlertCircle, Star } from 'lucide-react';
import '../styles/crud.css';

export const BarberosPage = () => {
  const [barberos, setBarberos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [barberaEditando, setBarberaEditando] = useState(null);

  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    correo: '',
    telefono: '',
    ci: '',
    direccion: '',
    especialidad: ''
  });

  useEffect(() => {
    cargarBarberos();
  }, []);

  const cargarBarberos = async () => {
    setCargando(true);
    setError('');
    const resultado = await listarBarberos();
    if (resultado.success) {
      setBarberos(resultado.barberos || []);
    } else {
      setError('Error al cargar barberos');
    }
    setCargando(false);
  };

  const handleAbrirModal = (barbero = null) => {
    if (barbero) {
      setBarberaEditando(barbero);
      setForm({
        nombres: barbero.nombres,
        apellidos: barbero.apellidos,
        correo: barbero.correo,
        telefono: barbero.telefono,
        ci: barbero.ci,
        direccion: barbero.direccion,
        especialidad: barbero.especialidad
      });
    } else {
      setBarberaEditando(null);
      setForm({
        nombres: '',
        apellidos: '',
        correo: '',
        telefono: '',
        ci: '',
        direccion: '',
        especialidad: ''
      });
    }
    setModalAbierto(true);
  };

  const handleCerrarModal = () => {
    setModalAbierto(false);
    setBarberaEditando(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.nombres.trim() || !form.apellidos.trim()) {
      setError('Los nombres y apellidos son requeridos');
      return;
    }

    let resultado;
    if (barberaEditando) {
      resultado = await actualizarBarbero(barberaEditando.id_persona, form);
    } else {
      resultado = await crearBarbero(form);
    }

    if (resultado.success) {
      handleCerrarModal();
      cargarBarberos();
    } else {
      setError(resultado.mensaje || 'Error al guardar barbero');
    }
  };

  const handleEliminar = async (barberoId) => {
    if (window.confirm('¿Desactivar este barbero?')) {
      const resultado = await eliminarBarbero(barberoId);
      if (resultado.success) {
        cargarBarberos();
      } else {
        setError(resultado.mensaje || 'Error al eliminar barbero');
      }
    }
  };

  return (
    <div className="crud-container">
      <div className="crud-header">
        <div className="header-left">
          <h1>Gestión de Barberos (CU5)</h1>
          <p>Administrar información del personal de barberos</p>
        </div>
        <button className="btn-primary" onClick={() => handleAbrirModal()}>
          <Plus size={20} />
          Nuevo Barbero
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
          <div className="loading">Cargando barberos...</div>
        ) : barberos.length === 0 ? (
          <div className="empty-state">
            <p>No hay barberos registrados</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Especialidad</th>
                  <th>Calificación</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {barberos.map((barbero) => (
                  <tr key={barbero.id_persona}>
                    <td>{barbero.nombres} {barbero.apellidos}</td>
                    <td>{barbero.especialidad || 'General'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            fill={i < Math.round(parseFloat(barbero.calificacion_promedio)) ? '#ffc107' : '#ddd'}
                            color={i < Math.round(parseFloat(barbero.calificacion_promedio)) ? '#ffc107' : '#ddd'}
                          />
                        ))}
                        <span style={{ fontSize: '12px', color: '#666', marginLeft: '4px' }}>
                          {barbero.calificacion_promedio}
                        </span>
                      </div>
                    </td>
                    <td className="font-mono">{barbero.telefono || '-'}</td>
                    <td>
                      <span className={`badge ${barbero.estado ? 'activo' : 'inactivo'}`}>
                        {barbero.estado ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="actions">
                      <button
                        className="btn-icon edit"
                        onClick={() => handleAbrirModal(barbero)}
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        className="btn-icon delete"
                        onClick={() => handleEliminar(barbero.id_persona)}
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
              <h2>{barberaEditando ? 'Editar Barbero' : 'Nuevo Barbero'}</h2>
              <button className="close-btn" onClick={handleCerrarModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group-2col">
                <div>
                  <label>Nombres *</label>
                  <input
                    type="text"
                    value={form.nombres}
                    onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label>Apellidos *</label>
                  <input
                    type="text"
                    value={form.apellidos}
                    onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group-2col">
                <div>
                  <label>Especialidad</label>
                  <input
                    type="text"
                    value={form.especialidad}
                    onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
                    placeholder="Ej: Cortes tradicionales"
                  />
                </div>
                <div>
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    value={form.telefono}
                    onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-2col">
                <div>
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.correo}
                    onChange={(e) => setForm({ ...form, correo: e.target.value })}
                  />
                </div>
                <div>
                  <label>CI</label>
                  <input
                    type="text"
                    value={form.ci}
                    onChange={(e) => setForm({ ...form, ci: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-2col">
                <div>
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={form.direccion}
                    onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={handleCerrarModal}>
                  <ChevronLeft size={18} />
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {barberaEditando ? 'Actualizar' : 'Crear'} Barbero
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarberosPage;
