// routes/inventoryHistoryRoutes.js
const express = require('express');
const router = express.Router();
const inventoryHistoryController = require('../controllers/inventoryHistoryController');

// GET /api/inventario/historial - Obtener historial completo de movimientos de inventario
router.get('/historial', inventoryHistoryController.obtenerHistorialMovimientos);

// GET /api/inventario/historial/:id - Obtener historial de un producto específico (opcional)
router.get('/historial/:id', inventoryHistoryController.obtenerHistorialPorProducto);

// GET /api/inventario/historial/tipo/:tipo - Obtener historial por tipo de movimiento (opcional)
router.get('/historial/tipo/:tipo', inventoryHistoryController.obtenerHistorialPorTipo);

// GET /api/inventario/resumen - Obtener resumen de movimientos (opcional)
router.get('/resumen', inventoryHistoryController.obtenerResumenMovimientos);

module.exports = router;