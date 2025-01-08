const Table = require('../models/Table'); // Importamos el modelo de mesa
const SensorData = require('../models/SensorData'); // Importar el modelo de SensorData
const { sendFillCommand, sendDrainCommand } = require('../services/mqttService');


// Crear una nueva mesa
const createTable = async (req, res) => {
  const { name, description } = req.body;
  const userId = req.userId;

  try {
    const existingTable = await Table.findOne({ name, users: userId });
    if (existingTable) {
      return res.status(400).json({ message: 'Ya existe una mesa con ese nombre.' });
    }

    let tableId;
    let tableExists = true;

    while (tableExists) {
      tableId = Math.floor(10 + Math.random() * 90).toString();
      tableExists = await Table.findOne({ tableId });
    }

    const table = new Table({
      tableId,
      name,
      description,
      users: [userId],
    });

    await table.save();
    res.status(201).json({ message: 'Mesa creada con éxito', table });
  } catch (error) {
    console.error('Error creando la mesa:', error);
    res.status(500).json({ message: 'Error creando la mesa', error });
  }
};

const uploadTableImage = async (req, res) => {
  try {
    const { tableId } = req.params;
    const table = await Table.findOne({ tableId });

    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }

    table.tableImage = `/uploads/${req.file.filename}`;
    await table.save();

    res.status(200).json({ message: 'Imagen de mesa actualizada con éxito', tableImage: table.tableImage });
  } catch (error) {
    console.error('Error actualizando la imagen de la mesa:', error);
    res.status(500).json({ message: 'Error actualizando la imagen de la mesa', error });
  }
};


// Actualizar el nombre de una mesa
const updateTableName = async (req, res) => {
  const { tableId } = req.params;
  const { name } = req.body;
  const userId = req.userId; // Usuario autenticado

  try {
    // Verificar si la mesa existe y pertenece al usuario usando tableId de dos dígitos
    const table = await Table.findOne({ tableId, users: userId });
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada o el usuario no tiene acceso' });
    }

    // Actualizar el nombre
    table.name = name;
    await table.save(); // Guardar los cambios

    res.status(200).json({ message: 'Nombre de la mesa actualizado correctamente', table });
  } catch (error) {
    console.error('Error actualizando el nombre de la mesa:', error);
    res.status(500).json({ message: 'Error actualizando el nombre de la mesa', error });
  }
};

// Actualizar la descripción de una mesa
const updateTableDescription = async (req, res) => {
  const { tableId } = req.params;
  const { description } = req.body;
  const userId = req.userId; // Usuario autenticado

  try {
    // Verificar si la mesa existe y pertenece al usuario usando tableId
    const table = await Table.findOne({ tableId, users: userId });
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada o el usuario no tiene acceso' });
    }

    // Actualizar la descripción
    table.description = description;
    await table.save(); // Guardar los cambios

    res.status(200).json({ message: 'Descripción de la mesa actualizada correctamente', table });
  } catch (error) {
    console.error('Error actualizando la descripción de la mesa:', error);
    res.status(500).json({ message: 'Error actualizando la descripción de la mesa', error });
  }
};

// Eliminar una mesa
const deleteTable = async (req, res) => {
  const { tableId } = req.params;
  const userId = req.userId;

  try {
    // Buscar la mesa usando tableId y asegurarse de que pertenece al usuario
    const table = await Table.findOne({ tableId, users: userId });

    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada o el usuario no tiene acceso' });
    }

    // Eliminar los datos de sensores asociados a la mesa
    await SensorData.deleteMany({ tableId });

    // Eliminar la mesa
    await Table.findOneAndDelete({ tableId, users: userId });

    res.status(200).json({ message: 'Mesa y datos de sensores eliminados con éxito' });
  } catch (error) {
    console.error('Error eliminando mesa o datos de sensores:', error);
    res.status(500).json({ message: 'Error eliminando la mesa o los datos de sensores', error });
  }
};

// Guardar datos de sensores en el SensorData
const saveSensorData = async (req, res) => {
  const { tableId, temperature, humidity, waterLevel } = req.body; // Los datos de los sensores

  try {
    const sensorData = new SensorData({
      tableId,  // Usamos el tableId de dos dígitos
      temperature,
      humidity,
      waterLevel,
    });

    await sensorData.save();
    res.status(201).json({ message: 'Datos del sensor guardados correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al guardar los datos del sensor', error });
  }
};

// Recuperar los datos del sensor data.
const getSensorData = async (req, res) => {
  const { tableId } = req.params;

  try {
    // Recuperar los datos del sensor asociados al tableId de dos dígitos
    const data = await SensorData.find({ tableId }).sort({ date: -1 }).limit(100); // Últimos 100 datos
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los datos del sensor', error });
  }
};

// Obtener las mesas del usuario
const getUserTables = async (req, res) => {
  const userId = req.userId;
  try {
    const tables = await Table.find({ users: userId });
    res.status(200).json(tables);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las mesas', error });
  }
};

// Obtener detalles de una mesa
const getTableDetails = async (req, res) => {
  const { tableId } = req.params;

  try {
    // Buscar la mesa usando tableId en lugar de _id
    const table = await Table.findOne({ tableId });
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }

    res.status(200).json(table);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener los detalles de la mesa', error });
  }
};

