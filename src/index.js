// src/index.js
const express = require('express'); //Importamos el framework de express.
const connectDB = require('./database/db');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Connect to the database
try {
  connectDB();
}catch (error){
  console.log("An error reading the DataBase has ocurred", error);
}

app.get('/', (req, res) => {
  res.send('Esta es la API de mi proyecto del TFG')
})

// Middleware
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
