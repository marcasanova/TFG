// src/services/mqttService.js
const mqtt = require('mqtt');
const os = require('os'); // Para obtener información de red
const Table = require('../models/Table'); // Importamos el modelo de mesa
const SensorData = require('../models/SensorData'); // Importar el esquema SensorData
const { broadcast } = require('./webSocketService'); // Importar la función de WebSocket

// Función para obtener la dirección IP local
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const alias of iface) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address; // Retornar la IP local
      }
    }
  }
  throw new Error('No se pudo determinar la dirección IP local');
}

// Obtener la dirección IP local
const localIPAddress = getLocalIPAddress();
console.log(`IP local detectada: ${localIPAddress}`);

// Parámetros de conexión al broker MQTT
const mqttBrokerUrl = `mqtt://${localIPAddress}`; // Usar la IP local detectada automáticamente
const mqttOptions = {
  clientId: 'backend_server',
  clean: true,
  connectTimeout: 4000,
  reconnectPeriod: 1000,
};

// Conectar al broker MQTT
const mqttClient = mqtt.connect(mqttBrokerUrl, mqttOptions);

// Mensaje de éxito al conectar al broker
mqttClient.on('connect', () => {
  console.log('Conectado al broker MQTT');

  // Suscribirse a los tópicos de los sensores y de estado
  mqttClient.subscribe(['table/+/sensors/data', 'table/+/status'], (err) => {
    if (err) {
      console.error('Error al suscribirse a los tópicos:', err);
    } else {
      console.log('Suscrito correctamente a los tópicos de sensores y estado');
    }
  });
});

// Procesar los mensajes MQTT recibidos
mqttClient.on('message', async (topic, message) => {
  console.log(`Mensaje recibido en el tópico ${topic}: ${message.toString()}`);

  const topicParts = topic.split('/');
  if (topicParts.length < 3) {
    console.error('Tópico MQTT inválido:', topic);
    return;
  }

  const tableId = topicParts[1]; // Extraer el ID de la mesa

  try {
    // Procesar datos de sensores
    if (topicParts[2] === 'sensors' && topicParts[3] === 'data') {
      const sensorData = JSON.parse(message.toString());

      if (sensorData.temperature !== undefined && sensorData.humidity !== undefined && sensorData.waterLevel !== undefined) {
        console.log('Datos de sensores recibidos:', sensorData);

        let humidityDescription;
        if (sensorData.humidity > 600) {
          humidityDescription = "Seco";
        } else if (sensorData.humidity > 300) {
          humidityDescription = "Húmedo";
        } else {
          humidityDescription = "Mojado";
        }

        const newSensorData = new SensorData({
          tableId,
          temperature: sensorData.temperature,
          humidity: sensorData.humidity,
          waterLevel: sensorData.waterLevel,
        });

        await newSensorData.save();
        console.log('Datos de sensores guardados correctamente en la base de datos.');

        // Recuperar el estado actual y las estadísticas desde la base de datos
        const table = await Table.findOne({ tableId });
        if (!table) {
          console.error(`Mesa con tableId ${tableId} no encontrada para datos de sensores.`);
          return;
        }

        // Enviar los datos de los sensores a los clientes conectados
        broadcast({
          tableId,
          temperature: sensorData.temperature,
          humidity: humidityDescription,
          waterLevel: sensorData.waterLevel,
        }, table.state, {
          fillCount: table.fillCount,
          drainCount: table.drainCount,
          lastFilledAt: table.lastFilledAt,
          lastDrainedAt: table.lastDrainedAt,
        });
      } else {
        console.error('Datos de sensores incompletos o incorrectos:', sensorData);
      }
    }

    // Procesar comandos de llenado y vaciado
    if (topicParts[2] === 'status') {
      // **Escuchar confirmaciones de estado**
      const newState = message.toString();

      const table = await Table.findOne({ tableId });
      if (!table) {
        console.error(`Mesa con tableId ${tableId} no encontrada.`);
        return;
      }

      if (['filling', 'draining'].includes(newState)) {
        // Actualizar solo el estado intermedio
        table.state = newState;
      } else if (newState === 'full') {
        // Actualizar estado final, contador y fecha
        table.fillCount += 1;
        table.lastFilledAt = new Date();
        table.state = 'full'; // Falta esta línea en el código compartido
      } else if (newState === 'empty') {
        // Actualizar estado final, contador y fecha
        table.drainCount += 1;
        table.lastDrainedAt = new Date();
        table.state = 'empty'; // Falta esta línea en el código compartido
      } else {
        console.error(`Estado desconocido recibido: ${newState}`);
        return;
      }
      await table.save();

      console.log(`Estado de la mesa ${tableId} actualizado a: ${newState}`);
      broadcast(
        { tableId },
        table.state,
        {
          fillCount: table.fillCount,
          drainCount: table.drainCount,
          lastFilledAt: table.lastFilledAt,
          lastDrainedAt: table.lastDrainedAt,
        }
      );
    }

    if (topicParts[2] === 'commands') {
      const command = message.toString();
      console.log(`Comando recibido: ${command} para la mesa ${tableId}`);
    }
  } catch (error) {
    console.error('Error procesando el mensaje MQTT:', error);
  }
});

// Enviar comandos de llenado y vaciado
function sendFillCommand(tableId) {
  const topic = `table/${tableId}/commands`;
  mqttClient.publish(topic, 'fillTable', (err) => {
    if (err) {
      console.error(`Error al publicar el comando fillTable para la mesa ${tableId}:`, err);
    } else {
      console.log(`Comando fillTable publicado correctamente para la mesa ${tableId}`);
    }
  });
}


function sendDrainCommand(tableId) {
  const topic = `table/${tableId}/commands`;
  mqttClient.publish(topic, 'drainTable', (err) => {
    if (err) {
      console.error(`Error al publicar el comando drainTable para la mesa ${tableId}:`, err);
    } else {
      console.log(`Comando drainTable publicado correctamente para la mesa ${tableId}`);
    }
  });
}


// Manejo de errores de conexión MQTT
mqttClient.on('error', (err) => {
  console.error('Error en la conexión MQTT:', err);
});

module.exports = { mqttClient, sendFillCommand, sendDrainCommand };
