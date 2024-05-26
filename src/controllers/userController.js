// src/controllers/userController.js
//Contiene la lógica para manejar las solicitudes relacionadas con los usuarios.

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getWeatherByLocation } = require('../services/weatherService');

const registerUser = async (req, res) => {
  try {
    const { username, password, email, phone, country, province, companyName } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      password: hashedPassword,
      email,
      phone,
      country,
      province,
      companyName,
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    res.status(400).json({ message: 'Error registering user', error });
  }
};

const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Compare the password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Create a JWT token
    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '1h' });

    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in', error });
  }
};

const updateUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.userId;

    const updatedUser = await User.findByIdAndUpdate(userId, { username, email }, { new: true });

    res.status(200).json({ message: 'User updated successfully', user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: 'Error updating user', error });
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

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user', error });
  }
};

const getTemperature = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { country, province } = user; // Suponiendo que 'province' se refiere a la localidad
    const temperature = await getWeatherByLocation(country, province);

    res.status(200).json({ temperature });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching temperature', error });
  }
};

const updateEmail = async (req, res) => {
  try {
    const userId = req.userId;
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, { email }, { new: true });

    res.status(200).json({ message: 'Email updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating email:', error);
    res.status(500).json({ message: 'Error updating email', error: error.message || error });
  }
};


module.exports = { registerUser, loginUser, updateUser, updatePassword, deleteUser, getTemperature, updateEmail };
