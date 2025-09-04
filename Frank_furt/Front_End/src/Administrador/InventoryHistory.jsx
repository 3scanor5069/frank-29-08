import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Package, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import './InventoryHistory.css';

const InventoryHistory = () => {
  const [inventoryData, setInventoryData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Datos de ejemplo - aquí conectarías con tu base de datos
  const mockData = [
    {
      id: 1,
      producto: 'Salchicha Premium',
      sku: 'SPR001',
      tipo: 'entrada',
      cantidad: 100,
      stockAnterior: 50,
      stockActual: 150,
      fecha: '2024-08-28T10:30:00',
      usuario: 'Juan Pérez',
      motivo: 'Compra a proveedor',
      lote: 'L240828A'
    },
    {
      id: 2,
      producto: 'Pan para Hot Dog',
      sku: 'PHD002',
      tipo: 'salida',
      cantidad: 25,
      stockAnterior: 75,
      stockActual: 50,
      fecha: '2024-08-28T14:15:00',
      usuario: 'María García',
      motivo: 'Venta directa',
      lote: 'L240827B'
    },
    {
      id: 3,
      producto: 'Mostaza Dijon',
      sku: 'MDJ003',
      tipo: 'entrada',
      cantidad: 30,
      stockAnterior: 15,
      stockActual: 45,
      fecha: '2024-08-27T16:45:00',
      usuario: 'Carlos López',
      motivo: 'Reposición automática',
      lote: 'L240827C'
    },
    {
      id: 4,
      producto: 'Cebolla Caramelizada',
      sku: 'CCA004',
      tipo: 'salida',
      cantidad: 12,
      stockAnterior: 40,
      stockActual: 28,
      fecha: '2024-08-27T12:20:00',
      usuario: 'Ana Martínez',
      motivo: 'Uso en cocina',
      lote: 'L240826D'
    },
    {
      id: 5,
      producto: 'Queso Cheddar',
      sku: 'QCH005',
      tipo: 'entrada',
      cantidad: 80,
      stockAnterior: 20,
      stockActual: 100,
      fecha: '2024-08-26T09:10:00',
      usuario: 'Roberto Silva',
      motivo: 'Compra urgente',
      lote: 'L240826E'
    }
  ];

  // Simulación de carga de datos desde base de datos
  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    setIsLoading(true);
    // Aquí harías la llamada a tu API/base de datos
    // const response = await fetch('/api/inventory-history');
    // const data = await response.json();
    
    // Simulando delay de API
    setTimeout(() => {
      setInventoryData(mockData);
      setFilteredData(mockData);
      setIsLoading(false);
    }, 1000);
  };

  // Filtrar datos según búsqueda y filtros
  useEffect(() => {
    let filtered = inventoryData;

    // Filtro por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.usuario.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por tipo de movimiento
    if (filterType !== 'all') {
      filtered = filtered.filter(item => item.tipo === filterType);
    }

    // Filtro por fecha
    if (dateFilter) {
      filtered = filtered.filter(item =>
        item.fecha.startsWith(dateFilter)
      );
    }

    setFilteredData(filtered);
  }, [inventoryData, searchTerm, filterType, dateFilter]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMovementIcon = (tipo) => {
    return tipo === 'entrada' ? 
      <TrendingUp className="movement-icon entrada" /> : 
      <TrendingDown className="movement-icon salida" />;
  };

  return (
    <div className="inventory-history">
      <div className="header">
        <div className="title-section">
          <Package className="header-icon" />
          <h1>Historial de Inventario</h1>
          <span className="subtitle">Frank Furt - Control de Stock</span>
        </div>
        
        <button 
          className="refresh-btn"
          onClick={loadInventoryData}
          disabled={isLoading}
        >
          <RefreshCw className={`refresh-icon ${isLoading ? 'spinning' : ''}`} />
          Actualizar
        </button>
      </div>

      <div className="filters-section">
        <div className="search-box">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por producto, SKU o usuario..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-group">
          <div className="filter-item">
            <Filter className="filter-icon" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos los movimientos</option>
              <option value="entrada">Solo entradas</option>
              <option value="salida">Solo salidas</option>
            </select>
          </div>

          <div className="filter-item">
            <Calendar className="filter-icon" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="date-filter"
            />
          </div>
        </div>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-number">{inventoryData.filter(item => item.tipo === 'entrada').length}</div>
          <div className="stat-label">Entradas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{inventoryData.filter(item => item.tipo === 'salida').length}</div>
          <div className="stat-label">Salidas</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{filteredData.length}</div>
          <div className="stat-label">Registros mostrados</div>
        </div>
      </div>

      <div className="table-container">
        {isLoading ? (
          <div className="loading-state">
            <RefreshCw className="loading-spinner" />
            <p>Cargando historial...</p>
          </div>
        ) : (
          <table className="history-table">
            <thead>
              <tr>
                <th>Movimiento</th>
                <th>Producto</th>
                <th>SKU</th>
                <th>Cantidad</th>
                <th>Stock</th>
                <th>Fecha</th>
                <th>Usuario</th>
                <th>Motivo</th>
                <th>Lote</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className={`table-row ${item.tipo}`}>
                    <td className="movement-cell">
                      {getMovementIcon(item.tipo)}
                      <span className={`movement-type ${item.tipo}`}>
                        {item.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                      </span>
                    </td>
                    <td className="product-cell">{item.producto}</td>
                    <td className="sku-cell">{item.sku}</td>
                    <td className={`quantity-cell ${item.tipo}`}>
                      {item.tipo === 'entrada' ? '+' : '-'}{item.cantidad}
                    </td>
                    <td className="stock-cell">
                      <span className="stock-change">
                        {item.stockAnterior} → {item.stockActual}
                      </span>
                    </td>
                    <td className="date-cell">{formatDate(item.fecha)}</td>
                    <td className="user-cell">{item.usuario}</td>
                    <td className="reason-cell">{item.motivo}</td>
                    <td className="batch-cell">{item.lote}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="no-data">
                    No se encontraron registros con los filtros aplicados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default InventoryHistory;