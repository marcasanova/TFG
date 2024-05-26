// src/models/User.js
const mongoose = require('mongoose');

//userSchema: Define la estructura de los documentos de usuario en la colección users, incluyendo campos y sus tipos de datos.
//timestamps: Añade automáticamente campos createdAt y updatedAt a los documentos.
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    country: { type: String, required: true },
    province: { type: String, required: true },
    companyName: { type: String, required: true },
  }, {
    timestamps: true,
  });

//User: Es el modelo que se usará para interactuar con la colección users en MongoDB.
const User = mongoose.model('User', userSchema);

module.exports = User;
