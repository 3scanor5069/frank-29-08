// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Rutas para las operaciones CRUD en usuarios (clientes)
router.get('/', userController.getAllUsers);        // Obtener todos los usuarios
router.post('/', userController.createUser);        // Crear un nuevo usuario
router.put('/:id', userController.updateUser);      // Actualizar un usuario por su ID
router.delete('/:id', userController.deleteUser);   // Eliminar un usuario por su ID
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

module.exports = router;
