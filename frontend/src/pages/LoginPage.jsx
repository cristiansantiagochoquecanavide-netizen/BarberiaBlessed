/**
 * CU1. Página de Login - Iniciar sesión
 * 
 * Componente que permite a los usuarios iniciar sesión con
 * su nombre de usuario y contraseña.
 * 
 * Características:
 * - Validación de campos
 * - Manejo de errores
 * - Sistema de bloqueo por 3 intentos fallidos durante 5 minutos
 * - Contador visual de tiempo de bloqueo
 * - Redireccionamiento automático al dashboard después del login
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';
import { LogIn, AlertCircle, KeyRound } from 'lucide-react';
import '../styles/auth.css';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [estaBloqueado, setEstaBloqueado] = useState(false);  // Estado de bloqueo
  const [tiempoRestante, setTiempoRestante] = useState(0);    // Segundos restantes
  const navigate = useNavigate();
  const { login } = useAuth();

  // Efecto: Actualizar contador cada segundo cuando está bloqueado
  useEffect(() => {
    let intervalo;
    if (estaBloqueado && tiempoRestante > 0) {
      intervalo = setInterval(() => {
        setTiempoRestante(prev => {
          if (prev <= 1) {
            // El bloqueo terminó, desbloquear
            setEstaBloqueado(false);
            setError(''); // Limpiar error
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [estaBloqueado, tiempoRestante]);

  /**
   * Calcula minutos y segundos para mostrar en formato MM:SS
   */
  const formatearTiempo = (segundos) => {
    const minutos = Math.floor(segundos / 60);
    const segs = segundos % 60;
    return `${minutos}:${segs < 10 ? '0' : ''}${segs}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // No permitir envío si está bloqueado
    if (estaBloqueado) {
      setError(`❌ Tu cuenta está bloqueada. Intenta de nuevo en ${formatearTiempo(tiempoRestante)}`);
      return;
    }

    setCargando(true);

    // Validación básica
    if (!username.trim() || !password.trim()) {
      setError('Por favor complete todos los campos');
      setCargando(false);
      return;
    }

    // Llamar a la API
    const resultado = await loginUsuario(username, password);

    if (resultado.success) {
      // Guardar datos de sesión y redirigir
      login(resultado.usuario);
      navigate('/dashboard');
    } else {
      // Verificar si la cuenta fue bloqueada
      if (resultado.bloqueado) {
        setEstaBloqueado(true);
        setTiempoRestante(resultado.tiempo_restante || 300); // 300 segundos = 5 minutos
        setError(resultado.mensaje);
        // Limpiar campos de contraseña
        setPassword('');
      } else {
        // Mostrar error normal
        setError(resultado.mensaje || 'Error al iniciar sesión');
      }
    }

    setCargando(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Encabezado */}
        <div className="login-header">
          <div className="barber-icon">✂️</div>
          <h1>Barbería B&R</h1>
          <p>Sistema de Gestión</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Campo Usuario */}
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              disabled={cargando || estaBloqueado}
              className="form-input"
            />
          </div>

          {/* Campo Contraseña */}
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingrese su contraseña"
              disabled={cargando || estaBloqueado}
              className="form-input"
            />
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={cargando || estaBloqueado}
            className={`login-button ${estaBloqueado ? 'bloqueado' : ''}`}
          >
            {cargando ? (
              'Iniciando sesión...'
            ) : (
              <>
                <LogIn size={20} />
                Iniciar Sesión
              </>
            )}
          </button>

          {/* Mensaje de Error o Bloqueo - DESPUÉS DEL BOTÓN */}
          {error && (
            <div className={`error-message ${estaBloqueado ? 'bloqueado' : ''}`}>
              <AlertCircle size={20} />
              <div className="error-content">
                <span>{error}</span>
                {estaBloqueado && (
                  <div className="countdown">
                    <span className="tiempo-restante">{formatearTiempo(tiempoRestante)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Enlaces adicionales: Cambiar Contraseña y Recuperar Contraseña */}
          <div className="auth-links">
            <button
              type="button"
              onClick={() => navigate('/recuperar-contrasena')}
              className="link-button"
              disabled={estaBloqueado}  // Deshabilitar si está bloqueado
            >
              <KeyRound size={18} />
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </form>

        {/* Pie de página */}
        <div className="login-footer">
          <p>Sistema seguro de gestión de barbería</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