// Actualizar la planificación del riego
const updateWateringSchedule = async (req, res) => {
  const { tableId } = req.params;
  const { days, fillTime, drainTime } = req.body; // Extraemos los datos del cuerpo de la petición

  try {
    // Buscar la mesa por su tableId
    const table = await Table.findOne({ tableId });
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada' });
    }

    // Convertir los días a minúsculas y eliminar duplicados
    const uniqueDays = [...new Set(days.map(day => day.toLowerCase()))];

    // Actualizar el plan de riego
    table.wateringSchedule = {
      days: uniqueDays, // Guardamos los días en minúsculas
      fillTime,
      drainTime,
      updatedAt: new Date(),
    };

    await table.save(); // Guardar los cambios
    res.status(200).json({ message: 'Plan de riego actualizado correctamente', wateringSchedule: table.wateringSchedule });
  } catch (error) {
    console.error('Error al actualizar el plan de riego:', error);
    res.status(500).json({ message: 'Error al actualizar el plan de riego', error });
  }
};

// Verificar si el tableId existe
const verifyTableId = async (req, res) => {
  const { tableId } = req.params;  // El tableId se obtiene de los parámetros de la URL
  const userId = req.userId;  // Extraemos el userId del token JWT proporcionado

  try {
    // Buscar la mesa con el tableId y que además esté asociada al usuario
    const table = await Table.findOne({ tableId, users: userId });

    // Si la mesa no se encuentra o no está asociada al usuario, devolver un error 404
    if (!table) {
      return res.status(404).json({ message: 'Table ID no encontrado o no pertenece al usuario' });
    }

    // Si la mesa existe y está asociada al usuario, devolver un mensaje de éxito
    res.status(200).json({ message: 'Table ID válido' });
  } catch (error) {
    console.error('Error verificando table ID:', error);
    res.status(500).json({ message: 'Error verificando table ID', error });
  }
};

const fillTable = async (req, res) => {
  const { tableId } = req.params;
  const userId = req.userId;

  try {
    const table = await Table.findOne({ tableId, users: userId });
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada o el usuario no tiene acceso' });
    }

    if (table.state === 'filling' || table.state === 'full' || table.state === 'draining') {
      return res.status(400).json({ message: 'La mesa ya está llenándose o está llena' });
    }

    // Publicar comando MQTT
    sendFillCommand(tableId);

    res.status(200).json({ message: 'Comando de llenado enviado a la mesa' });
  } catch (error) {
    console.error('Error al llenar la mesa:', error);
    res.status(500).json({ message: 'Error al llenar la mesa', error: error.message || error });
  }
};

const drainTable = async (req, res) => {
  const { tableId } = req.params;
  const userId = req.userId;

  try {
    const table = await Table.findOne({ tableId, users: userId });
    if (!table) {
      return res.status(404).json({ message: 'Mesa no encontrada o el usuario no tiene acceso' });
    }

    if (table.state === 'draining' || table.state === 'empty' || table.state === 'filling') {
      return res.status(400).json({ message: 'La mesa ya está vaciándose o está vacía' });
    }

    // Publicar comando MQTT
    sendDrainCommand(tableId);

    res.status(200).json({ message: 'Comando de vaciado enviado a la mesa' });
  } catch (error) {
    console.error('Error al vaciar la mesa:', error);
    res.status(500).json({ message: 'Error al vaciar la mesa', error: error.message || error });
  }
};

// Obtener estadísticas de las mesas del usuario
const getUserTablesStats = async (req, res) => {
  try {
    const userId = req.userId; // ID del usuario autenticado
    console.log('User ID:', userId); // Verificar el ID del usuario

    // Buscar todas las mesas del usuario
    const tables = await Table.find({ users: userId });
    console.log('Tables found:', tables); // Mostrar las mesas encontradas

    if (tables.length === 0) {
      console.log('No tables found for user');
      return res.status(404).json({ message: 'No hay mesas asociadas a este usuario' });
    }

    // Generar estadísticas para cada mesa
    const tablesStats = await Promise.all(
      tables.map(async (table) => {
        try {
          console.log('Processing tableId:', table.tableId);

          // Obtener la última lectura de sensores para la mesa
          const lastSensorData = await SensorData.findOne({ tableId: table.tableId })
            .sort({ date: -1 })
            .select('date')
            .lean();

          console.log('SensorData for tableId:', table.tableId, lastSensorData);

          return {
            tableId: table.tableId,
            name: table.name,
            fillCount: table.fillCount || 0,
            drainCount: table.drainCount || 0,
            lastFilledAt: table.lastFilledAt || null,
            lastDrainedAt: table.lastDrainedAt || null,
            lastSensorDataAt: lastSensorData?.date || null, // Última fecha registrada de sensores
          };
        } catch (err) {
          console.error('Error processing table:', table.tableId, err);
          throw err;
        }
      })
    );

    res.status(200).json(tablesStats);
  } catch (error) {
    console.error('Error al obtener estadísticas de las mesas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de las mesas' });
  }
};




module.exports = {
  createTable,
  uploadTableImage,
  deleteTable,
  getUserTables,
  getTableDetails,
  updateWateringSchedule,
  updateTableName,
  updateTableDescription,
  verifyTableId,
  saveSensorData,
  getSensorData,
  fillTable,
  drainTable,
  getUserTablesStats
};
