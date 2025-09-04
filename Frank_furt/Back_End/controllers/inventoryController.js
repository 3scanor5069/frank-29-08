// En la carpeta controllers
const inventoryService = require('../services/inventoryService');

exports.getAllInventoryItems = async (req, res) => {
 try {
  const items = await inventoryService.getAllInventoryItems();
  res.json(items);
 } catch (error) {
  console.error('Error en el controlador (getAllInventoryItems):', error);
  res.status(500).json({ error: 'Error del servidor al obtener el inventario.' });
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