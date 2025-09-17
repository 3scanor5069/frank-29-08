// controllers/inventoryController.js
const db = require("../config/db");

// Obtener todo el inventario
exports.getInventory = (req, res) => {
  db.query("SELECT * FROM inventario", (err, results) => {
    if (err) return res.status(500).json({ error: "Error al obtener inventario" });
    res.json(results);
  });
};

// Crear un producto
exports.createInventory = (req, res) => {
  const { nombre, categoria, precio_unitario, proveedor, idSede, stockDisponible, stock_minimo, stock_maximo } = req.body;
  db.query(
    "INSERT INTO inventario (nombre, categoria, precio_unitario, proveedor, idSede, stockDisponible, stock_minimo, stock_maximo) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [nombre, categoria, precio_unitario, proveedor, idSede, stockDisponible, stock_minimo, stock_maximo],
    (err, result) => {
      if (err) return res.status(500).json({ error: "Error al crear producto" });
      res.json({ idInventario: result.insertId, ...req.body });
    }
  );
};

// Actualizar un producto
exports.updateInventory = (req, res) => {
  const { id } = req.params;
  const { nombre, categoria, precio_unitario, proveedor, idSede, stockDisponible, stock_minimo, stock_maximo } = req.body;
  db.query(
    "UPDATE inventario SET nombre=?, categoria=?, precio_unitario=?, proveedor=?, idSede=?, stockDisponible=?, stock_minimo=?, stock_maximo=? WHERE idInventario=?",
    [nombre, categoria, precio_unitario, proveedor, idSede, stockDisponible, stock_minimo, stock_maximo, id],
    (err) => {
      if (err) return res.status(500).json({ error: "Error al actualizar producto" });
      res.json({ idInventario: id, ...req.body });
    }
  );
};

// Eliminar un producto
exports.deleteInventory = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM inventario WHERE idInventario=?", [id], (err) => {
    if (err) return res.status(500).json({ error: "Error al eliminar producto" });
    res.json({ message: "Producto eliminado" });
  });
};
