import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Filter, Download } from 'lucide-react';
import './MenuCrud.css';

const MenuCrud = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Principales',
    price: '',
    description: '',
    status: 'Activo',
    image: ''
  });

  const categories = ['Todos', 'Principales', 'Acompañamientos', 'Bebidas', 'Postres'];

  // 🔹 Obtener productos del backend
  useEffect(() => {
    fetch("http://localhost:3006/api/menu")
      .then(res => res.json())
      .then(data => setMenuItems(data))
      .catch(err => console.error('Error al cargar menú:', err));
  }, []);

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 🔹 Crear / Actualizar producto
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await fetch(`http://localhost:3006/api/menu/:id`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch('http://localhost:3006/api/menu', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      // Recargar productos
      const res = await fetch('http://localhost:3006/api/menu');
      const data = await res.json();
      setMenuItems(data);
      handleCloseModal();
    } catch (err) {
      console.error('Error al guardar producto:', err);
    }
  };

  // 🔹 Editar producto
  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price.toString(),
      description: item.description,
      status: item.status,
      image: item.image || ''
    });
    setShowModal(true);
  };

  // 🔹 Eliminar producto
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
      try {
        await fetch(`http://localhost:3006/api/menu/:id`, { method: 'DELETE' });
        setMenuItems(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error('Error al eliminar producto:', err);
      }
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
      status: 'Activo',
      image: ''
    });
  };

  // 🔹 Exportar CSV
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
                    <img src={item.image || '/api/placeholder/100/80'} alt={item.name} className="product-image" />
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
              <div className="form-group">
                <label>Imagen (URL)</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  placeholder="https://..."
                />
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
