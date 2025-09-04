import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, Download } from 'lucide-react';
import './MenuCrud.css';

const MenuCrud = () => {
  const [menuItems, setMenuItems] = useState([
    {
      id: 1,
      name: 'Frank Clásico',
      category: 'Principales',
      price: 12500,
      description: 'Salchicha premium con cebolla caramelizada y mostaza especial',
      status: 'Activo',
      image: '/api/placeholder/100/80'
    },
    {
      id: 2,
      name: 'Frank Supremo',
      category: 'Principales',
      price: 15000,
      description: 'Salchicha artesanal con queso cheddar, bacon y salsa BBQ',
      status: 'Activo',
      image: '/api/placeholder/100/80'
    },
    {
      id: 3,
      name: 'Papas Deluxe',
      category: 'Acompañamientos',
      price: 8500,
      description: 'Papas crujientes con queso derretido y cebollín',
      status: 'Activo',
      image: '/api/placeholder/100/80'
    },
    {
      id: 4,
      name: 'Frank Veggie',
      category: 'Principales',
      price: 13000,
      description: 'Salchicha vegetal con aguacate y vegetales frescos',
      status: 'Inactivo',
      image: '/api/placeholder/100/80'
    },
    {
      id: 5,
      name: 'Refresco Cola',
      category: 'Bebidas',
      price: 4500,
      description: 'Bebida refrescante 350ml',
      status: 'Activo',
      image: '/api/placeholder/100/80'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Principales',
    price: '',
    description: '',
    status: 'Activo'
  });

  const categories = ['Todos', 'Principales', 'Acompañamientos', 'Bebidas', 'Postres'];

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingItem) {
      setMenuItems(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData, price: parseInt(formData.price) }
          : item
      ));
    } else {
      const newItem = {
        id: Date.now(),
        ...formData,
        price: parseInt(formData.price),
        image: '/api/placeholder/100/80'
      };
      setMenuItems(prev => [...prev, newItem]);
    }
    handleCloseModal();
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description,
      status: item.status
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      setMenuItems(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'Principales',
      price: '',
      description: '',
      status: 'Activo'
    });
  };

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Nombre', 'Categoría', 'Precio', 'Descripción', 'Estado'],
      ...menuItems.map(item => [
        item.id,
        item.name,
        item.category,
        item.price,
        item.description,
        item.status
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'menu_frank_furt.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="menu-crud">
      <div className="-dash">
        <div className="header-title-invent">
          <h1>Gestión de Menú</h1>
          <p>Administra los productos de Frank Furt</p>
        </div>
        <div className="header-actions-invent">
          <button className="btn-export" onClick={handleExport}>
            <Download size={20} />
            Exportar CSV
          </button>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={20} />
            Agregar Producto
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="search-container">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-container">
          <Filter size={20} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-container">
        <table className="menu-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>
                  <div className="product-info">
                    <img src={item.image} alt={item.name} className="product-image" />
                    <div>
                      <div className="product-name">{item.name}</div>
                      <div className="product-description">{item.description}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`category-badge category-${item.category.toLowerCase()}`}>
                    {item.category}
                  </span>
                </td>
                <td className="price">${item.price.toLocaleString()}</td>
                <td>
                  <span className={`status-badge status-${item.status.toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    <button className="btn-action btn-edit" onClick={() => handleEdit(item)}>
                      <Edit size={16} />
                    </button>
                    <button className="btn-action btn-delete" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-invent">
              <h2>{editingItem ? 'Editar Producto' : 'Agregar Producto'}</h2>
              <button className="modal-close" onClick={handleCloseModal}>×</button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Nombre del producto"
                />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Principales">Principales</option>
                  <option value="Acompañamientos">Acompañamientos</option>
                  <option value="Bebidas">Bebidas</option>
                  <option value="Postres">Postres</option>
                </select>
              </div>
              <div className="form-group">
                <label>Precio</label>
                <input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="Precio en pesos"
                />
              </div>
              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Descripción del producto"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="button" className="btn-primary" onClick={handleSubmit}>
                  {editingItem ? 'Actualizar' : 'Agregar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuCrud;