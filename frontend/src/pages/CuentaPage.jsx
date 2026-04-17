/**
 * CU7. Página de Mi Cuenta
 * 
 * Permite:
 * - Ver información del perfil
 * - Cambiar contraseña con validaciones robustas de seguridad
 * 
 * Validaciones de contraseña:
 * - Mínimo 8 caracteres
 * - 1 mayúscula (A-Z), 1 minúscula (a-z), 1 número (0-9)
 * - 1 carácter especial (@, #, $, %, !, &, *, etc.)
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

  // Estado para validaciones de contraseña en tiempo real
  const [validaciones, setValidaciones] = useState({
    longitud: false,        // 8+ caracteres
    mayuscula: false,       // A-Z
    minuscula: false,       // a-z
    numero: false,          // 0-9
    especial: false         // @, #, $, %, etc.
  });

  /**
   * Valida que la contraseña cumpla con todos los requisitos de seguridad
   * Utiliza expresiones regulares (regex) para verificar cada criterio
   * 
   * Criterios:
   * 1. Mínimo 8 caracteres
   * 2. Al menos 1 mayúscula (A-Z)
   * 3. Al menos 1 minúscula (a-z)
   * 4. Al menos 1 número (0-9)
   * 5. Al menos 1 carácter especial (@, #, $, %, !, &, *)
   */
  const validarContrasenaNueva = (contrasena) => {
    // Validación 1: Longitud mínima de 8 caracteres
    const tieneMinimo8 = contrasena.length >= 8;
    
    // Validación 2: Al menos 1 mayúscula (expres. regular: /[A-Z]/)
    const tieneMayuscula = /[A-Z]/.test(contrasena);
    
    // Validación 3: Al menos 1 minúscula (expresión regular: /[a-z]/)
    const tieneMinuscula = /[a-z]/.test(contrasena);
    
    // Validación 4: Al menos 1 número (expresión regular: /[0-9]/)
    const tieneNumero = /[0-9]/.test(contrasena);
    
    // Validación 5: Al menos 1 carácter especial (@, #, $, %, !, &, *, etc.)
    // Expresión regular incluye caracteres permitidos: [@#$%!&*\-_=+\[\]{};:'",./<>?\\`~^|]
    const tieneEspecial = /[@#$%!&*\-_=+\[\]{};:'",./<>?\\`~^|]/.test(contrasena);
    
    // Actualizar estados de validación para mostrar visualmente al usuario
    setValidaciones({
      longitud: tieneMinimo8,
      mayuscula: tieneMayuscula,
      minuscula: tieneMinuscula,
      numero: tieneNumero,
      especial: tieneEspecial
    });
    
    // Retornar true si todas las validaciones pasaron
    return tieneMinimo8 && tieneMayuscula && tieneMinuscula && tieneNumero && tieneEspecial;
  };

  /**
   * Maneja cambios en los inputs del formulario
   * Valida en tiempo real la contraseña nueva
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Si es la contraseña nueva, validar en tiempo real
    if (name === 'contrasenaNueva') {
      validarContrasenaNueva(value);
    }
    
    // Limpiar mensajes de error y éxito
    setError('');
    setExito('');
  };

  /**
   * Envía el formulario de cambio de contraseña
   * Primero valida localmente, luego envía al backend
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setExito('');

    // Validación 1: Campos requeridos no vacíos
    if (!form.contrasenaActual.trim() || !form.contrasenaNueva.trim() || !form.confirmacion.trim()) {
      setError('Todos los campos son requeridos');
      return;
    }

    // Validación 2: Las nuevas contraseñas coinciden
    if (form.contrasenaNueva !== form.confirmacion) {
      setError('Las nuevas contraseñas no coinciden');
      return;
    }

    // Validación 3: La nueva contraseña cumple con requisitos de seguridad
    const esValida = validarContrasenaNueva(form.contrasenaNueva);
    if (!esValida) {
      setError('La contraseña no cumple con los requisitos de seguridad. Verifica los criterios arriba.');
      return;
    }

    // Enviar solicitud al backend Django
    setCargando(true);
    const resultado = await cambiarContrasena(
      form.contrasenaActual,
      form.contrasenaNueva,
      form.confirmacion
    );

    if (resultado.success) {
      // Éxito: mostrar mensaje y limpiar formulario
      setExito('✓ Contraseña cambiada exitosamente');
      setForm({
        contrasenaActual: '',
        contrasenaNueva: '',
        confirmacion: ''
      });
      // Limpiar validaciones visuales
      setValidaciones({
        longitud: false,
        mayuscula: false,
        minuscula: false,
        numero: false,
        especial: false
      });
    } else {
      // Error: mostrar mensaje del backend
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
            Cambiar Contraseña (CU7)
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
            {/* Campo: Contraseña Actual */}
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
                className="form-input"
              />
            </div>

            {/* Campo: Contraseña Nueva */}
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
                className="form-input"
              />
              
              {/* Validaciones de seguridad mostrando requisitos en tiempo real */}
              {form.contrasenaNueva && (
                <div className="validaciones-container">
                  <p className="validaciones-titulo">Requisitos de seguridad:</p>
                  
                  {/* Requisito 1: Longitud */}
                  <div className={`validacion-item ${validaciones.longitud ? 'valido' : 'invalido'}`}>
                    <span className="icono">{validaciones.longitud ? '✓' : '✗'}</span>
                    <span>Mínimo 8 caracteres</span>
                  </div>
                  
                  {/* Requisito 2: Mayúscula */}
                  <div className={`validacion-item ${validaciones.mayuscula ? 'valido' : 'invalido'}`}>
                    <span className="icono">{validaciones.mayuscula ? '✓' : '✗'}</span>
                    <span>Contiene mayúscula (A-Z)</span>
                  </div>
                  
                  {/* Requisito 3: Minúscula */}
                  <div className={`validacion-item ${validaciones.minuscula ? 'valido' : 'invalido'}`}>
                    <span className="icono">{validaciones.minuscula ? '✓' : '✗'}</span>
                    <span>Contiene minúscula (a-z)</span>
                  </div>
                  
                  {/* Requisito 4: Número */}
                  <div className={`validacion-item ${validaciones.numero ? 'valido' : 'invalido'}`}>
                    <span className="icono">{validaciones.numero ? '✓' : '✗'}</span>
                    <span>Contiene número (0-9)</span>
                  </div>
                  
                  {/* Requisito 5: Carácter especial */}
                  <div className={`validacion-item ${validaciones.especial ? 'valido' : 'invalido'}`}>
                    <span className="icono">{validaciones.especial ? '✓' : '✗'}</span>
                    <span>Contiene carácter especial (@, #, $, %, !, &, *, etc.)</span>
                  </div>
                </div>
              )}
            </div>

            {/* Campo: Confirmar Contraseña */}
            <div className="form-group">
              <label htmlFor="confirmacion">Confirmar Contraseña Nueva *</label>
              <input
                id="confirmacion"
                type="password"
                name="confirmacion"
                value={form.confirmacion}
                onChange={handleInputChange}
                disabled={cargando}
                required
                placeholder="Confirme su contraseña nueva"
                className="form-input"
              />
              
              {/* Indicador visual de coincidencia */}
              {form.confirmacion && (
                <div className={`coincidencia ${form.contrasenaNueva === form.confirmacion ? 'match' : 'nomatch'}`}>
                  {form.contrasenaNueva === form.confirmacion ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                </div>
              )}
            </div>

            {/* Botón de envío */}
            <button 
              type="submit" 
              className="btn-submit" 
              disabled={cargando || !Object.values(validaciones).every(v => v)}
            >
              {cargando ? '⏳ Cambiando contraseña...' : '🔒 Cambiar Contraseña'}
            </button>
          </form>

          {/* Información de seguridad */}
          <div className="info-box">
            <p>
              <strong>⚠️ Información importante:</strong><br/>
              • Por seguridad, se recomienda cambiar su contraseña cada 3 meses<br/>
              • Utilice contraseñas únicas que no use en otros servicios<br/>
              • No comparta su contraseña con nadie<br/>
              • Una buena contraseña incluye mayúsculas, minúsculas, números y caracteres especiales
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CuentaPage;
