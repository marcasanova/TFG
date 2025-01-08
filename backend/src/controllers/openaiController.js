const { sendPromptToOpenAI } = require('../services/openaiService');
const path = require('path');

const handleTextPrompt = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'El prompt es obligatorio.' });
  }

  try {
    const response = await sendPromptToOpenAI(prompt);
    return res.status(200).json({ message: response.choices[0].message.content });
  } catch (error) {
    console.error('Error en handleTextPrompt:', error.message);
    return res.status(500).json({ error: 'Error al procesar el texto.' });
  }
};


module.exports = { handleTextPrompt };

