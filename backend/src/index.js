require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./database/db'); // Importamos la conexión a la base de datos
const userRoutes = require('./routes/userRoutes'); // Importamos las rutas de usuario
const tableRoutes = require('./routes/tableRoutes'); // Importamos las rutas de mesas
const openaiRoutes = require('./routes/openaiRoutes.js'); // Importamos las rutas de mesas
const mqttService = require('./services/mqttService'); // Inicializamos el servicio MQTT
require('./services/webSocketService');  // Servidor WebSocket
require('./services/wateringScheduler'); // Iniciar el cron job

const app = express(); // Inicializamos la aplicación Express

// Middleware para permitir CORS (Permitir solicitudes desde cualquier origen)
app.use(cors());

// Middleware para parsear el cuerpo de las solicitudes HTTP en formato JSON
app.use(express.json());

// Conexión a la base de datos
connectDB(); // No necesitamos usar try-catch aquí, ya está manejado en la función connectDB

// **Mover esta línea hacia arriba antes de manejar las rutas del frontend**
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Definir rutas de la API
app.use('/api/users', userRoutes); // Rutas para el manejo de usuarios
app.use('/api/tables', tableRoutes);  // Añadir las rutas para las mesas
app.use('/api/openai', openaiRoutes);

// Sirve archivos estáticos de la aplicación React en producción
app.use(express.static(path.join(__dirname, 'frontend/build')));

// Ruta catch-all para manejar rutas del frontend (SPA con React)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});

// Puerto donde el servidor escuchará
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
