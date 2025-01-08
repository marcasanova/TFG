// src/controllers/userController.js
//Contiene la lógica para manejar las solicitudes relacionadas con los usuarios.

const Table = require('../models/Table'); // Asegúrate de importar el modelo de Table
const User = require('../models/User');
const SensorData = require('../models/SensorData'); // Importar el modelo de SensorData
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getWeatherByLocation } = require('../services/weatherService');
const { sendResetPasswordEmail } = require('../services/emailService');
const crypto = require('crypto'); // Asegúrate de importar esto para forgotPassword y resetPassword



const registerUser = async (req, res) => {
  try {
    const { username, password, email, phone, country, province, companyName } = req.body;

    // Verificar si el nombre de usuario, el correo electrónico o el número de teléfono ya existen
    const existingUser = await User.findOne({ $or: [{ username }, { email }, { phone }] });
    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(400).json({ message: 'El nombre de usuario ya existe' });
      } else if (existingUser.email === email) {
        return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
      } else if (existingUser.phone === phone) {
        return res.status(400).json({ message: 'El número de teléfono ya está registrado' });
      }
    }

    // Crear nuevo usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      password: hashedPassword,
      email,
      phone,
      country,
      province,
      companyName,
      profileImage: '/uploads/profileImage.jpg' // Ruta de la imagen por defecto

    });

    await user.save();
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });


    // Devolver token y usuario registrado
    res.status(201).json({ token, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor', error });
  }
};


const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('Received username:', username);
    console.log('Received password:', password);

    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });
    console.log('Login successful, sending token and userId');
    res.status(200).json({ token, userId: user._id });

  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in', error });
  }
};



const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(400).json({ message: 'Error updating password', error });
  }
};


const deleteUser = async (req, res) => {
  try {
    const userId = req.userId;

    // Obtener las mesas asociadas al usuario
    const tables = await Table.find({ users: userId });

    // Eliminar los datos de sensores asociados a cada mesa del usuario
    for (let table of tables) {
      await SensorData.deleteMany({ tableId: table.tableId });
    }

    // Eliminar todas las mesas asociadas al usuario
    await Table.deleteMany({ users: userId });

    // Ahora eliminar el usuario
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User, associated tables, and sensor data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user, tables, and sensor data', error });
  }
};

const getWeather = async (req, res) => {
  try {
    const userId = req.userId;

    // Busca al usuario en la base de datos
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const { country, province } = user;

    // Obtén los datos del clima usando el servicio
    const weatherData = await getWeatherByLocation(province, country);

    // Envía los datos al frontend
    res.status(200).json(weatherData);
  } catch (error) {
    console.error('Error al obtener el clima:', error);
    res.status(500).json({ message: 'Error al obtener el clima', error });
  }
};

const updateEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const userId = req.userId;

    // Verificar si el nuevo correo electrónico ya está en uso
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: 'El correo electrónico ya está en uso' });
    }

    // Actualizar el correo electrónico si no está en uso
    const updatedUser = await User.findByIdAndUpdate(userId, { email }, { new: true });

    res.status(200).json({ message: 'Correo electrónico actualizado correctamente', user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el correo electrónico', error });
  }
};


//estos dos próximos métodos están hechos para poder resetear la contraseña
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    sendResetPasswordEmail(user, resetToken);

    res.status(200).json({ message: 'Reset password email sent' });
  } catch (error) {
    res.status(500).json({ message: 'Error sending reset password email', error });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error resetting password', error });
  }
};

//Sirve para poder cambiar el nombre de perfil
const updateUsername = async (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.userId;

    // Verificar si el nuevo nombre de usuario ya está en uso
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: 'El nombre de usuario ya está siendo usado' });
    }

    // Actualizar el nombre de usuario si no está en uso
    const updatedUser = await User.findByIdAndUpdate(userId, { username }, { new: true });

    res.status(200).json({ message: 'Nombre de usuario actualizado correctamente', user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el nombre de usuario', error });
  }
};


//Este próximo método sirve para poder validar el token del usuario.
const validateToken = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select('-password');

    if (!user) {
      console.log('User not found for token validation'); // Mensaje de depuración
      return res.status(401).json({ message: 'Invalid token' });
    }

    console.log('User found for token validation:', user); // Mensaje de depuración
    res.status(200).json(user);
  } catch (error) {
    console.error('Error validating token:', error); // Mensaje de depuración
    res.status(500).json({ message: 'Error validating token', error });
  }
};

// Método para obtener los datos del perfil del usuario autenticado
const getProfile = async (req, res) => {
  try {
    // Obtener el ID del usuario autenticado a partir del token
    const userId = req.userId;

    // Buscar al usuario en la base de datos usando su ID
    const user = await User.findById(userId);

    // Verificar si el usuario existe
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Enviar los datos del perfil del usuario al frontend
    res.status(200).json({
      username: user.username,
      email: user.email,
      phone: user.phone,
      country: user.country,
      province: user.province,
      companyName: user.companyName,
      profileImage: user.profileImage
    });
  } catch (error) {
    // Manejo de errores
    res.status(500).json({ message: 'Error al obtener el perfil del usuario', error });
  }
};

// src/controllers/userController.js
const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const uploadedFilePath = `src/uploads/${req.file.filename}`;
    console.log("Ruta del archivo subido:", uploadedFilePath); 

    // Guardar la nueva imagen
    user.profileImage = `/uploads/${req.file.filename}`; 
    await user.save();

    res.status(200).json({ profileImage: user.profileImage });
  } catch (error) {
    console.error("Error al subir la imagen:", error);
    res.status(500).json({ message: 'Error al subir la imagen', error });
  }
};

const updatePhone = async (req, res) => {
  try {
    const { phone } = req.body;
    const userId = req.userId;

    // Verificar si el nuevo número de teléfono ya está en uso
    const existingUser = await User.findOne({ phone });
    if (existingUser && existingUser._id.toString() !== userId) {
      return res.status(400).json({ message: 'El número de teléfono ya está en uso' });
    }

    // Actualizar el número de teléfono si no está en uso
    const updatedUser = await User.findByIdAndUpdate(userId, { phone }, { new: true });

    res.status(200).json({ message: 'Número de teléfono actualizado correctamente', user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: 'Error al actualizar el número de teléfono', error });
  }
};


module.exports = { registerUser, loginUser, updatePassword, deleteUser, getWeather, updateEmail, forgotPassword, resetPassword, validateToken, updateUsername, getProfile, uploadProfileImage, updatePhone };
