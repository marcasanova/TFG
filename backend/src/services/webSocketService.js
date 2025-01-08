const WebSocket = require('ws');
const Table = require('../models/Table'); // Para acceder a los datos de la mesa
const SensorData = require('../models/SensorData'); // Importar modelo de SensorData


// Crear el servidor WebSocket en el puerto 8080
const webSocketServer = new WebSocket.Server({ port: 8080 }, () => {
  console.log('Servidor WebSocket corriendo en el puerto 8080');
});

// Lista para almacenar los clientes conectados
let clients = [];

// Función para enviar datos a los clientes
async function broadcast(sensorData, tableState, tableStats) { // Añadimos async aquí
  try {
    const lastSensorData = await SensorData.findOne({ tableId: sensorData.tableId })
      .sort({ date: -1 }) // Ordenamos por fecha descendente
      .select('date') // Solo necesitamos la fecha
      .lean();

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client.tableId === sensorData.tableId) {
        client.send(JSON.stringify({
          type: 'sensorData',
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          waterLevel: sensorData.waterLevel,
          state: tableState,
          fillCount: tableStats?.fillCount,
          drainCount: tableStats?.drainCount,
          lastFilledAt: tableStats?.lastFilledAt,
          lastDrainedAt: tableStats?.lastDrainedAt,
          lastSensorDataAt: lastSensorData?.date || null, // Enviamos la última fecha registrada
        }));
      }
    });
  } catch (error) {
    console.error('Error en broadcast:', error);
  }
}


// Manejar conexiones WebSocket
webSocketServer.on('connection', (ws) => {
  console.log('Nuevo cliente WebSocket conectado');

  // Escuchar los mensajes de los clientes
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);

      // Suscripción a la mesa
      if (data.action === 'subscribeToTable') {
        const table = await Table.findOne({ tableId: data.tableId });
        if (!table) {
          ws.send(JSON.stringify({ error: 'Mesa no encontrada' }));
          ws.close(); // Desconectar si la mesa no existe
          return;
        }

        ws.tableId = data.tableId; // Almacenar el ID de la mesa en el WebSocket
        console.log(`Cliente suscrito a los datos de la mesa con tableId ${ws.tableId}`);

        // Enviar estadísticas iniciales al cliente
        ws.send(JSON.stringify({
          type: 'statisticsUpdate',
          state: table.tableState,
          fillCount: table.fillCount || 0,
          drainCount: table.drainCount || 0,
          lastFilledAt: table.lastFilledAt || null,
          lastDrainedAt: table.lastDrainedAt || null,
        }));
      }
    } catch (err) {
      // Manejo de errores de mensajes mal formados
      console.error('Error al procesar el mensaje WebSocket:', err);
      ws.send(JSON.stringify({ error: 'Formato de mensaje inválido' }));
    }
  });

  // Agregar cliente a la lista de clientes
  clients.push(ws);

  // Manejar la desconexión del cliente
  ws.on('close', () => {
    console.log('Cliente WebSocket desconectado');
    clients = clients.filter(client => client !== ws);
  });
});

// Función para manejar actualizaciones del estado y las estadísticas
async function handleTableUpdate(tableId, newState) {
  try {
    const table = await Table.findOne({ tableId });
    if (!table) {
      console.error(`Mesa con tableId ${tableId} no encontrada`);
      return;
    }

    // Actualizar estado y estadísticas según el nuevo estado
    if (newState === 'full') {
      table.fillCount += 1;
      table.lastFilledAt = new Date();
    } else if (newState === 'empty') {
      table.drainCount += 1;
      table.lastDrainedAt = new Date();
    }
    table.state = newState;

    await table.save();

    // Emitir actualización a los clientes suscritos
    broadcast(
      { tableId },
      newState,
      {
        fillCount: table.fillCount,
        drainCount: table.drainCount,
        lastFilledAt: table.lastFilledAt,
        lastDrainedAt: table.lastDrainedAt,
      }
    );
  } catch (err) {
    console.error('Error al manejar la actualización de la mesa:', err);
  }
}

// Exportar las funciones necesarias
module.exports = { broadcast, handleTableUpdate };
