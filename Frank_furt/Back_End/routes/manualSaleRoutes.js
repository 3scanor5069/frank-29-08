// routes/manualSale.js
const express = require('express');
const router = express.Router();
const ManualSaleController = require('../controllers/manualSaleController');

// Middleware para validar datos del pedido
const validateOrderData = (req, res, next) => {
  const { idMesa, productos } = req.body;
  
  // Validar que los campos requeridos estén presentes
  if (!idMesa || !productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Datos incompletos. Se requiere idMesa y al menos un producto.'
    });
  }
  
  // Validar cada producto
  for (const producto of productos) {
    if (!producto.idProducto || !producto.cantidad || producto.cantidad <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Cada producto debe tener idProducto y cantidad válida.'
      });
    }
    
    // Validar que los valores sean números
    if (isNaN(parseInt(producto.idProducto)) || isNaN(parseInt(producto.cantidad))) {
      return res.status(400).json({
        success: false,
        error: 'idProducto y cantidad deben ser números válidos.'
      });
    }
  }
  
  // Validar que idMesa sea un número
  if (isNaN(parseInt(idMesa))) {
    return res.status(400).json({
      success: false,
      error: 'El ID de la mesa debe ser un número válido.'
    });
  }
  
  next();
};

// Middleware para validar método de pago
const validatePaymentMethod = (req, res, next) => {
  const { metodoPago } = req.body;
  const metodosValidos = ['Efectivo', 'Tarjeta', 'Transferencia', 'QR_Pago'];
  
  if (!metodoPago || !metodosValidos.includes(metodoPago)) {
    return res.status(400).json({
      success: false,
      error: `Método de pago inválido. Los métodos válidos son: ${metodosValidos.join(', ')}`
    });
  }
  
  // Validar propina si está presente
  if (req.body.propina !== undefined) {
    const propina = parseFloat(req.body.propina);
    if (isNaN(propina) || propina < 0) {
      return res.status(400).json({
        success: false,
        error: 'La propina debe ser un número válido mayor o igual a 0.'
      });
    }
  }
  
  next();
};

// Middleware para validar ID de pedido
const validatePedidoId = (req, res, next) => {
  const { idPedido } = req.params;
  
  if (!idPedido || isNaN(parseInt(idPedido))) {
    return res.status(400).json({
      success: false,
      error: 'ID de pedido inválido.'
    });
  }
  
  next();
};

// Middleware para logging de requests
const logRequest = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);
  next();
};

// Aplicar middleware de logging a todas las rutas
router.use(logRequest);

// ============= RUTAS PRINCIPALES =============

/**
 * @route   POST /api/manualSale/manual
 * @desc    Crear un nuevo pedido manual
 * @access  Private (requiere autenticación en producción)
 * @body    { idMesa: number, productos: [{ idProducto: number, cantidad: number }] }
 */
router.post('/manual', validateOrderData, ManualSaleController.crearPedidoManual);

/**
 * @route   GET /api/manualSale/pendientes
 * @desc    Obtener todos los pedidos pendientes
 * @access  Private
 */
router.get('/pendientes', ManualSaleController.obtenerPedidosPendientes);

/**
 * @route   PUT /api/manualSale/:idPedido/pagar
 * @desc    Marcar un pedido como pagado
 * @access  Private
 * @body    { metodoPago: string, propina?: number }
 */
router.put('/:idPedido/pagar', 
  validatePedidoId, 
  validatePaymentMethod, 
  ManualSaleController.marcarComoPagado
);

/**
 * @route   GET /api/manualSale/:idPedido
 * @desc    Obtener detalles de un pedido específico
 * @access  Private
 */
router.get('/:idPedido', validatePedidoId, ManualSaleController.obtenerDetallePedido);

/**
 * @route   GET /api/manualSale/mesas/disponibles
 * @desc    Obtener todas las mesas disponibles
 * @access  Private
 */
router.get('/mesas/disponibles', ManualSaleController.obtenerMesasDisponibles);

/**
 * @route   DELETE /api/manualSale/:idPedido
 * @desc    Cancelar un pedido
 * @access  Private
 * @body    { motivo?: string }
 */
router.delete('/:idPedido', validatePedidoId, ManualSaleController.cancelarPedido);

/**
 * @route   PUT /api/manualSale/:idPedido/estado
 * @desc    Actualizar el estado de un pedido
 * @access  Private
 * @body    { nuevoEstado: string }
 */
router.put('/:idPedido/estado', validatePedidoId, (req, res, next) => {
  const { nuevoEstado } = req.body;
  const estadosValidos = ['Pendiente', 'Preparando', 'Listo', 'Entregado'];
  
  if (!nuevoEstado || !estadosValidos.includes(nuevoEstado)) {
    return res.status(400).json({
      success: false,
      error: `Estado inválido. Los estados válidos son: ${estadosValidos.join(', ')}`
    });
  }
  
  next();
}, ManualSaleController.actualizarEstadoPedido);

/**
 * @route   GET /api/manualSale/reportes/resumen
 * @desc    Obtener resumen de ventas del día
 * @access  Private
 */
router.get('/reportes/resumen', ManualSaleController.obtenerResumenVentas);

// ============= MIDDLEWARE DE MANEJO DE ERRORES =============

// Middleware para manejar rutas no encontradas
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Middleware para manejar errores generales
router.use((error, req, res, next) => {
  console.error('Error en manualSale routes:', error);
  
  // Error de validación de base de datos
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      error: 'Registro duplicado'
    });
  }
  
  // Error de conexión a base de datos
  if (error.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      error: 'Servicio temporalmente no disponible'
    });
  }
  
  // Error genérico
  res.status(500).json({
    success: false,
    error: 'Error interno del servidor'
  });
});

module.exports = router;