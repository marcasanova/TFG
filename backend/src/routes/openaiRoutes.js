const express = require('express');
const { handleTextPrompt } = require('../controllers/openaiController');

const router = express.Router();
// Rutas
router.post('/send-text', handleTextPrompt); // Enviar texto

module.exports = router;
