// controllers/manualSaleController.js
const db = require('../config/database');

class ManualSaleController {
  
  // Crear pedido manual
  static async crearPedidoManual(req, res) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { idMesa, productos } = req.body;
      const fechaPedido = new Date();
      
      // 1. Verificar que la mesa existe y está disponible
      const [mesaResult] = await connection.execute(
        'SELECT * FROM mesas WHERE id = ? AND estado = "disponible"',
        [idMesa]
      );
      
      if (mesaResult.length === 0) {
        throw new Error('La mesa no existe o no está disponible');
      }
      
      // 2. Verificar que todos los productos existen y obtener sus precios
      let totalPedido = 0;
      const productosValidados = [];
      
      for (const item of productos) {
        const [productoResult] = await connection.execute(
          'SELECT idProducto, nombre, precio FROM menu WHERE idProducto = ? AND disponible = 1',
          [item.idProducto]
        );
        
        if (productoResult.length === 0) {
          throw new Error(`El producto con ID ${item.idProducto} no existe o no está disponible`);
        }
        
        const producto = productoResult[0];
        const subtotal = producto.precio * item.cantidad;
        totalPedido += subtotal;
        
        productosValidados.push({
          idProducto: producto.idProducto,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: item.cantidad,
          subtotal: subtotal
        });
      }
      
      // 3. Crear el pedido principal
      const [pedidoResult] = await connection.execute(
        `INSERT INTO pedidos (idMesa, fechaPedido, total, estado, tipoOrden, metodoPago) 
         VALUES (?, ?, ?, 'Pendiente', 'Manual', NULL)`,
        [idMesa, fechaPedido, totalPedido]
      );
      
      const idPedido = pedidoResult.insertId;
      
      // 4. Insertar los detalles del pedido
      for (const producto of productosValidados) {
        await connection.execute(
          `INSERT INTO detallesPedido (idPedido, idProducto, cantidad, precioUnitario, subtotal) 
           VALUES (?, ?, ?, ?, ?)`,
          [idPedido, producto.idProducto, producto.cantidad, producto.precio, producto.subtotal]
        );
      }
      
      // 5. Actualizar el estado de la mesa a ocupada
      await connection.execute(
        'UPDATE mesas SET estado = "ocupada" WHERE id = ?',
        [idMesa]
      );
      
      // 6. Registrar en el log de actividades
      await connection.execute(
        `INSERT INTO logActividades (tipo, descripcion, idRelacionado, fecha) 
         VALUES ('PEDIDO_MANUAL', ?, ?, ?)`,
        [
          `Pedido manual creado para Mesa ${idMesa} - Total: $${totalPedido}`,
          idPedido,
          fechaPedido
        ]
      );
      
      await connection.commit();
      
