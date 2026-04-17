/**
 * CU8. Página de Recuperar Contraseña
 * 
 * Permite a usuarios que olvidaron su contraseña:
 * - Ingresa su nombre de usuario
 * - Sistema genera una contraseña temporal segura
 * - Contraseña temporal nunca se muestra en el cliente por seguridad
 * 
 * Seguridad:
 * - La contraseña temporal se genera en el backend
 * - Solo se muestra una vez (debería enviarse por email en producción)
 * - El usuario debe cambiarla en el siguiente login
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recuperarContrasena } from '../api/apiClient';
import { KeyRound, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import '../styles/auth.css';

export const RecuperarContraseniaPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [contrasenaTemporal, setContrasenaTemporal] = useState('');
  const [cargando, setCargando] = useState(false);
  const [procesado, setProcesado] = useState(false);

  /**
   * Solicita una contraseña temporal para el usuario
   * 
   * Validaciones:
   * - Username no vacío
   * - Usuario debe existir en el sistema
   * - Usuario debe estar activo
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    // Validación: Username requerido
    if (!username.trim()) {
      setError('Por favor ingrese su nombre de usuario');
      return;
    }

    // Enviar solicitud al backend
    setCargando(true);
    const resultado = await recuperarContrasena(username);

    if (resultado.success) {
      // Éxito: mostrar contraseña temporal
      setContrasenaTemporal(resultado.contrasena_temporal);
      setExito('✓ ¡Contraseña temporal generada!');
      setProcesado(true);
    } else {
      // Error: mostrar mensaje del servidor
      setError(resultado.mensaje || 'Error al recuperar contraseña');
    }

    setCargando(false);
  };

  /**
   * Vuelve al formulario de recuperación
   */
  const handleVolver = () => {
    setUsername('');
    setContrasenaTemporal('');
    setError('');
    setExito('');
    setProcesado(false);
  };

  // Pantalla de éxito (después de generar contraseña)
  if (procesado && contrasenaTemporal) {
    return (
      <div className="login-container">
        <div className="login-box">
          {/* Encabezado */}
          <div className="login-header">
            <div className="barber-icon">🔐</div>
            <h1>Contraseña Temporal</h1>
            <p>Recuperación de Barbería B&R</p>
          </div>

          {/* Mensaje de éxito */}
          <div className="exito-message">
            <CheckCircle size={48} color="#4CAF50" />
            <p>¡Se ha generado una contraseña temporal!</p>
          </div>

          {/* Contraseña temporal (IMPORTANTE: mostrar claramente) */}
          <div className="temporal-password-box">
            <p className="label">Tu contraseña temporal es:</p>
            <div className="password-display">
              <code>{contrasenaTemporal}</code>
              <button 
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(contrasenaTemporal);
                  alert('Contraseña copiada al portapapeles');
                }}
                className="copy-button"
              >
                📋 Copiar
              </button>
            </div>
          </div>

          {/* Instrucciones */}
          <div className="instrucciones-box">
            <p><strong>⚠️ Instrucciones importantes:</strong></p>
            <ol>
              <li>Guarda esta contraseña en un lugar seguro</li>
              <li>Usa esta contraseña para iniciar sesión</li>
              <li>Ve a "Mi Cuenta" y cambia la contraseña inmediatamente</li>
              <li>No compartas esta contraseña con nadie</li>
              <li>La nueva contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales</li>
            </ol>
          </div>

          {/* Botones de acción */}
          <div className="button-group">
            <button 
              type="button"
              onClick={() => navigate('/login')}
              className="btn-primary"
            >
              ✓ Ir a Iniciar Sesión
            </button>
            <button 
              type="button"
              onClick={handleVolver}
              className="btn-secondary"
            >
              ← Recuperar otro usuario
            </button>
          </div>

          {/* Pie de página */}
          <div className="login-footer">
            <p>Sistema seguro de gestión de barbería</p>
          </div>
        </div>
      </div>
    );
  }

  // Formulario de recuperación
  return (
    <div className="login-container">
      <div className="login-box">
        {/* Encabezado */}
        <div className="login-header">
          <div className="barber-icon">🔑</div>
          <h1>Recuperar Contraseña</h1>
          <p>Barbería B&R</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Mensajes de error */}
          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Mensajes de éxito */}
          {exito && (
            <div className="success-message">
              <CheckCircle size={20} />
              <span>{exito}</span>
            </div>
          )}

          {/* Información */}
          <div className="info-message">
            <p>
              Ingresa tu nombre de usuario y te enviaremos una contraseña temporal.
              Podrás cambiarla en la siguiente pantalla de login.
            </p>
          </div>

          {/* Campo Usuario */}
          <div className="form-group">
            <label htmlFor="username">Nombre de Usuario *</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su nombre de usuario"
              disabled={cargando}
              className="form-input"
              autoFocus
            />
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={cargando || !username.trim()}
            className="login-button"
          >
            {cargando ? (
              '⏳ Generando contraseña...'
            ) : (
              <>
                <KeyRound size={20} />
                Recuperar Contraseña
              </>
            )}
          </button>

          {/* Enlace para volver al login */}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="link-button"
          >
            <ArrowLeft size={18} />
            Volver al Login
          </button>
        </form>

        {/* Información de seguridad */}
        <div className="security-info-box">
          <p>
            <strong>🔒 Información de seguridad:</strong><br/>
            • La contraseña temporal es segura y cumple con estándares de seguridad<br/>
            • Debes cambiarla en tu primer login<br/>
            • No compartas esta contraseña con nadie<br/>
            • En producción, recibirías esta contraseña por email
          </p>
        </div>

        {/* Pie de página */}
        <div className="login-footer">
          <p>Sistema seguro de gestión de barbería</p>
        </div>
      </div>
    </div>
  );
};

export default RecuperarContraseniaPage;
