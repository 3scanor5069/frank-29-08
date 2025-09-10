// controllers/inventoryHistoryController.js
const db = require('../config/database'); // Asume que tienes configurada la conexión a MySQL

const inventoryHistoryController = {
  // Obtener historial completo de movimientos de inventario
  obtenerHistorialMovimientos: async (req, res) => {
    try {
      const query = `
        SELECT 
          im.idMovimiento,
          im.tipo,
          im.cantidad,
          im.fecha,
          p.nombre as nombreProducto,
          p.idProducto,
          i.idInventario
        FROM inventario_movimientos im
        INNER JOIN inventario i ON im.idInventario = i.idInventario
        INNER JOIN producto p ON i.idProducto = p.idProducto
        ORDER BY im.fecha DESC, im.idMovimiento DESC
      `;

      const [movimientos] = await db.execute(query);

      res.json({
        success: true,
        message: 'Historial de movimientos obtenido exitosamente',
        data: movimientos,
        total: movimientos.length
      });

    } catch (error) {
      console.error('Error al obtener historial de movimientos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor al obtener el historial',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obtener historial de movimientos de un producto específico
  obtenerHistorialPorProducto: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'ID de producto inválido'
        });
      }

      const query = `
        SELECT 
          im.idMovimiento,
          im.tipo,
          im.cantidad,
          im.fecha,
          p.nombre as nombreProducto,
          p.idProducto,
          i.idInventario
        FROM inventario_movimientos im
        INNER JOIN inventario i ON im.idInventario = i.idInventario
        INNER JOIN producto p ON i.idProducto = p.idProducto
        WHERE p.idProducto = ?
        ORDER BY im.fecha DESC, im.idMovimiento DESC
      `;

      const [movimientos] = await db.execute(query, [id]);

      if (movimientos.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'No se encontraron movimientos para este producto'
        });
      }

      res.json({
        success: true,
        message: `Historial del producto obtenido exitosamente`,
        data: movimientos,
        total: movimientos.length
      });

    } catch (error) {
      console.error('Error al obtener historial por producto:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor al obtener el historial del producto'
      });
    }
  },

  // Obtener historial por tipo de movimiento (entrada/salida)
  obtenerHistorialPorTipo: async (req, res) => {
    try {
      const { tipo } = req.params;

      // Validar que el tipo sea válido
      if (!tipo || !['entrada', 'salida'].includes(tipo.toLowerCase())) {
        return res.status(400).json({
          success: false,
          error: 'Tipo de movimiento inválido. Debe ser "entrada" o "salida"'
        });
      }

      const query = `
        SELECT 
          im.idMovimiento,
          im.tipo,
          im.cantidad,
          im.fecha,
          p.nombre as nombreProducto,
          p.idProducto,
          i.idInventario
        FROM inventario_movimientos im
        INNER JOIN inventario i ON im.idInventario = i.idInventario
        INNER JOIN producto p ON i.idProducto = p.idProducto
        WHERE im.tipo = ?
        ORDER BY im.fecha DESC, im.idMovimiento DESC
      `;

      const [movimientos] = await db.execute(query, [tipo.toLowerCase()]);

      res.json({
        success: true,
        message: `Movimientos de tipo "${tipo}" obtenidos exitosamente`,
        data: movimientos,
        total: movimientos.length,
        filtro: {
          tipo: tipo.toLowerCase()
        }
      });

    } catch (error) {
      console.error('Error al obtener historial por tipo:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor al obtener el historial por tipo'
      });
    }
  },

  // Obtener resumen de movimientos (estadísticas)
  obtenerResumenMovimientos: async (req, res) => {
    try {
      // Consulta para obtener resumen por tipo
      const queryResumen = `
        SELECT 
          im.tipo,
          COUNT(*) as totalMovimientos,
          SUM(im.cantidad) as totalCantidad
        FROM inventario_movimientos im
        GROUP BY im.tipo
      `;

      // Consulta para obtener movimientos recientes (últimos 7 días)
      const queryRecientes = `
        SELECT 
          im.idMovimiento,
          im.tipo,
          im.cantidad,
          im.fecha,
          p.nombre as nombreProducto
        FROM inventario_movimientos im
        INNER JOIN inventario i ON im.idInventario = i.idInventario
        INNER JOIN producto p ON i.idProducto = p.idProducto
        WHERE im.fecha >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY im.fecha DESC
        LIMIT 10
      `;

      // Consulta para obtener productos más movidos
      const queryProductosActivos = `
        SELECT 
          p.nombre as nombreProducto,
          p.idProducto,
          COUNT(im.idMovimiento) as totalMovimientos,
          SUM(CASE WHEN im.tipo = 'entrada' THEN im.cantidad ELSE 0 END) as totalEntradas,
          SUM(CASE WHEN im.tipo = 'salida' THEN im.cantidad ELSE 0 END) as totalSalidas
        FROM inventario_movimientos im
        INNER JOIN inventario i ON im.idInventario = i.idInventario
        INNER JOIN producto p ON i.idProducto = p.idProducto
        GROUP BY p.idProducto, p.nombre
        ORDER BY totalMovimientos DESC
        LIMIT 5
      `;

      const [resumenTipos] = await db.execute(queryResumen);
      const [movimientosRecientes] = await db.execute(queryRecientes);
      const [productosActivos] = await db.execute(queryProductosActivos);

      // Procesar datos del resumen
      const resumen = {
        entradas: resumenTipos.find(r => r.tipo === 'entrada') || { totalMovimientos: 0, totalCantidad: 0 },
        salidas: resumenTipos.find(r => r.tipo === 'salida') || { totalMovimientos: 0, totalCantidad: 0 }
      };

      const totalMovimientos = resumen.entradas.totalMovimientos + resumen.salidas.totalMovimientos;

      res.json({
        success: true,
        message: 'Resumen de movimientos obtenido exitosamente',
        data: {
          resumen: {
            totalMovimientos,
            totalEntradas: resumen.entradas.totalMovimientos,
            totalSalidas: resumen.salidas.totalMovimientos,
            cantidadEntradas: resumen.entradas.totalCantidad,
            cantidadSalidas: resumen.salidas.totalCantidad
          },
          movimientosRecientes,
          productosActivos
        }
      });

    } catch (error) {
      console.error('Error al obtener resumen de movimientos:', error);
      res.status(500).json({
        success: false,
        error: 'Error interno del servidor al obtener el resumen'
      });
    }
  },

  // Método adicional: Registrar nuevo movimiento (para uso interno del sistema)
  registrarMovimiento: async (idInventario, tipo, cantidad, descripcion = null) => {
    try {
      const query = `
        INSERT INTO inventario_movimientos (idInventario, tipo, cantidad, fecha, descripcion)
        VALUES (?, ?, ?, NOW(), ?)
      `;

      const [result] = await db.execute(query, [idInventario, tipo, cantidad, descripcion]);

      return {
        success: true,
        idMovimiento: result.insertId,
        message: 'Movimiento registrado exitosamente'
      };

    } catch (error) {
      console.error('Error al registrar movimiento:', error);
      return {
        success: false,
        error: 'Error al registrar el movimiento',
        details: error.message
      };
    }
  }
};

module.exports = inventoryHistoryController;