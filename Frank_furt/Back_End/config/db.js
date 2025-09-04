// Back_end/config/db.js

const mysql = require('mysql2/promise');

// Crea un pool de conexiones a MySQL
const pool = mysql.createPool({
  host: 'localhost',       // o la IP/hostname de tu servidor MySQL
  user: 'root',            // tu usuario de MySQL
  password: '',            // tu contraseña (en blanco si no tiene)
  database: 'frank_furt',  // el nombre de tu base de datos
  waitForConnections: true,
  connectionLimit: 10,     // número máximo de conexiones en el pool
  queueLimit: 0
});

module.exports = pool;
