const pool = require('../config/db');

// Obtener métricas principales
exports.getMetrics = async (req, res) => {
  try {
    const [totalUsersResult] = await pool.query('SELECT COUNT(*) AS total FROM usuario WHERE rol = "cliente"');
    const [totalOrdersResult] = await pool.query('SELECT COUNT(*) AS total FROM pedido WHERE estado = "entregado" AND DATE(fecha) = CURDATE()');
    const [dailyRevenueResult] = await pool.query('SELECT SUM(monto) AS total FROM pago WHERE DATE(fecha) = CURDATE()');
    const [weeklyOrdersResult] = await pool.query('SELECT COUNT(*) AS total FROM pedido WHERE fecha >= CURDATE() - INTERVAL 7 DAY');

    const metrics = {
      totalUsers: totalUsersResult[0].total || 0,
      totalOrders: totalOrdersResult[0].total || 0,
      dailyRevenue: dailyRevenueResult[0].total || 0,
      weeklyOrders: weeklyOrdersResult[0].total || 0
    };

    res.json(metrics);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    res.status(500).json({ message: 'Error fetching metrics', error });
  }
};

// Obtener ventas mensuales
exports.getMonthlySales = async (req, res) => {
  try {
    const sql = `
      SELECT
        DAY(fecha) as day,
        SUM(monto) as ventas
      FROM
        pago
      WHERE
        fecha >= CURDATE() - INTERVAL 30 DAY
      GROUP BY
        DAY(fecha)
      ORDER BY
        fecha
    `;
    const [result] = await pool.query(sql);
    res.json(result);
  } catch (error) {
    console.error('Error fetching monthly sales:', error);
    res.status(500).json({ message: 'Error fetching monthly sales', error });
  }
};

// Obtener ventas semanales
exports.getWeeklySales = async (req, res) => {
  try {
    const sql = `
      SELECT
        CASE
          WHEN DAYOFWEEK(fecha) = 2 THEN 'Lun'
          WHEN DAYOFWEEK(fecha) = 3 THEN 'Mar'
          WHEN DAYOFWEEK(fecha) = 4 THEN 'Mié'
          WHEN DAYOFWEEK(fecha) = 5 THEN 'Jue'
          WHEN DAYOFWEEK(fecha) = 6 THEN 'Vie'
          WHEN DAYOFWEEK(fecha) = 7 THEN 'Sáb'
          WHEN DAYOFWEEK(fecha) = 1 THEN 'Dom'
        END AS day,
        SUM(monto) AS ventas
      FROM
        pago
      WHERE
        fecha >= CURDATE() - INTERVAL 7 DAY
      GROUP BY
        DAYOFWEEK(fecha)
      ORDER BY
        DAYOFWEEK(fecha)
    `;
    const [result] = await pool.query(sql);
    res.json(result);
  } catch (error) {
    console.error('Error fetching weekly sales:', error);
    res.status(500).json({ message: 'Error fetching weekly sales', error });
  }
};

// Obtener nuevos usuarios por semana
exports.getNewUsers = async (req, res) => {
  try {
    const sql = `
      SELECT
        WEEK(fecha_creacion, 1) AS week,
        COUNT(*) AS usuarios
      FROM
        usuario
      WHERE
        fecha_creacion >= CURDATE() - INTERVAL 4 WEEK
      GROUP BY
        week
      ORDER BY
        week
    `;
    const [result] = await pool.query(sql);
    const newUsersData = result.map(row => ({
      semana: `Sem ${row.week}`,
      usuarios: row.usuarios
    }));
    res.json(newUsersData);
  } catch (error) {
    console.error('Error fetching new users:', error);
    res.status(500).json({ message: 'Error fetching new users', error });
  }
};

// Obtener productos más vendidos
exports.getTopProducts = async (req, res) => {
  try {
    const sql = `
      SELECT
        p.nombre AS name,
        SUM(pp.cantidad) AS value
      FROM
        pedido_producto pp
      JOIN
        producto p ON pp.idProducto = p.idProducto
      GROUP BY
        p.nombre
      ORDER BY
        value DESC
      LIMIT 5
    `;
    const [result] = await pool.query(sql);
    const totalSales = result.reduce((acc, item) => acc + item.value, 0);
    const topProducts = result.map(item => ({
      name: item.name,
      value: totalSales > 0 ? (item.value / totalSales) * 100 : 0
    }));

    const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
    const productsWithColors = topProducts.map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length]
    }));
    
    res.json(productsWithColors);
  } catch (error) {
    console.error('Error fetching top products:', error);
    res.status(500).json({ message: 'Error fetching top products', error });
  }
};

// Obtener últimos usuarios registrados
exports.getRecentUsers = async (req, res) => {
  try {
    const sql = `
      SELECT 
        idCliente AS id,
        nombre AS name,
        correo AS email,
        fecha_registro AS date,
        CASE
          WHEN activo = 1 THEN 'Activo'
          ELSE 'Inactivo'
        END AS status
      FROM 
        cliente
      ORDER BY 
        fecha_registro DESC
      LIMIT 10
    `;
    const [result] = await pool.query(sql);
    res.json(result);
  } catch (error) {
    console.error('Error fetching recent users:', error);
    res.status(500).json({ message: 'Error fetching recent users', error });
  }
};