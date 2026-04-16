/**
 * CU7. Página de Mi Cuenta
 * 
 * Permite:
 * - Cambiar contraseña del usuario autenticado
 * - Ver información del perfil
 * 
 * Sincronización: Conectado con la API de cambio de contraseña
 */

import { useState } from 'react';
import { cambiarContrasena } from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';
import { Lock, AlertCircle, CheckCircle } from 'lucide-react';
import '../styles/cuenta.css';

export const CuentaPage = () => {
  const { usuario } = useAuth();
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  const [form, setForm] = useState({
    contrasenaActual: '',
    contrasenaNueva: '',
    confirmacion: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setExito('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    // Validaciones
    if (!form.contrasenaActual.trim() || !form.contrasenaNueva.trim() || !form.confirmacion.trim()) {
      setError('Todos los campos son requeridos');
      return;
    }

    if (form.contrasenaNueva !== form.confirmacion) {
      setError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (form.contrasenaNueva.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setCargando(true);
    const resultado = await cambiarContrasena(
      form.contrasenaActual,
      form.contrasenaNueva,
      form.confirmacion
    );

    if (resultado.success) {
      setExito('Contraseña cambiada exitosamente');
      setForm({
        contrasenaActual: '',
        contrasenaNueva: '',
        confirmacion: ''
      });
    } else {
      setError(resultado.mensaje || 'Error al cambiar contraseña');
    }

    setCargando(false);
  };

  return (
    <div className="cuenta-container">
      <div className="cuenta-header">
        <h1>Mi Cuenta (CU7)</h1>
        <p>Gestionar información de tu perfil y seguridad</p>
      </div>

      <div className="cuenta-content">
        {/* Información de perfil */}
        <section className="perfil-section">
          <h2>Información del Perfil</h2>
          <div className="perfil-info">
            <div className="avatar-grande">
              {usuario?.nombre?.charAt(0)?.toUpperCase()}
            </div>
            <div className="info-details">
              <div className="info-row">
                <span className="label">Nombre:</span>
                <span className="valor">{usuario?.nombre}</span>
              </div>
              <div className="info-row">
                <span className="label">Usuario:</span>
                <span className="valor">{usuario?.username}</span>
              </div>
              <div className="info-row">
                <span className="label">ID de Usuario:</span>
                <span className="valor">{usuario?.id}</span>
              </div>
              <div className="info-row">
                <span className="label">Sesión iniciada:</span>
                <span className="valor">{new Date().toLocaleString('es-ES')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Cambiar contraseña */}
        <section className="cambiar-contrasena-section">
          <h2>
            <Lock size={24} />
            Cambiar Contraseña
          </h2>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {exito && (
            <div className="alert alert-success">
              <CheckCircle size={20} />
              <span>{exito}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="contrasena-form">
            <div className="form-group">
              <label htmlFor="contrasenaActual">Contraseña Actual *</label>
              <input
                id="contrasenaActual"
                type="password"
                name="contrasenaActual"
                value={form.contrasenaActual}
                onChange={handleInputChange}
                disabled={cargando}
                required
                placeholder="Ingrese su contraseña actual"
              />
            </div>

            <div className="form-group">
              <label htmlFor="contrasenaNueva">Contraseña Nueva *</label>
              <input
                id="contrasenaNueva"
                type="password"
                name="contrasenaNueva"
                value={form.contrasenaNueva}
                onChange={handleInputChange}
                disabled={cargando}
                required
                placeholder="Ingrese su contraseña nueva"
              />
              <p className="info-text">Mínimo 6 caracteres</p>
            </div>

            <div className="form-group">
              <label htmlFor="confirmacion">Confirmar Contraseña *</label>
              <input
                id="confirmacion"
                type="password"
                name="confirmacion"
                value={form.confirmacion}
                onChange={handleInputChange}
                disabled={cargando}
                required
                placeholder="Confirme su contraseña nueva"
              />
            </div>

            <button type="submit" className="btn-submit" disabled={cargando}>
              {cargando ? 'Cambiando contraseña...' : 'Cambiar Contraseña'}
            </button>
          </form>

          <div className="info-box">
            <p>
              <strong>⚠️ Importante:</strong> Por seguridad, se recomienda cambiar su contraseña regularmente.
              No comparta su contraseña con nadie.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CuentaPage;
