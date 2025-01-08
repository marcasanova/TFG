const cron = require('node-cron');
const Table = require('../models/Table');
const { fillTable, drainTable } = require('../controllers/TableController');

// Cron job para verificar el riego automáticamente cada minuto
cron.schedule('* * * * *', async () => {
  console.log('Cron job ejecutado:', new Date().toLocaleString()); // Log inicial

  try {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinutes = String(currentTime.getMinutes()).padStart(2, '0'); // Formato HH:MM
    const currentDay = currentTime
      .toLocaleString('es-ES', { weekday: 'long' })
      .toLowerCase(); // Día en minúsculas

    const currentFormattedTime = `${currentHour}:${currentMinutes}`;
    console.log(`Hora actual: ${currentFormattedTime}, Día actual: ${currentDay}`);
    const previousMinute = new Date(currentTime.getTime() - 60000).toISOString().substr(11, 5); // Restar un minuto
    const nextMinute = new Date(currentTime.getTime() + 60000).toISOString().substr(11, 5); // Sumar un minuto

    // Verificar mesas para llenado
    const fillTables = await Table.find({
      'wateringSchedule.days': { $in: [currentDay] }, // Comparar con el día en minúsculas
      'wateringSchedule.fillTime': { $in: [previousMinute, currentFormattedTime, nextMinute] },
    });

    console.log(`Mesas encontradas para llenado (${fillTables.length}):`, fillTables.map(table => table.name).join(', '));

    for (const table of fillTables) {
      console.log(`Iniciando llenado automático para la mesa: ${table.name} (tableId: ${table.tableId})`);
      try {
        const mockReq = {
          params: { tableId: table.tableId },
          userId: table.users[0],
        };
        const mockRes = {
          status: (code) => ({
            json: (data) => console.log(`Mock response (status ${code}):`, data),
          }),
        };

        await fillTable(mockReq, mockRes);
        console.log(`Llenado automático completado para la mesa: ${table.name}`);
      } catch (error) {
        console.error(`Error durante el llenado automático de la mesa ${table.name}:`, error.message || error);
      }
    }

    // Verificar mesas para vaciado
    const drainTables = await Table.find({
      'wateringSchedule.days': { $in: [currentDay] }, // Comparar con el día en minúsculas
      'wateringSchedule.drainTime': { $in: [previousMinute, currentFormattedTime, nextMinute] },
    });

    console.log(`Mesas encontradas para vaciado (${drainTables.length}):`, drainTables.map(table => table.name).join(', '));

    for (const table of drainTables) {
      console.log(`Iniciando vaciado automático para la mesa: ${table.name} (tableId: ${table.tableId})`);
      try {
        const mockReq = {
          params: { tableId: table.tableId },
          userId: table.users[0],
        };
        const mockRes = {
          status: (code) => ({
            json: (data) => console.log(`Mock response (status ${code}):`, data),
          }),
        };

        await drainTable(mockReq, mockRes);
        console.log(`Vaciado automático completado para la mesa: ${table.name}`);
      } catch (error) {
        console.error(`Error durante el vaciado automático de la mesa ${table.name}:`, error.message || error);
      }
    }
  } catch (error) {
    console.error('Error ejecutando el cron job:', error.message || error);
  }
});
