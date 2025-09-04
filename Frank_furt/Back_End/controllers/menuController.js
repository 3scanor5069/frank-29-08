// controllers/menuController.js
const pool = require('../config/db');

// Obtener todos los productos del menú (GET /api/menu)
exports.getAllMenuItems = async (req, res) => {
  const sql = `
    SELECT 
      idMenu, 
      nombre, 
      descripcion, 
      categoria,
      activo,
      precio,
      imagen
    FROM 
      menu
  `;

  try {
    const [result] = await pool.query(sql);
    // Mapea los resultados a la estructura que espera el frontend
    const menuItems = result.map(item => ({
      id: item.idMenu,
      name: item.nombre,
      description: item.descripcion,
      price: item.precio,
      status: item.activo === 1 ? 'Activo' : 'Inactivo', // Convierte el campo `activo` a un string
      category: item.categoria,
      image: item.imagen || '/api/placeholder/100/80'
    }));
    res.json(menuItems);
  } catch (err) {
    console.error('Error al obtener el menú:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear un nuevo producto (POST /api/menu)
exports.createMenuItem = async (req, res) => {
  const { name, description, category, price, status, image } = req.body;
  const activo = status === 'Activo' ? 1 : 0;
  const sql = `
    INSERT INTO menu (nombre, descripcion, categoria, activo, precio, imagen)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await pool.query(sql, [name, description, category, activo, price, image]);
    const newMenuItem = {
      id: result.insertId,
      name,
      description,
      category,
      price,
      status,
      image
    };
    res.status(201).json(newMenuItem);
  } catch (err) {
    console.error('Error al crear el producto:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar un producto (PUT /api/menu/:id)
exports.updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, status, image } = req.body;
  const activo = status === 'Activo' ? 1 : 0;
  const sql = `
    UPDATE menu 
    SET nombre = ?, descripcion = ?, categoria = ?, activo = ?, precio = ?, imagen = ?
    WHERE idMenu = ?
  `;

  try {
    const [result] = await pool.query(sql, [name, description, category, activo, price, image, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json({ id: parseInt(id), ...req.body });
  } catch (err) {
    console.error('Error al actualizar el producto:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar un producto (DELETE /api/menu/:id)
exports.deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM menu WHERE idMenu = ?`;

  try {
    const [result] = await pool.query(sql, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar el producto:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};