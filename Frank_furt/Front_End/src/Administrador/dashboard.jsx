import React, { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, ShoppingCart, DollarSign, TrendingUp, Menu, X, Home, Package, FileText, Settings, LogOut, Bell, UtensilsCrossed, History } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import './dashboard.css';


const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  
  // Estados para los datos del dashboard
  const [metrics, setMetrics] = useState({
    totalUsers: 0,
    totalOrders: 0,
    dailyRevenue: 0,
    weeklyOrders: 0
  });
  
  const [monthlySales, setMonthlySales] = useState([]);
  const [weeklySales, setWeeklySales] = useState([]);
  const [newUsers, setNewUsers] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);

  // URLs de la API local - ajusta según tu backend
  const API_BASE_URL = 'http://localhost:3006/api/dashboard';
 // Cambia el puerto según tu configuración
  
  // Función para realizar peticiones a la API
  const fetchData = async (endpoint) => {
  try {
    const res = await fetch(`${API_BASE_URL}${endpoint}`);
    if (!res.ok) {
      const text = await res.text();
      console.error(`HTTP ${res.status} ${endpoint}:`, text);
      throw new Error(`HTTP ${res.status}`);
    }
    return await res.json();
  } catch (e) {
    console.error(`Error fetching ${endpoint}:`, e);
    throw e;
  }
};

  // Cargar datos del dashboard al montar el componente
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar métricas principales
        const metricsData = await fetchData('/metrics');
        setMetrics(metricsData);

        // Cargar datos de ventas mensuales
        const monthlySalesData = await fetchData('/monthly-sales');
        setMonthlySales(monthlySalesData);

        // Cargar datos de ventas semanales
        const weeklySalesData = await fetchData('/weekly-sales');
        setWeeklySales(weeklySalesData);

        // Cargar nuevos usuarios registrados
        const newUsersData = await fetchData('/new-users');
        setNewUsers(newUsersData);

        // Cargar productos más vendidos
        const topProductsData = await fetchData('/top-products');
        setTopProducts(topProductsData);

        // Cargar últimos usuarios registrados
        const recentUsersData = await fetchData('/recent-users');
        setRecentUsers(recentUsersData);

      } catch (error) {
        setError('Error al cargar los datos del dashboard');
        console.error('Dashboard data loading error:', error);
        
        // Datos de fallback para desarrollo
        setMetrics({
          totalUsers: 1248,
          totalOrders: 342,
          dailyRevenue: 56020,
          weeklyOrders: 164
        });
        
        setMonthlySales([
          { day: '1', ventas: 15000 },
          { day: '5', ventas: 18000 },
          { day: '10', ventas: 22000 },
          { day: '15', ventas: 19000 },
          { day: '20', ventas: 25000 },
          { day: '25', ventas: 28000 },
          { day: '30', ventas: 32000 }
        ]);
        
        setWeeklySales([
          { day: 'Lun', ventas: 4500 },
          { day: 'Mar', ventas: 5200 },
          { day: 'Mié', ventas: 4800 },
          { day: 'Jue', ventas: 6100 },
          { day: 'Vie', ventas: 7300 },
          { day: 'Sáb', ventas: 8900 },
          { day: 'Dom', ventas: 6800 }
        ]);
        
        setNewUsers([
          { semana: 'Sem 1', usuarios: 45 },
          { semana: 'Sem 2', usuarios: 52 },
          { semana: 'Sem 3', usuarios: 38 },
          { semana: 'Sem 4', usuarios: 67 }
        ]);
        
        setTopProducts([
          { name: 'Hamburguesa Clásica', value: 35, color: '#FF6B6B' },
          { name: 'Papas Fritas', value: 25, color: '#4ECDC4' },
          { name: 'Hot Dog Especial', value: 20, color: '#45B7D1' },
          { name: 'Bebidas', value: 15, color: '#96CEB4' },
          { name: 'Otros', value: 5, color: '#FFEAA7' }
        ]);
        
        setRecentUsers([
          { id: 1, name: 'Juan Pérez', email: 'juan@email.com', date: '2024-06-29', status: 'Activo' },
          { id: 2, name: 'María García', email: 'maria@email.com', date: '2024-06-29', status: 'Activo' },
          { id: 3, name: 'Carlos López', email: 'carlos@email.com', date: '2024-06-28', status: 'Activo' },
          { id: 4, name: 'Ana Martínez', email: 'ana@email.com', date: '2024-06-28', status: 'Pendiente' },
          { id: 5, name: 'Luis Rodríguez', email: 'luis@email.com', date: '2024-06-27', status: 'Activo' },
          { id: 6, name: 'Carmen Silva', email: 'carmen@email.com', date: '2024-06-27', status: 'Activo' },
          { id: 7, name: 'Pedro González', email: 'pedro@email.com', date: '2024-06-26', status: 'Activo' },
          { id: 8, name: 'Laura Díaz', email: 'laura@email.com', date: '2024-06-26', status: 'Inactivo' },
          { id: 9, name: 'Miguel Torres', email: 'miguel@email.com', date: '2024-06-25', status: 'Activo' },
          { id: 10, name: 'Sofia Herrera', email: 'sofia@email.com', date: '2024-06-25', status: 'Activo' }
        ]);
        
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Función para refrescar los datos
  const refreshData = () => {
    window.location.reload();
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true, path: '/dashboard' },
    { icon: Users, label: 'Usuarios', path: '/UsersCrud' },
    { icon: ShoppingCart, label: 'Pedidos', path: '/ManualSale' },
    { icon: UtensilsCrossed, label: 'Menú', path: '/MenuCrud' },
    { icon: Package, label: 'Inventario', path: '/InventoryCrud' },
    { icon: History, label: 'Historial de inventario', path: '/History' },
    { icon: FileText, label: 'Reportes', path: '/reports' },
    { icon: Settings, label: 'Configuración', path: '/settings' }
  ];

 const handleNavigation = (path) => {
    console.log(`Navigating to: ${path}`);
    navigate(path); 
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="logo">
          <h2 className="logo-text">🍔 Frank Furt</h2>
          <p className="logo-subtext">Panel Administrativo</p>
        </div>
        
        <nav className="nav">
          {menuItems.map((item, index) => (
            <a 
              key={index} 
              href="#" 
              className={`nav-item ${item.active ? 'nav-item-active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavigation(item.path);
              }}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </a>
          ))}
        </nav>

        <div className="sidebar-footer-dash">
          <a href="#" className="nav-item" onClick={(e) => {
            e.preventDefault();
            // Implementa logout aquí
            console.log('Logout');
          }}>
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </a>
        </div>
      </div>

      {/* Overlay para móvil */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Main Content */}
      <div className="main-content-dash">
        {/* Header-dash */}
        <header className="header-dash">
          <div className="header-left-dash">
            <button 
              className="menu-button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="title">Dashboard</h1>
          </div>
          
          <div className="header-right-dash">
            <button className="refresh-button" onClick={refreshData} title="Actualizar datos">
              <TrendingUp size={20} />
            </button>
            <Bell size={24} className="notification-icon" />
            <div className="user-info">
              <span className="user-name">Admin</span>
              <div className="user-avatar">A</div>
            </div>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={refreshData}>Reintentar</button>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon users-icon">
              <Users size={24} />
            </div>
            <div className="metric-content">
              <h3 className="metric-value">{metrics.totalUsers.toLocaleString()}</h3>
              <p className="metric-label">Usuarios Registrados</p>
              <span className="metric-change positive">+12% vs mes anterior</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon orders-icon">
              <ShoppingCart size={24} />
            </div>
            <div className="metric-content">
              <h3 className="metric-value">{metrics.totalOrders}</h3>
              <p className="metric-label">Pedidos Hoy</p>
              <span className="metric-change positive">+8% vs ayer</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon revenue-icon">
              <DollarSign size={24} />
            </div>
            <div className="metric-content">
              <h3 className="metric-value">${metrics.dailyRevenue.toLocaleString()}</h3>
              <p className="metric-label">Ingresos del Día</p>
              <span className="metric-change positive">+15% vs ayer</span>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon weekly-icon">
              <TrendingUp size={24} />
            </div>
            <div className="metric-content">
              <h3 className="metric-value">{metrics.weeklyOrders}</h3>
              <p className="metric-label">Pedidos Semana</p>
              <span className="metric-change positive">+5% vs semana anterior</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* Monthly Sales */}
          <div className="chart-card">
            <h3 className="chart-title">Ventas del Último Mes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Ventas']}
                />
                <Line 
                  type="monotone" 
                  dataKey="ventas" 
                  stroke="#4ECDC4" 
                  strokeWidth={3}
                  dot={{ fill: '#4ECDC4', strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly Sales */}
          <div className="chart-card">
            <h3 className="chart-title">Ventas de la Semana</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Ventas']}
                />
                <Bar dataKey="ventas" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* New Users */}
          <div className="chart-card">
            <h3 className="chart-title">Usuarios Nuevos (Último Mes)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={newUsers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="semana" stroke="#666" />
                <YAxis stroke="#666" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [value, 'Usuarios']}
                />
                <Bar dataKey="usuarios" fill="#45B7D1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Products */}
          <div className="chart-card">
            <h3 className="chart-title">Productos Más Vendidos</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={topProducts}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {topProducts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                  formatter={(value) => [`${value}%`, 'Porcentaje']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pie-chart-legend">
              {topProducts.map((item, index) => (
                <div key={index} className="legend-item">
                  <div className="legend-color" style={{backgroundColor: item.color}}></div>
                  <span className="legend-text">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="table-card-dash">
          <h3 className="table-title">Últimos 10 Usuarios Registrados</h3>
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr className="table-header">
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Fecha de Registro</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((user) => (
                  <tr key={user.id} className="table-row">
                    <td>{user.id}</td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.date}</td>
                    <td>
                      <span className={`status-badge status-${user.status.toLowerCase()}`}>
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;