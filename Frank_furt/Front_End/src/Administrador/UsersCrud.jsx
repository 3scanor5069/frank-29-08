import React, { useState, useEffect } from 'react';
import { Search, Edit, Trash2, Download, Eye, Filter, X, Save, UserPlus, Users, UserCheck, UserX, Clock } from 'lucide-react';
import axios from 'axios';
import './UsersCrud.css';

const API_BASE_URL = 'http://localhost:3006/api/users'; // Ajusta el puerto según tu backend

const UsersCRUD = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [currentUser, setCurrentUser] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    hobby: '', // Este campo no se guarda en la DB por ahora
    status: 'active'
  });

  // Función para obtener los datos de la API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(API_BASE_URL);
      setUsers(response.data);
    } catch (err) {
      setError('Error al cargar los usuarios. Por favor, intente de nuevo más tarde.');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrar y buscar usuarios
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.location && user.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Ordenar usuarios
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return 0;
    
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    
    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  // Paginación
  const totalPages = Math.ceil(sortedUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = sortedUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleCreate = () => {
    setModalMode('create');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      hobby: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setModalMode('edit');
    setCurrentUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      location: user.location,
      hobby: user.hobby,
      status: user.status
    });
    setShowModal(true);
  };

  const handleView = (user) => {
    setModalMode('view');
    setCurrentUser(user);
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este usuario?')) {
      try {
        await axios.delete(`${API_BASE_URL}/${userId}`);
        setUsers(users.filter(user => user.id !== userId));
      } catch (err) {
        setError('Error al eliminar el usuario. Intente de nuevo.');
        console.error('Error deleting user:', err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (modalMode === 'create') {
        const response = await axios.post(API_BASE_URL, formData);
        setUsers([...users, response.data]);
      } else if (modalMode === 'edit') {
        const response = await axios.put(`${API_BASE_URL}/${currentUser.id}`, formData);
        setUsers(users.map(user => 
          user.id === currentUser.id 
            ? { ...user, ...response.data }
            : user
        ));
      }
      setShowModal(false);
    } catch (err) {
      setError('Error al guardar el usuario. Verifique los datos.');
      console.error('Error saving user:', err);
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['ID', 'Nombre', 'Apellido', 'Email', 'Teléfono', 'Ubicación', 'Hobby', 'Estado', 'Fecha Creación'];
    const csvContent = [
      headers.join(','),
      ...filteredUsers.map(user => [
        user.id,
        `"${user.firstName}"`,
        `"${user.lastName}"`,
        user.email,
        `"${user.phone}"`,
        `"${user.location}"`,
        `"${user.hobby}"`,
        user.status,
        user.dateCreated
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { label: 'Activo', icon: UserCheck, className: 'status-active' },
      inactive: { label: 'Inactivo', icon: UserX, className: 'status-inactive' },
      pending: { label: 'Pendiente', icon: Clock, className: 'status-pending' }
    };
    
    const config = statusConfig[status];
    const Icon = config.icon;
    
    return (
      <span className={`status-badge ${config.className}`}>
        <Icon size={14} />
        {config.label}
      </span>
    );
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        {pages}
        <button
          className="pagination-btn"
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-message-container">
        <p className="error-message">{error}</p>
        <button onClick={fetchUsers}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="crud-container">
      {/* Header */}
      <div className="crud-header">
        <div className="header-content">
          <div className="header-left">
            <div className="header-icon">
              <Users size={32} />
            </div>
            <div>
              <h1 className="page-title">Gestión de Usuarios</h1>
              <p className="page-subtitle">Administra y gestiona todos los usuarios del sistema</p>
            </div>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={handleCreate}>
              <UserPlus size={20} />
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <Users size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{users.length}</div>
            <div className="stat-label">Total Usuarios</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon active">
            <UserCheck size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{users.filter(u => u.status === 'active').length}</div>
            <div className="stat-label">Activos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{users.filter(u => u.status === 'pending').length}</div>
            <div className="stat-label">Pendientes</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon filtered">
            <Filter size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-number">{filteredUsers.length}</div>
            <div className="stat-label">Resultados</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="crud-toolbar">
        <div className="toolbar-left">
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Buscar usuarios por nombre, email o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-container">
            <Filter className="filter-icon" size={18} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos los estados</option>
              <option value="active">Activos</option>
              <option value="inactive">Inactivos</option>
              {/* <option value="pending">Pendientes</option> */} {/* Tu DB no tiene 'pending' para clientes */}
            </select>
          </div>
        </div>

        <div className="toolbar-right">
          <button className="btn btn-secondary" onClick={handleDownloadCSV}>
            <Download size={18} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('id')} className="sortable">
                  ID {sortConfig.key === 'id' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th>Usuario</th>
                <th onClick={() => handleSort('email')} className="sortable">
                  Email {sortConfig.key === 'email' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th>Teléfono</th>
                <th onClick={() => handleSort('location')} className="sortable">
                  Ubicación {sortConfig.key === 'location' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th>Hobby</th>
                <th onClick={() => handleSort('status')} className="sortable">
                  Estado {sortConfig.key === 'status' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                </th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map(user => (
                  <tr key={user.id} className="table-row">
                    <td className="user-id">#{user.id}</td>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">{user.avatar}</div>
                        <div className="user-details">
                          <div className="user-name">{user.firstName} {user.lastName}</div>
                          <div className="user-date">Registrado: {user.dateCreated}</div>
                        </div>
                      </div>
                    </td>
                    <td className="user-email">{user.email}</td>
                    <td className="user-phone">{user.phone}</td>
                    <td className="user-location">{user.location}</td>
                    <td className="user-hobby">{user.hobby}</td>
                    <td>{getStatusBadge(user.status)}</td>
                    <td>
                      <div className="actions-container">
                        <button 
                          className="action-btn view-btn" 
                          onClick={() => handleView(user)}
                          title="Ver detalles"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className="action-btn edit-btn" 
                          onClick={() => handleEdit(user)}
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="action-btn delete-btn" 
                          onClick={() => handleDelete(user.id)}
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="empty-state">
                      <div className="empty-icon">
                        <Users size={64} />
                      </div>
                      <h3>No se encontraron usuarios</h3>
                      <p>Intenta ajustar tus filtros de búsqueda o crear un nuevo usuario.</p>
                      <button className="btn btn-primary" onClick={handleCreate}>
                        <UserPlus size={20} />
                        Crear primer usuario
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {renderPagination()}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {modalMode === 'create' && (
                  <>
                    <UserPlus size={24} />
                    Crear Nuevo Usuario
                  </>
                )}
                {modalMode === 'edit' && (
                  <>
                    <Edit size={24} />
                    Editar Usuario
                  </>
                )}
                {modalMode === 'view' && (
                  <>
                    <Eye size={24} />
                    Detalles del Usuario
                  </>
                )}
              </h2>
              <button 
                className="modal-close" 
                onClick={() => setShowModal(false)}
              >
                <X size={24} />
              </button>
            </div>

            {modalMode === 'view' ? (
              <div className="modal-body">
                <div className="user-profile">
                  <div className="profile-avatar">
                    {currentUser.avatar}
                  </div>
                  <div className="profile-info">
                    <h3>{currentUser.firstName} {currentUser.lastName}</h3>
                    {getStatusBadge(currentUser.status)}
                  </div>
                </div>
                
                <div className="user-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">ID:</span>
                    <span className="detail-value">#{currentUser.id}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{currentUser.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Teléfono:</span>
                    <span className="detail-value">{currentUser.phone}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Ubicación:</span>
                    <span className="detail-value">{currentUser.location}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Hobby:</span>
                    <span className="detail-value">{currentUser.hobby}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Fecha de Registro:</span>
                    <span className="detail-value">{currentUser.dateCreated}</span>
                  </div>
                </div>
              </div>
            ) : (
              <form className="modal-body" onSubmit={handleSubmit}>
                <div className="form-container">
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName" className="form-label">Nombre *</label>
                      <input
                        type="text"
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        required
                        className="form-input"
                        placeholder="Ingresa el nombre"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName" className="form-label">Apellido *</label>
                      <input
                        type="text"
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        required
                        className="form-input"
                        placeholder="Ingresa el apellido"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email" className="form-label">Email *</label>
                      <input
                        type="email"
                        id="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        required
                        className="form-input"
                        placeholder="correo@ejemplo.com"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="phone" className="form-label">Teléfono</label>
                      <input
                        type="tel"
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="form-input"
                        placeholder="123-456-7890"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="location" className="form-label">Ubicación</label>
                      <input
                        type="text"
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="form-input"
                        placeholder="Ciudad, País"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="hobby" className="form-label">Hobby</label>
                      <input
                        type="text"
                        id="hobby"
                        value={formData.hobby}
                        onChange={(e) => setFormData({...formData, hobby: e.target.value})}
                        className="form-input"
                        placeholder="Pasatiempo favorito"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="status" className="form-label">Estado</label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="form-select"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                      {/* <option value="pending">Pendiente</option> */}
                    </select>
                  </div>
                </div>

                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowModal(false)}
                  >
                    <X size={18} />
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                  >
                    <Save size={18} />
                    {modalMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersCRUD;