// controllers/menuController.js
const pool = require('../config/db');

// Obtener todos los productos del menú
exports.getAllMenuItems = async (req, res) => {
  const sql = `
    SELECT
      p.idProducto, 
      p.nombre AS nombreProducto, 
      p.descripcion AS descripcionProducto, 
      p.precio,
      p.disponible,
      p.imagen_url,
      c.nombre AS categoria,
      m.nombre AS menu
    FROM producto p
    JOIN categoria c ON p.idCategoria = c.id
    JOIN menu m ON p.idMenu = m.idMenu
    ORDER BY p.nombre ASC
  `;

  try {
    const [result] = await pool.query(sql);
    const menuItems = result.map(item => ({
      id: item.idProducto,
      name: item.nombreProducto,
      description: item.descripcionProducto,
      price: item.precio,
      status: item.disponible === 1 ? 'Activo' : 'Inactivo',
      category: item.categoria,
      menu: item.menu,
      image: item.imagen_url || null
    }));
    res.json(menuItems);
  } catch (err) {
    console.error('Error al obtener el menú:', err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
};

// Crear un nuevo producto
exports.createMenuItem = async (req, res) => {
  const { name, description, category, menu, price, status, image } = req.body;
  const activo = status === 'Activo' ? 1 : 0;

  try {
    const [categoryResult] = await pool.query('SELECT id FROM categoria WHERE nombre = ?', [category]);
    if (categoryResult.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }
    const idCategoria = categoryResult[0].id;

    const [menuResult] = await pool.query('SELECT idMenu FROM menu WHERE nombre = ?', [menu]);
    if (menuResult.length === 0) {
      return res.status(404).json({ error: 'Menú no encontrado.' });
    }
    const idMenu = menuResult[0].idMenu;

    const insertSql = `
      INSERT INTO producto (nombre, descripcion, precio, idCategoria, idMenu, disponible, imagen_url)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await pool.query(insertSql, [name, description, price, idCategoria, idMenu, activo, image]);

    res.status(201).json({
      id: result.insertId,
      name,
      description,
      category,
      menu,
      price,
      status,
      image
    });
  } catch (err) {
    console.error('Error al crear el producto:', err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
};

// Actualizar un producto
exports.updateMenuItem = async (req, res) => {
  const { id } = req.params;
  const { name, description, category, menu, price, status, image } = req.body;
  const activo = status === 'Activo' ? 1 : 0;

  try {
    const [categoryResult] = await pool.query('SELECT id FROM categoria WHERE nombre = ?', [category]);
    if (categoryResult.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada.' });
    }
    const idCategoria = categoryResult[0].id;

    const [menuResult] = await pool.query('SELECT idMenu FROM menu WHERE nombre = ?', [menu]);
    if (menuResult.length === 0) {
      return res.status(404).json({ error: 'Menú no encontrado.' });
    }
    const idMenu = menuResult[0].idMenu;

    const updateSql = `
      UPDATE producto 
      SET nombre = ?, descripcion = ?, precio = ?, idCategoria = ?, idMenu = ?, disponible = ?, imagen_url = ?
      WHERE idProducto = ?
    `;
    const [result] = await pool.query(updateSql, [name, description, price, idCategoria, idMenu, activo, image, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.status(200).json({ message: 'Producto actualizado exitosamente' });
  } catch (err) {
    console.error('Error al actualizar el producto:', err);
    res.status(500).json({ error: 'Error interno del servidor', details: err.message });
  }
};

// Eliminar un producto
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