      res.status(201).json({
        success: true,
        message: 'Pedido registrado exitosamente',
        data: {
          idPedido: idPedido,
          idMesa: idMesa,
          total: totalPedido,
          productos: productosValidados,
          estado: 'Pendiente',
          fechaPedido: fechaPedido
        }
      });
      
    } catch (error) {
      await connection.rollback();
      console.error('Error al crear pedido manual:', error);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor al procesar el pedido'
      });
    } finally {
      connection.release();
    }
  }

  // Obtener pedidos pendientes
  static async obtenerPedidosPendientes(req, res) {
    try {
      const [pedidos] = await db.execute(`
        SELECT 
          p.idPedido,
          p.idMesa,
          m.numero as numeroMesa,
          p.fechaPedido,
          p.total,
          p.estado,
          p.observaciones,
          COUNT(dp.idDetalle) as cantidadItems,
          GROUP_CONCAT(
            CONCAT(men.nombre, ' (', dp.cantidad, ')') 
            SEPARATOR ', '
          ) as productos
        FROM pedidos p
        JOIN mesas m ON p.idMesa = m.id
        JOIN detallesPedido dp ON p.idPedido = dp.idPedido
        JOIN menu men ON dp.idProducto = men.idProducto
        WHERE p.estado = 'Pendiente' AND p.tipoOrden = 'Manual'
        GROUP BY p.idPedido, p.idMesa, m.numero, p.fechaPedido, p.total, p.estado, p.observaciones
        ORDER BY p.fechaPedido DESC
      `);
      
      res.json({
        success: true,
        data: pedidos,
        count: pedidos.length
      });
      
    } catch (error) {
      console.error('Error al obtener pedidos pendientes:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener los pedidos pendientes'
      });
    }
  }

  // Marcar pedido como pagado
  static async marcarComoPagado(req, res) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { idPedido } = req.params;
      const { metodoPago, propina = 0 } = req.body;
      
      if (!metodoPago) {
        return res.status(400).json({
          success: false,
          error: 'El método de pago es requerido'
        });
      }
      
      // 1. Verificar que el pedido existe y está pendiente
      const [pedidoResult] = await connection.execute(
        'SELECT * FROM pedidos WHERE idPedido = ? AND estado IN ("Pendiente", "Preparando", "Listo", "Entregado")',
        [idPedido]
      );
      
      if (pedidoResult.length === 0) {
        throw new Error('El pedido no existe o ya fue procesado');
      }
      
      const pedido = pedidoResult[0];
      
      // 2. Actualizar el pedido a pagado
      await connection.execute(
        `UPDATE pedidos 
         SET estado = 'Pagado', metodoPago = ?, propina = ?, fechaPago = NOW() 
         WHERE idPedido = ?`,
        [metodoPago, propina, idPedido]
      );
      
      // 3. Liberar la mesa
      await connection.execute(
        'UPDATE mesas SET estado = "disponible" WHERE id = ?',
        [pedido.idMesa]
      );
      
      // 4. Registrar en el log de actividades
      await connection.execute(
        `INSERT INTO logActividades (tipo, descripcion, idRelacionado, fecha) 
         VALUES ('PAGO_PEDIDO', ?, ?, NOW())`,
        [
          `Pedido ${idPedido} pagado - Método: ${metodoPago} - Total: $${pedido.total} - Propina: $${propina}`,
          idPedido
        ]
      );
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Pedido marcado como pagado exitosamente',
        data: {
          idPedido: idPedido,
          estado: 'Pagado',
          metodoPago: metodoPago,
          propina: propina,
          totalConPropina: parseFloat(pedido.total) + parseFloat(propina)
        }
      });
      
    } catch (error) {
      await connection.rollback();
      console.error('Error al procesar pago:', error);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor al procesar el pago'
      });
    } finally {
      connection.release();
    }
  }

  // Obtener detalles de un pedido específico
  static async obtenerDetallePedido(req, res) {
    try {
      const { idPedido } = req.params;
      
      // Obtener información del pedido
      const [pedido] = await db.execute(`
        SELECT 
          p.*,
          m.numero as numeroMesa,
          m.capacidad,
          m.ubicacion
        FROM pedidos p
        JOIN mesas m ON p.idMesa = m.id
        WHERE p.idPedido = ?
      `, [idPedido]);
      
      if (pedido.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Pedido no encontrado'
        });
      }
      
      // Obtener detalles del pedido
      const [detalles] = await db.execute(`
        SELECT 
          dp.*,
          men.nombre as nombreProducto,
          men.categoria
        FROM detallesPedido dp
        JOIN menu men ON dp.idProducto = men.idProducto
        WHERE dp.idPedido = ?
        ORDER BY men.categoria, men.nombre
      `, [idPedido]);
      
      res.json({
        success: true,
        data: {
          pedido: pedido[0],
          detalles: detalles
        }
      });
      
    } catch (error) {
      console.error('Error al obtener detalles del pedido:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener los detalles del pedido'
      });
    }
  }

  // Obtener mesas disponibles
  static async obtenerMesasDisponibles(req, res) {
    try {
      const [mesas] = await db.execute(`
        SELECT id, numero, capacidad, estado, ubicacion
        FROM mesas 
        WHERE estado = 'disponible' 
        ORDER BY CAST(SUBSTRING(numero, 6) AS UNSIGNED)
      `);
      
      res.json({
        success: true,
        data: mesas,
        count: mesas.length
      });
      
    } catch (error) {
      console.error('Error al obtener mesas disponibles:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener las mesas disponibles'
      });
    }
  }

  // Cancelar pedido
  static async cancelarPedido(req, res) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { idPedido } = req.params;
      const { motivo = 'No especificado' } = req.body;
      
      // 1. Verificar que el pedido existe y puede ser cancelado
      const [pedidoResult] = await connection.execute(
        'SELECT * FROM pedidos WHERE idPedido = ? AND estado IN ("Pendiente", "Preparando")',
        [idPedido]
      );
      
      if (pedidoResult.length === 0) {
        throw new Error('El pedido no existe o no puede ser cancelado en su estado actual');
      }
      
      const pedido = pedidoResult[0];
      
      // 2. Marcar el pedido como cancelado
      await connection.execute(
        'UPDATE pedidos SET estado = "Cancelado", observaciones = CONCAT(COALESCE(observaciones, ""), " - CANCELADO: ", ?) WHERE idPedido = ?',
        [motivo, idPedido]
      );
      
      // 3. Liberar la mesa si estaba ocupada
      await connection.execute(
        'UPDATE mesas SET estado = "disponible" WHERE id = ? AND estado = "ocupada"',
        [pedido.idMesa]
      );
      
      // 4. Registrar en el log de actividades
      await connection.execute(
        `INSERT INTO logActividades (tipo, descripcion, idRelacionado, fecha) 
         VALUES ('CANCELAR_PEDIDO', ?, ?, NOW())`,
        [
          `Pedido ${idPedido} cancelado - Motivo: ${motivo} - Total perdido: $${pedido.total}`,
          idPedido
        ]
      );
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Pedido cancelado exitosamente',
        data: {
          idPedido: idPedido,
          estado: 'Cancelado',
          motivo: motivo
        }
      });
      
    } catch (error) {
      await connection.rollback();
      console.error('Error al cancelar pedido:', error);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor al cancelar el pedido'
      });
    } finally {
      connection.release();
    }
  }

  // Actualizar estado del pedido
  static async actualizarEstadoPedido(req, res) {
    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();
      
      const { idPedido } = req.params;
      const { nuevoEstado } = req.body;
      
      const estadosValidos = ['Pendiente', 'Preparando', 'Listo', 'Entregado'];
      
      if (!estadosValidos.includes(nuevoEstado)) {
        return res.status(400).json({
          success: false,
          error: 'Estado no válido'
        });
      }
      
      // 1. Verificar que el pedido existe
      const [pedidoResult] = await connection.execute(
        'SELECT * FROM pedidos WHERE idPedido = ? AND estado != "Pagado" AND estado != "Cancelado"',
        [idPedido]
      );
      
      if (pedidoResult.length === 0) {
        throw new Error('El pedido no existe o ya fue finalizado');
      }
      
      // 2. Actualizar el estado del pedido
      await connection.execute(
        'UPDATE pedidos SET estado = ? WHERE idPedido = ?',
        [nuevoEstado, idPedido]
      );
      
      // 3. Registrar en el log de actividades
      await connection.execute(
        `INSERT INTO logActividades (tipo, descripcion, idRelacionado, fecha) 
         VALUES ('ACTUALIZAR_ESTADO', ?, ?, NOW())`,
        [
          `Estado del pedido ${idPedido} actualizado a: ${nuevoEstado}`,
          idPedido
        ]
      );
      
      await connection.commit();
      
      res.json({
        success: true,
        message: 'Estado del pedido actualizado exitosamente',
        data: {
          idPedido: idPedido,
          nuevoEstado: nuevoEstado
        }
      });
      
    } catch (error) {
      await connection.rollback();
      console.error('Error al actualizar estado del pedido:', error);
      
      res.status(500).json({
        success: false,
        error: error.message || 'Error interno del servidor al actualizar el estado'
      });
    } finally {
      connection.release();
    }
  }

  // Obtener resumen de ventas del día
  static async obtenerResumenVentas(req, res) {
    try {
      const fechaHoy = new Date().toISOString().split('T')[0];
      
      const [resumen] = await db.execute(`
        SELECT 
          COUNT(*) as totalPedidos,
          COUNT(CASE WHEN estado = 'Pagado' THEN 1 END) as pedidosPagados,
          COUNT(CASE WHEN estado = 'Pendiente' THEN 1 END) as pedidosPendientes,
          COUNT(CASE WHEN estado = 'Cancelado' THEN 1 END) as pedidosCancelados,
          COALESCE(SUM(CASE WHEN estado = 'Pagado' THEN total ELSE 0 END), 0) as ventasTotales,
          COALESCE(SUM(CASE WHEN estado = 'Pagado' THEN propina ELSE 0 END), 0) as propinasTotal,
          COALESCE(AVG(CASE WHEN estado = 'Pagado' THEN total ELSE NULL END), 0) as ticketPromedio
        FROM pedidos 
        WHERE DATE(fechaPedido) = ? AND tipoOrden = 'Manual'
      `, [fechaHoy]);
      
      res.json({
        success: true,
        data: {
          fecha: fechaHoy,
          resumen: resumen[0]
        }
      });
      
    } catch (error) {
      console.error('Error al obtener resumen de ventas:', error);
      res.status(500).json({
        success: false,
        error: 'Error al obtener el resumen de ventas'
      });
    }
  }
}

module.exports = ManualSaleController;