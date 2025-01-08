const axios = require('axios');
const apiKey = process.env.OPENAI_API_KEY;

const sendPromptToOpenAI = async (prompt) => {
    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.2,
                max_tokens: 150,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Error respuesta OpenAI:', error.response.status, error.response.data);
        } else if (error.request) {
            console.error('Error en la solicitud:', error.request);
        } else {
            console.error('Error en la configuración:', error.message);
        }
        throw new Error('No se pudo conectar con OpenAI.');
    }

};

// Exportación correcta
module.exports = { sendPromptToOpenAI };
