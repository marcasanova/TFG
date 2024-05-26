// src/routes/userRoutes.js
//Define las rutas relacionadas con los usuarios.
const express = require('express');
const { registerUser, loginUser, updateUser, updatePassword, deleteUser, getTemperature, updateEmail} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware'); // Importa authMiddleware


//router: Es una instancia de express.Router que define rutas específicas para la aplicación.
const router = express.Router();

//router.post('/register', registerUser): Define una ruta POST para registrar usuarios, que llama a la función registerUser del controlador.
router.post('/register', registerUser);//Registra un nuevo usuario
router.post('/login', loginUser);//Hacemos login de el usuario registrado previamente
router.put('/update', authMiddleware, updateUser);//Actualizamos el nombre de usuario 
router.put('/update-email', authMiddleware, updateEmail);
router.put('/update-password', authMiddleware, updatePassword);//Actualizamos la contraseña del usuario
router.delete('/delete', authMiddleware, deleteUser); // Nueva ruta para eliminar usuario
router.get('/temperature', authMiddleware, getTemperature)// Esta ruta sirve para la temperatura de la zona del usuario

module.exports = router;

//DE ESTE DOCUMENTO ==> PASAMOS AL USERCONTROLLER.JS