require('dotenv').config(); // << CARGAR VARIABLES .ENV


const express = require('express');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const passwordRoutes = require('./routes/passwordRoutes'); // << NUEVO
const menuRoutes = require('./routes/menuRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');





const app = express();


// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes); 
app.use('/api', passwordRoutes); 
app.use('/api/menu', menuRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);





// Puerto
app.listen(3006, () => {
  console.log('Servidor corriendo en http://localhost:3006');
});
