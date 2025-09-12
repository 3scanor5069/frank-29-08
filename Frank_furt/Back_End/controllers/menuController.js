// controllers/menuController.js
const pool = require('../config/db');

// Obtener todos los productos del menú (GET /api/menu)
exports.getAllMenuItems = async (req, res) => {
  const sql = `
    SELECT
      p.idProducto, 
      p.nombre as nombreProducto, 
      p.descripcion as descripcionProducto, 
      c.nombre as categoria,
      p.precio as precio,
      p.disponible as activo,
      p.imagen_url as imagen
    FROM 
      producto p
    JOIN 
      categoria c ON p.idCategoria = c.id
    ORDER BY
      p.nombre ASC
  `;

  try {
    const [result] = await pool.query(sql);
    const menuItems = result.map(item => ({
      id: item.idProducto,
      name: item.nombreProducto,
      description: item.descripcionProducto,
      price: item.precio,
      status: item.activo === 1 ? 'Activo' : 'Inactivo',
      category: item.categoria,
      image: item.imagen || null
    }));
    res.json(menuItems);
  } catch (err) {
    console.error('Error al obtener el menú:', err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
};

// Crear un nuevo producto (POST /api/menu)
exports.createMenuItem = async (req, res) => {
  const { name, description, category, price, status, image } = req.body;
  const activo = status === 'Activo' ? 1 : 0;
  
  try {
    // Primero, encuentra el ID de la categoría por su nombre
    const [categoryResult] = await pool.query('SELECT id FROM categoria WHERE nombre = ?', [category]);
    if (categoryResult.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }
    const idCategoria = categoryResult[0].id;

    // Luego, inserta el nuevo producto en la tabla 'producto'
    const insertSql = `
      INSERT INTO producto (nombre, descripcion, precio, idCategoria, disponible, imagen_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(insertSql, [name, description, price, idCategoria, activo, image]);
    
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
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
};

// Actualizar un producto (PUT /api/menu/:id)
exports.updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, category, price, status, image } = req.body;
  const activo = status === 'Activo' ? 1 : 0;

  try {
    const [categoryResult] = await pool.query('SELECT id FROM categoria WHERE nombre = ?', [category]);
    if (categoryResult.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }
    const idCategoria = categoryResult[0].id;

    const updateSql = `
      UPDATE producto 
      SET nombre = ?, descripcion = ?, precio = ?, idCategoria = ?, disponible = ?, imagen_url = ?
      WHERE idProducto = ?
    `;
    const [result] = await pool.query(updateSql, [name, description, price, idCategoria, activo, image, id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json({ message: 'Producto actualizado exitosamente' });
  } catch (err) {
    console.error('Error al actualizar el producto:', err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
};

// Eliminar un producto (DELETE /api/menu/:id)
exports.deleteMenuItem = async (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM producto WHERE idProducto = ?`;

  try {
    const [result] = await pool.query(sql, [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json({ message: 'Producto eliminado exitosamente' });
  } catch (err) {
    console.error('Error al eliminar el producto:', err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
};