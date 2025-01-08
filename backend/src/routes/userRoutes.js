// src/routes/userRoutes.js

//Define las rutas relacionadas con los usuarios.
const express = require('express');
const { registerUser, loginUser, updatePassword, deleteUser, getWeather, updateEmail, forgotPassword, resetPassword, validateToken, updateUsername, uploadProfileImage, getProfile, updatePhone } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware'); // Importa authMiddleware
const upload = require('../middlewares/multerMiddleware'); // Importar el middleware de multer


//router: Es una instancia de express.Router que define rutas específicas para la aplicación.
const router = express.Router();

router.post('/register', registerUser);//Registra un nuevo usuario
router.post('/login', loginUser);//Hacemos login de el usuario registrado previamente
router.put('/update-username', authMiddleware, updateUsername);
router.put('/update-email', authMiddleware, updateEmail);
router.put('/update-password', authMiddleware, updatePassword);//Actualizamos la contraseña del usuario
router.delete('/delete', authMiddleware, deleteUser); // Nueva ruta para eliminar usuario
router.post('/forgot-password', forgotPassword); // Nueva ruta para solicitar recuperación de contraseña
router.post('/reset-password', resetPassword); // Nueva ruta para restablecer contraseña
router.get('/weather', authMiddleware, getWeather)// Esta ruta sirve para la temperatura de la zona del usuario
router.get('/validate-token', authMiddleware, validateToken); // Nueva ruta para validar el token
router.get('/profile', authMiddleware, getProfile); // Ruta protegida para obtener el perfil del usuario autenticado
router.post('/upload-profile-image', authMiddleware, upload.single('profileImage'), uploadProfileImage); // Ruta para hacer el cambio de imagen de perfil
router.put('/update-phone', authMiddleware, updatePhone); // Ruta para actualizar el número de teléfono



module.exports = router;

//DE ESTE DOCUMENTO ==> PASAMOS AL USERCONTROLLER.JS