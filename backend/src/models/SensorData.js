const mongoose = require('mongoose');

// Esquema para los datos de los sensores
const sensorDataSchema = new mongoose.Schema({
  tableId: { type: String, required: true }, // Referencia a la mesa
  date: { type: Date, default: Date.now },   // Fecha en la que se tomaron las lecturas
  temperature: { type: Number, required: true }, // Temperatura del agua en grados Celsius
  humidity: { type: Number, required: true },    // Humedad del suelo en porcentaje
  waterLevel: { type: Number, required: true },  // Porcentaje de nivel de agua
});

const SensorData = mongoose.model('SensorData', sensorDataSchema);

module.exports = SensorData;
