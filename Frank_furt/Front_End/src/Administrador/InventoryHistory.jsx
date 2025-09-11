import React, { useState, useEffect } from 'react';
import './InventoryHistory.css';

const InventoryHistory = () => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [busquedaProducto, setBusquedaProducto] = useState('');

  // Cargar historial al montar el componente
  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch('/api/inventoryHystory');
      
      if (!response.ok) {
        throw new Error('Error al cargar el historial');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setHistorial(data.data);
      } else {
        setError(data.error || 'Error al cargar el historial');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar historial según los criterios
  const historialFiltrado = historial.filter(movimiento => {
    const cumpleTipo = filtroTipo === 'todos' || movimiento.tipo === filtroTipo;
    const cumpleFecha = !filtroFecha || movimiento.fecha.startsWith(filtroFecha);
    const cumpleProducto = !busquedaProducto || 
      movimiento.nombreProducto.toLowerCase().includes(busquedaProducto.toLowerCase());
    
    return cumpleTipo && cumpleFecha && cumpleProducto;
  });

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerClaseTipo = (tipo) => {
    return tipo === 'entrada' ? 'tipo-entrada' : 'tipo-salida';
  };

  const obtenerIconoTipo = (tipo) => {
    return tipo === 'entrada' ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className="inventory-history-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Cargando historial de inventario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-history-container">
      <div className="inventory-history-header">
        <h1>Historial de Movimientos de Inventario</h1>
        <p>Registro completo de entradas y salidas de productos</p>
      </div>

      {error && (
        <div className="error-message">
          <span>⚠️ {error}</span>
          <button onClick={cargarHistorial} className="btn-retry">
            Reintentar
          </button>
        </div>
      )}

      <div className="filters-section">
        <div className="filter-group">
          <label htmlFor="filtro-tipo">Tipo de Movimiento:</label>
          <select
            id="filtro-tipo"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="todos">Todos</option>
            <option value="entrada">Entradas</option>
            <option value="salida">Salidas</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="filtro-fecha">Fecha:</label>
          <input
            type="date"
            id="filtro-fecha"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="busqueda-producto">Buscar Producto:</label>
          <input
            type="text"
            id="busqueda-producto"
            placeholder="Nombre del producto..."
            value={busquedaProducto}
            onChange={(e) => setBusquedaProducto(e.target.value)}
          />
        </div>

        <button 
          className="btn-limpiar-filtros"
          onClick={() => {
            setFiltroTipo('todos');
            setFiltroFecha('');
            setBusquedaProducto('');
          }}
        >
          Limpiar Filtros
        </button>
      </div>

      <div className="summary-cards">
        <div className="summary-card entradas">
          <div className="card-icon">↑</div>
          <div className="card-content">
            <h3>Total Entradas</h3>
            <p>{historialFiltrado.filter(m => m.tipo === 'entrada').length}</p>
          </div>
        </div>
        
        <div className="summary-card salidas">
          <div className="card-icon">↓</div>
          <div className="card-content">
            <h3>Total Salidas</h3>
            <p>{historialFiltrado.filter(m => m.tipo === 'salida').length}</p>
          </div>
        </div>
        
        <div className="summary-card total">
          <div className="card-icon">📊</div>
          <div className="card-content">
            <h3>Total Movimientos</h3>
            <p>{historialFiltrado.length}</p>
          </div>
        </div>
      </div>

      <div className="table-container">
        {historialFiltrado.length === 0 ? (
          <div className="no-data">
            <p>No se encontraron movimientos con los filtros aplicados</p>
          </div>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Producto</th>
                <th>Tipo</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {historialFiltrado.map((movimiento) => (
                <tr key={movimiento.idMovimiento} className={obtenerClaseTipo(movimiento.tipo)}>
                  <td className="fecha-cell">
                    {formatearFecha(movimiento.fecha)}
                  </td>
                  <td className="producto-cell">
                    <strong>{movimiento.nombreProducto}</strong>
                  </td>
                  <td className="tipo-cell">
                    <span className={`tipo-badge ${obtenerClaseTipo(movimiento.tipo)}`}>
                      {obtenerIconoTipo(movimiento.tipo)} {movimiento.tipo.charAt(0).toUpperCase() + movimiento.tipo.slice(1)}
                    </span>
                  </td>
                  <td className="cantidad-cell">
                    <span className={`cantidad ${obtenerClaseTipo(movimiento.tipo)}`}>
                      {movimiento.tipo === 'entrada' ? '+' : '-'}{movimiento.cantidad}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="table-footer">
        <p>
          Mostrando {historialFiltrado.length} de {historial.length} movimientos
        </p>
        <button onClick={cargarHistorial} className="btn-refresh">
          🔄 Actualizar
        </button>
      </div>
    </div>
  );
};

export default InventoryHistory;