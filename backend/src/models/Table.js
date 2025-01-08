const mongoose = require('mongoose');


// Esquema para la planificación del riego automático
const wateringScheduleSchema = new mongoose.Schema({
  days: [{ type: String, required: true }], // Días de riego (Ej: ["Lunes", "Miércoles"])
  fillTime: { type: String, required: true }, // Hora de llenado en formato HH:mm
  drainTime: { type: String, required: true }, // Hora de vaciado en formato HH:mm
  updatedAt: { type: Date, default: Date.now }, // Fecha de la última actualización
});

// Definimos los estados de la mesa
const tableStateEnum = ['empty', 'filling', 'full', 'draining']; // Estados posibles

// Esquema principal de la mesa
const tableSchema = new mongoose.Schema({
  tableId: { type: String, required: true, unique: true }, // Identificador único de la mesa (2 cifras numéricas)
  name: { type: String, required: true }, // Nombre descriptivo de la mesa (ej: "Invernadero", "Exterior")
  description: { type: String }, // Descripción de la mesa (opcional)
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Usuarios que tienen acceso a esta mesa
  wateringSchedule: wateringScheduleSchema, // Planificación del riego automático
  tableImage: { type: String, default: '/uploads/defaultTableImage.jpg' }, // Imagen de la mesa con valor por defecto
  state: { type: String, enum: tableStateEnum, default: 'empty' }, // Estado de la mesa
  fillCount: { type: Number, default: 0 }, // Total de llenados de la mesa
  drainCount: { type: Number, default: 0 }, // Total de vaciados de la mesa
  lastFilledAt: { type: Date, default: null }, // Fecha de la última vez que se llenó la mesa
  lastDrainedAt: { type: Date, default: null }, // Fecha de la última vez que se vació la mesa
  createdAt: { type: Date, default: Date.now }, // Fecha de creación de la mesa
});

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
