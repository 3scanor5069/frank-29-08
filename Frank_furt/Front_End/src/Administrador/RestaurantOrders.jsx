import React, { useState, useEffect } from 'react';
import './RestaurantOrders.css';

const RestaurantOrders = () => {
  const [orders, setOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [filter, setFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Estados para el formulario
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    items: [],
    notes: '',
    status: 'pending'
  });

  // Datos de ejemplo del menú
  const menuItems = [
    { id: 1, name: 'Hamburguesa Clásica', price: 15000 },
    { id: 2, name: 'Hamburguesa Royal', price: 18000 },
    { id: 3, name: 'Hot Dog Frankfurt', price: 12000 },
    { id: 4, name: 'Papas Fritas', price: 8000 },
    { id: 5, name: 'Bebida Gaseosa', price: 5000 },
    { id: 6, name: 'Combo Frank Especial', price: 25000 }
  ];

  // Datos de ejemplo iniciales
  const initialOrders = [
    {
      id: 1,
      customerName: 'Juan Pérez',
      phone: '300-123-4567',
      items: [
        { id: 1, name: 'Hamburguesa Clásica', quantity: 2, price: 15000 },
        { id: 4, name: 'Papas Fritas', quantity: 1, price: 8000 }
      ],
      status: 'pending',
      total: 38000,
      orderTime: new Date().toISOString(),
      notes: 'Sin cebolla en las hamburguesas'
    },
    {
      id: 2,
      customerName: 'María González',
      phone: '301-987-6543',
      items: [
        { id: 6, name: 'Combo Frank Especial', quantity: 1, price: 25000 },
        { id: 5, name: 'Bebida Gaseosa', quantity: 2, price: 5000 }
      ],
      status: 'preparing',
      total: 35000,
      orderTime: new Date(Date.now() - 30 * 60000).toISOString(),
      notes: 'Entrega a domicilio'
    },
    {
      id: 3,
      customerName: 'Carlos Rodríguez',
      phone: '302-555-1234',
      items: [
        { id: 2, name: 'Hamburguesa Royal', quantity: 1, price: 18000 },
        { id: 4, name: 'Papas Fritas', quantity: 2, price: 8000 }
      ],
      status: 'completed',
      total: 34000,
      orderTime: new Date(Date.now() - 60 * 60000).toISOString(),
      notes: ''
    }
  ];

  // Simulación de carga de datos desde base de datos
  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      // Aquí iría la llamada real a la API/base de datos
      // const response = await fetch('/api/orders');
      // const data = await response.json();
      // setOrders(data);
      
      // Simulación de delay de red
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOrders(initialOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
    setIsLoading(false);
  };

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  // Abrir modal para nuevo pedido
  const openNewOrderModal = () => {
    setEditingOrder(null);
    setFormData({
      customerName: '',
      phone: '',
      items: [],
      notes: '',
      status: 'pending'
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar pedido
  const openEditModal = (order) => {
    setEditingOrder(order);
    setFormData({
      customerName: order.customerName,
      phone: order.phone,
      items: [...order.items],
      notes: order.notes || '',
      status: order.status
    });
    setIsModalOpen(true);
  };

  // Ver detalles del pedido
  const viewOrderDetails = (order) => {
    setViewingOrder(order);
  };

  // Cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setViewingOrder(null);
    setEditingOrder(null);
  };

  // Manejar cambios en el formulario
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Agregar item al pedido
  const addItemToOrder = (menuItem) => {
    const existingItem = formData.items.find(item => item.id === menuItem.id);
    if (existingItem) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: [...prev.items, { ...menuItem, quantity: 1 }]
      }));
    }
  };

  // Actualizar cantidad de item
  const updateItemQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        items: prev.items.map(item =>
          item.id === itemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      }));
    }
  };

  // Calcular total del pedido
  const calculateTotal = (items) => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Guardar pedido
  const saveOrder = async () => {
    if (!formData.customerName || !formData.phone || formData.items.length === 0) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const orderData = {
      ...formData,
      total: calculateTotal(formData.items),
      orderTime: editingOrder ? editingOrder.orderTime : new Date().toISOString()
    };

    try {
      if (editingOrder) {
        // Actualizar pedido existente
        // await fetch(`/api/orders/${editingOrder.id}`, {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(orderData)
        // });
        
        setOrders(prev => prev.map(order =>
          order.id === editingOrder.id
            ? { ...orderData, id: editingOrder.id }
            : order
        ));
      } else {
        // Crear nuevo pedido
        // const response = await fetch('/api/orders', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(orderData)
        // });
        // const newOrder = await response.json();
        
        const newOrder = {
          ...orderData,
          id: Math.max(...orders.map(o => o.id), 0) + 1
        };
        
        setOrders(prev => [newOrder, ...prev]);
      }

      closeModal();
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Error al guardar el pedido');
    }
  };

  // Actualizar estado del pedido
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // await fetch(`/api/orders/${orderId}/status`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ status: newStatus })
      // });

      setOrders(prev => prev.map(order =>
        order.id === orderId
          ? { ...order, status: newStatus }
          : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  // Eliminar pedido
  const deleteOrder = async (orderId) => {
    if (('¿Está seguro de que desea eliminar este pedido?')) return;

    try {
      // await fetch(`/api/orders/${orderId}`, { method: 'DELETE' });
      setOrders(prev => prev.filter(order => order.id !== orderId));
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-CO');
  };

  // Formatear precio
  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(price);
  };

  // Obtener clase de estado
  const getStatusClass = (status) => {
    const statusClasses = {
      pending: 'status-pending',
      preparing: 'status-preparing',
      ready: 'status-ready',
      completed: 'status-completed',
      cancelled: 'status-cancelled'
    };
    return statusClasses[status] || '';
  };

  // Obtener texto de estado
  const getStatusText = (status) => {
    const statusTexts = {
      pending: 'Pendiente',
      preparing: 'Preparando',
      ready: 'Listo',
      completed: 'Completado',
      cancelled: 'Cancelado'
    };
    return statusTexts[status] || status;
  };

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Cargando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <div className="crown">👑</div>
            <h1>FRANK FURT</h1>
            <p>Sistema de Pedidos</p>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="toolbar">
          <button className="btn btn-primary" onClick={openNewOrderModal}>
            <span className="icon">+</span>
            Nuevo Pedido
          </button>
          
          <div className="filters">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">Todos los pedidos</option>
              <option value="pending">Pendientes</option>
              <option value="preparing">Preparando</option>
              <option value="ready">Listos</option>
              <option value="completed">Completados</option>
            </select>
          </div>
        </div>

        <div className="orders-grid">
          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <p>No hay pedidos {filter !== 'all' ? `en estado "${getStatusText(filter)}"` : 'disponibles'}</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <h3>Pedido #{order.id}</h3>
                  <span className={`status ${getStatusClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                
                <div className="order-info">
                  <p><strong>Cliente:</strong> {order.customerName}</p>
                  <p><strong>Teléfono:</strong> {order.phone}</p>
                  <p><strong>Fecha:</strong> {formatDate(order.orderTime)}</p>
                  <p><strong>Total:</strong> {formatPrice(order.total)}</p>
                </div>

                <div className="order-actions">
                  <button 
                    className="btn btn-secondary btn-small"
                    onClick={() => viewOrderDetails(order)}
                  >
                    Ver
                  </button>
                  <button 
                    className="btn btn-outline btn-small"
                    onClick={() => openEditModal(order)}
                  >
                    Editar
                  </button>
                  {order.status !== 'completed' && (
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pendiente</option>
                      <option value="preparing">Preparando</option>
                      <option value="ready">Listo</option>
                      <option value="completed">Completado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal para crear/editar pedido */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingOrder ? 'Editar Pedido' : 'Nuevo Pedido'}</h2>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); saveOrder(); }}>
                <div className="form-group">
                  <label>Nombre del Cliente *</label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Teléfono *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Productos</label>
                  <div className="menu-items">
                    {menuItems.map(item => (
                      <div key={item.id} className="menu-item">
                        <span>{item.name} - {formatPrice(item.price)}</span>
                        <button
                          type="button"
                          className="btn btn-small btn-outline"
                          onClick={() => addItemToOrder(item)}
                        >
                          Agregar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {formData.items.length > 0 && (
                  <div className="form-group">
                    <label>Items del Pedido</label>
                    <div className="order-items">
                      {formData.items.map(item => (
                        <div key={item.id} className="order-item">
                          <span>{item.name}</span>
                          <div className="quantity-controls">
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <span>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="order-total">
                        <strong>Total: {formatPrice(calculateTotal(formData.items))}</strong>
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label>Notas</label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows="3"
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingOrder ? 'Actualizar' : 'Crear'} Pedido
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver detalles */}
      {viewingOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Detalles del Pedido #{viewingOrder.id}</h2>
              <button className="btn-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="order-details">
                <div className="detail-group">
                  <label>Cliente:</label>
                  <span>{viewingOrder.customerName}</span>
                </div>
                
                <div className="detail-group">
                  <label>Teléfono:</label>
                  <span>{viewingOrder.phone}</span>
                </div>
                
                <div className="detail-group">
                  <label>Fecha:</label>
                  <span>{formatDate(viewingOrder.orderTime)}</span>
                </div>
                
                <div className="detail-group">
                  <label>Estado:</label>
                  <span className={`status ${getStatusClass(viewingOrder.status)}`}>
                    {getStatusText(viewingOrder.status)}
                  </span>
                </div>
                
                <div className="detail-group">
                  <label>Items:</label>
                  <div className="items-list">
                    {viewingOrder.items.map(item => (
                      <div key={item.id} className="item-detail">
                        <span>{item.name}</span>
                        <span>x{item.quantity}</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {viewingOrder.notes && (
                  <div className="detail-group">
                    <label>Notas:</label>
                    <span>{viewingOrder.notes}</span>
                  </div>
                )}
                
                <div className="detail-group total">
                  <label>Total:</label>
                  <span className="total-amount">{formatPrice(viewingOrder.total)}</span>
                </div>
              </div>
              
              <div className="modal-actions">
                <button className="btn btn-outline" onClick={closeModal}>
                  Cerrar
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    closeModal();
                    openEditModal(viewingOrder);
                  }}
                >
                  Editar Pedido
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantOrders;