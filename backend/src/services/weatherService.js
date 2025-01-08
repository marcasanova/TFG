const axios = require('axios');

const apiKey = 'd68732d3845e4861a8d111706241811'; // Reemplaza con tu API Key de WeatherAPI

/**
 * Obtiene la información del clima para una ubicación específica
 * @param {string} province - La provincia del usuario
 * @param {string} country - El país del usuario
 * @returns {Promise<Object>} - Datos meteorológicos
 */
const getWeatherByLocation = async (province, country) => {
    try {
        // Construye la URL para consultar WeatherAPI
        const url = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${province},${country}`;

        // Realiza la solicitud HTTP a WeatherAPI
        const response = await axios.get(url);

        // Verifica si la respuesta contiene datos
        if (response.data && response.data.current) {
            const data = response.data.current;
            return {
                temperature: data.temp_c,
                humidity: data.humidity,
                wind_speed: data.wind_kph,
                weather_description: data.condition.text,
                icon_url: data.condition.icon, // URL del icono del clima
            };
        } else {
            throw new Error('No se encontraron datos meteorológicos');
        }
    } catch (error) {
        console.error('Error al obtener los datos del clima:', error.message);
        throw error;
    }
};

module.exports = { getWeatherByLocation };
