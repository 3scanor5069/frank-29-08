const pool = require('../config/db');
const bcrypt = require('bcryptjs'); // Asegúrate de tener bcrypt instalado (npm install bcrypt)

// Obtener todos los usuarios
exports.getAllUsers = async (req, res) => {
 try {
  const sql = `
   SELECT 
    idCliente, 
    nombre, 
    correo, 
    telefono, 
   direccion, 
    fecha_registro, 
    activo 
   FROM 
    cliente
   ORDER BY fecha_registro DESC
  `;
  const [rows] = await pool.query(sql);

  const users = rows.map(row => {
   const nameParts = row.nombre ? row.nombre.split(' ') : ['', ''];
  const firstName = nameParts[0] || '';
   const lastName = nameParts.slice(1).join(' ') || '';

   return {
    id: row.idCliente,
    firstName: firstName,
    lastName: lastName,
    email: row.correo,
    phone: row.telefono,
    location: row.direccion,
    hobby: 'N/A',
    status: row.activo === 1 ? 'active' : 'inactive',
    dateCreated: row.fecha_registro ? new Date(row.fecha_registro).toISOString().split('T')[0] : null,
    avatar: (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
   };
  });
  res.json(users);
 } catch (error) {
  console.error('Error al obtener los usuarios:', error);
  res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
 }
};

// Crear un nuevo usuario
exports.createUser = async (req, res) => {
 const { firstName, lastName, email, phone, location, status } = req.body;
 const nombreCompleto = `${firstName} ${lastName}`.trim();
 const activo = status === 'active' ? 1 : 0;
 const password = 'default_password_hashed'; 

 try {
  const sql = `
   INSERT INTO cliente (nombre, correo, telefono, direccion, activo, password)
   VALUES (?, ?, ?, ?, ?, ?)
  `;
  const [result] = await pool.query(sql, [nombreCompleto, email, phone, location, activo, password]);

  const newUser = {
   id: result.insertId,
   firstName,
   lastName,
   email,
   phone,
   location,
   hobby: 'N/A',
   status,
   dateCreated: new Date().toISOString().split('T')[0],
   avatar: (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
  };
  res.status(201).json(newUser);
 } catch (error) {
  console.error('Error al crear el usuario:', error);
  res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
 }
};

// Actualizar un usuario existente
exports.updateUser = async (req, res) => {
 const { id } = req.params;
 const { firstName, lastName, email, phone, location, status } = req.body;
 const nombreCompleto = `${firstName} ${lastName}`.trim();
 const activo = status === 'active' ? 1 : 0;

 try {
  const sql = `
   UPDATE cliente
   SET nombre = ?, correo = ?, telefono = ?, direccion = ?, activo = ?
   WHERE idCliente = ?
  `;
 const [result] = await pool.query(sql, [nombreCompleto, email, phone, location, activo, id]);

  if (result.affectedRows === 0) {
   return res.status(404).json({ message: 'Usuario no encontrado' });
  }

  const updatedUser = {
   id: parseInt(id),
   firstName,
   lastName,
   email,
   phone,
   location,
   hobby: 'N/A',
   status,
   avatar: (firstName.charAt(0) + lastName.charAt(0)).toUpperCase()
  };
  res.json(updatedUser);
 } catch (error) {
  console.error('Error al actualizar el usuario:', error);
  res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
 }
};

// Eliminar un usuario
exports.deleteUser = async (req, res) => {  const { id } = req.params;
 try {
  const sql = `DELETE FROM cliente WHERE idCliente = ?`;
  const [result] = await pool.query(sql, [id]);

  if (result.affectedRows === 0) {
   return res.status(404).json({ message: 'Usuario no encontrado' });
  }
  res.status(200).json({ message: 'Usuario eliminado correctamente' });
 } catch (error) {
  console.error('Error al eliminar el usuario:', error);
  res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
 }
};

// Función para el registro de usuarios
exports.registerUser = async (req, res) => {const { nombre, correo, password } = req.body;
 if (!nombre || !correo || !password) {
  return res.status(400).json({ message: 'Faltan campos obligatorios' }); }
 try {
  const hashedPassword = await bcrypt.hash(password, 10);
  const sql = `INSERT INTO cliente (nombre, correo, password) VALUES (?, ?, ?)`;
  await pool.query(sql, [nombre, correo, hashedPassword]);
  res.status(201).json({ message: 'Usuario registrado con éxito' });
 } catch (error) {
  console.error('Error al registrar el usuario:', error);
  res.status(500).json({ message: 'Error del servidor al registrar el usuario', error: error.message });
 }
};

// Función para el inicio de sesión
exports.loginUser = async (req, res) => { const { correo, password } = req.body;
 try {
  const [rows] = await pool.query('SELECT * FROM cliente WHERE correo = ?', [correo]);
  const user = rows[0];
  if (!user) {
   return res.status(404).json({ message: 'Usuario no encontrado' });
  }
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
   return res.status(401).json({ message: 'Contraseña incorrecta' });
  }
  res.status(200).json({ message: 'Inicio de sesión exitoso', user: { id: user.idCliente, nombre: user.nombre, correo: user.correo } });
 } catch (error) {
  console.error('Error en el inicio de sesión:', error);
  res.status(500).json({ message: 'Error del servidor al iniciar sesión', error: error.message });
 }
};