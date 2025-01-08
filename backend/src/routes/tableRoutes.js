const express = require('express');
const { createTable, deleteTable, getUserTables, getTableDetails, updateWateringSchedule, updateTableName, updateTableDescription, verifyTableId, saveSensorData, getSensorData, fillTable, drainTable, uploadTableImage, getUserTablesStats } = require('../controllers/TableController');
const authMiddleware = require('../middlewares/authMiddleware');  // Para proteger las rutas
const upload = require('../middlewares/multerMiddleware');


const router = express.Router();

// Ruta para crear una nueva mesa (protegida, solo usuarios logueados)
router.post('/create-table', authMiddleware, createTable);
// Ruta para eliminar una mesa (protegida, solo usuarios logueados)
router.delete('/delete-table/:tableId', authMiddleware, deleteTable);
// Ruta para obtener todas las mesas del usuario
router.get('/user-tables', authMiddleware, getUserTables);
// Ruta para obtener los detalles de la mesa
router.get('/:tableId', authMiddleware, getTableDetails);
// Nueva ruta para actualizar la planificación de riego
router.put('/:tableId/watering-schedule', authMiddleware, updateWateringSchedule);
// Actualizar el nombre de la mesa
router.put('/:tableId/update-name', authMiddleware, updateTableName);
// Actualizar la descripción de la mesa
router.put('/:tableId/update-description', authMiddleware, updateTableDescription);
// Ruta para verificar si el tableId existe
router.get('/verify-table/:tableId', authMiddleware, verifyTableId); // Nueva ruta para la verificación
router.post('/:tableId/upload-image', authMiddleware, upload.single('tableImage'), uploadTableImage); // Nueva ruta para subir imagen


// **Nuevas rutas para el manejo de los datos de sensores**
// Ruta para guardar los datos de los sensores
router.post('/save-sensor-data', authMiddleware, saveSensorData);  // Protegida
// Ruta para obtener los datos históricos de sensores de una mesa
router.get('/sensor-data/:tableId', authMiddleware, getSensorData); // Protegida

// Ruta para llenar la mesa
router.put('/:tableId/fill', authMiddleware, fillTable);
// Ruta para vaciar la mesa
router.put('/:tableId/drain', authMiddleware, drainTable);
// Nueva ruta para obtener estadísticas
router.get('/user-tables-stats', authMiddleware, getUserTablesStats);



module.exports = router;
