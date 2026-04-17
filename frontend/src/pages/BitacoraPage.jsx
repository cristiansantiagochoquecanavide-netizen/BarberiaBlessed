/**
 * CU6. Página de Consulta de Bitácora
 * 
 * Permite:
 * - Ver todos los registros de auditoría del sistema
 * - Filtrar por usuario, acción, tabla afectada, fecha
 * - Ver detalles completos de cada acción realizada
 * 
 * Sincronización: Conectado con la tabla Bitacora del backend
 */

import { useState, useEffect } from 'react';
import { consultarBitacora } from '../api/apiClient';
import { Search, Filter, AlertCircle } from 'lucide-react';
import '../styles/bitacora.css';

export const BitacoraPage = () => {
  const [registros, setRegistros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [estadisticas, setEstadisticas] = useState(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    accion: '',
    tabla_afectada: '',
    fecha_inicio: '',
    fecha_fin: '',
    pagina: 1
  });

  useEffect(() => {
    cargarBitacora();
  }, [filtros]);

  const cargarBitacora = async () => {
    setCargando(true);
    setError('');

    // Limpiar filtros vacíos
    const filtrosFinal = {};
    Object.keys(filtros).forEach(key => {
      if (filtros[key] && key !== 'pagina') {
        filtrosFinal[key] = filtros[key];
      }
    });

    const resultado = await consultarBitacora({ ...filtrosFinal, pagina: filtros.pagina });

    if (resultado.success) {
      setRegistros(resultado.bitacoras || []);
      if (resultado.estadisticas) {
        setEstadisticas(resultado.estadisticas);
      }
    } else {
      setError(resultado.mensaje || 'Error al cargar bitácora');
    }

    setCargando(false);
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value,
      pagina: 1 // Resetear paginación al filtrar
    }));
  };

  const limpiarFiltros = () => {
    setFiltros({
      accion: '',
      tabla_afectada: '',
      fecha_inicio: '',
      fecha_fin: '',
      pagina: 1
    });
  };

  // Mapeo de tipos de acción a colores
  const getColorAccion = (accion) => {
    switch (accion) {
      case 'LOGIN':
        return 'success';
      case 'LOGOUT':
        return 'info';
      case 'CREATE':
        return 'success';
      case 'UPDATE':
        return 'warning';
      case 'DELETE':
        return 'error';
      case 'INTENTO_FALLIDO':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <div className="bitacora-container">
      {/* Encabezado */}
      <div className="bitacora-header">
        <div className="header-left">
          <h1>Consultar Bitácora (CU6)</h1>
          <p>Auditoría completa del sistema - Registro de todas las operaciones</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="filtros-section">
        <div className="filtros-title">
          <Filter size={20} />
          <span>Filtros</span>
        </div>

        <div className="filtros-grid">
          <div className="filtro-input">
            <label>Tipo de Acción</label>
            <select
              name="accion"
              value={filtros.accion}
              onChange={handleFiltroChange}
            >
              <option value="">Todas las acciones</option>
              <option value="LOGIN">Login</option>
              <option value="LOGOUT">Logout</option>
              <option value="CREATE">Crear</option>
              <option value="UPDATE">Actualizar</option>
              <option value="DELETE">Eliminar</option>
             <option value="INTENTO_FALLIDO">Intento fallido</option>
              <option value="CAMBIO_CONTRASENA">Cambio de contraseña</option>
            </select>
          </div>

          <div className="filtro-input">
            <label>Tabla Afectada</label>
            <select
              name="tabla_afectada"
              value={filtros.tabla_afectada}
              onChange={handleFiltroChange}
            >
              <option value="">Todas las tablas</option>
              <option value="usuario">Usuario</option>
              <option value="persona">Persona</option>
              <option value="rol">Rol</option>
            </select>
          </div>

          <div className="filtro-input">
            <label>Desde</label>
            <input
              type="date"
              name="fecha_inicio"
              value={filtros.fecha_inicio}
              onChange={handleFiltroChange}
            />
          </div>

          <div className="filtro-input">
            <label>Hasta</label>
            <input
              type="date"
              name="fecha_fin"
              value={filtros.fecha_fin}
              onChange={handleFiltroChange}
            />
          </div>
        </div>

        <button className="btn-limpiar" onClick={limpiarFiltros}>
          Limpiar Filtros
        </button>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="estadisticas-section">
          <div className="stat-card">
            <h4>Total de Registros</h4>
            <p className="stat-value">{estadisticas.total_registros}</p>
          </div>
          <div className="stat-card">
            <h4>Página Actual</h4>
            <p className="stat-value">{estadisticas.pagina_actual} de {estadisticas.paginas_totales}</p>
          </div>
          <div className="stat-card">
            <h4>Acciones Principales</h4>
            <ul className="stat-list">
              {estadisticas.acciones_por_tipo?.slice(0, 3).map((accion, idx) => (
                <li key={idx}>{accion.tipo_accion}: {accion.cantidad}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="error-box">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Tabla de registros */}
      <div className="bitacora-content">
        {cargando ? (
          <div className="loading">Cargando bitácora...</div>
        ) : registros.length === 0 ? (
          <div className="empty-state">
            <p>No hay registros que coincidan con los filtros</p>
          </div>
        ) : (
          <div className="registros-list">
            {registros.map((registro) => (
              <div key={registro.id_bitacora} className="registro-card">
                <div className="registro-header">
                  <div className="registro-id">ID: <span className="id-bitacora">{registro.id_bitacora}</span></div>
                  <div className="registro-action">
                    <span className={`badge-accion ${getColorAccion(registro.accion.tipo)}`}>
                      {registro.accion.tipo}
                    </span>
                    <span className="tabla-afectada">
                      {registro.accion.tabla_afectada}
                    </span>
                  </div>
                  <div className="registro-fecha">
                    {new Date(registro.fecha_hora).toLocaleString('es-ES')}
                  </div>
                </div>

                <div className="registro-body">
                  <div className="usuario-info">
                    <span className="usuario-label">Usuario:</span>
                    <strong>{registro.usuario.nombre_completo}</strong>
                    <span className="usuario-username">(@{registro.usuario.username})</span>
                  </div>

                  {registro.usuario.tipos && registro.usuario.tipos.length > 0 && (
                    <div className="tipos-usuario">
                      {registro.usuario.tipos.map((tipo, idx) => (
                        <span key={idx} className="tipo-badge">
                          {tipo}
                        </span>
                      ))}
                    </div>
                  )}

                  {registro.accion.descripcion && (
                    <div className="descripcion">
                      <strong>Descripción:</strong> {registro.accion.descripcion}
                    </div>
                  )}
                </div>

                {registro.roles && (
                  <div className="registro-roles">
                    <strong>Roles:</strong> {registro.roles.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BitacoraPage;
