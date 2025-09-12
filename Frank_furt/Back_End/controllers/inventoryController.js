// controllers/inventoryController.js
const pool = require('../config/db');

exports.getAllInventoryItems = async (req, res) => {
    // Esta consulta SQL une las tablas para obtener toda la información
    const sql = `
        SELECT
            p.idProducto, 
            p.nombre as nombreProducto, 
            p.descripcion as descripcionProducto, 
            c.nombre as categoria,
            p.precio as precioUnitario,
            p.disponible as estado,
            p.imagen_url as imagen,
            i.stockDisponible as stock,
            i.stock_minimo as stock_minimo,
            i.stock_maximo as stock_maximo
        FROM 
            producto p
        JOIN 
            categoria c ON p.idCategoria = c.id
        LEFT JOIN 
            inventario i ON p.idProducto = i.idProducto
        ORDER BY
            p.nombre ASC
    `;

    try {
        const [items] = await pool.query(sql);
        res.json(items);
    } catch (error) {
        console.error('Error en el controlador (getAllInventoryItems):', error);
        res.status(500).json({ 
            error: 'Error del servidor al obtener el inventario.',
            details: error.message
        });
    }
};

exports.createInventoryItem = async (req, res) => {
 try {
  const newItem = await inventoryService.createInventoryItem(req.body);
  res.status(201).json(newItem);
 } catch (error) {
  console.error('Error en el controlador (createInventoryItem):', error);
  res.status(500).json({ error: 'Error del servidor al crear el producto en inventario.' });
 }
};

exports.updateInventoryItem = async (req, res) => {
 const { idInventario } = req.params;
 try {
  const result = await inventoryService.updateInventoryItem(idInventario, req.body);
  if (result.affectedRows === 0) {
   return res.status(404).json({ error: 'Producto de inventario no encontrado.' });
  }
  res.json({ message: 'Producto de inventario actualizado con éxito.' });
 } catch (error) {
  console.error('Error en el controlador (updateInventoryItem):', error);
  res.status(500).json({ error: 'Error del servidor al actualizar el producto de inventario.' });
 }
};

exports.deleteInventoryItem = async (req, res) => {
 const { idInventario } = req.params;
 try {
  const result = await inventoryService.deleteInventoryItem(idInventario);
  if (result.affectedRows === 0) {
 return res.status(404).json({ error: 'Producto de inventario no encontrado.' });
  }
  es.json({ message: 'Producto de inventario eliminado con éxito.' });
 } catch (error) {
  onsole.error('Error en el controlador (deleteInventoryItem):', error); 
 res.status(500).json({ error: 'Error del servidor al eliminar el producto de inventario.' });
 }
};