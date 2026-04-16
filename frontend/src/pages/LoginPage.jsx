/**
 * CU1. Página de Login - Iniciar sesión
 * 
 * Componente que permite a los usuarios iniciar sesión con
 * su nombre de usuario y contraseña.
 * 
 * Características:
 * - Validación de campos
 * - Manejo de errores
 * - Redireccionamiento automático al dashboard después del login
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUsuario } from '../api/apiClient';
import { useAuth } from '../hooks/useAuth';
import { LogIn, AlertCircle } from 'lucide-react';
import '../styles/auth.css';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
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
      setError(resultado.mensaje || 'Error al iniciar sesión');
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
          {/* Error */}
          {error && (
            <div className="error-message">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Campo Usuario */}
          <div className="form-group">
            <label htmlFor="username">Usuario</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Ingrese su usuario"
              disabled={cargando}
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
              disabled={cargando}
              className="form-input"
            />
          </div>

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={cargando}
            className="login-button"
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
