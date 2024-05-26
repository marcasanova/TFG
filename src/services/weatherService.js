const axios = require('axios');// sirve para conectar con la api de weather.

const getWeatherByLocation = async (country, location) => {
  const apiKey = '137dfecd1ae543487f91817214e2a657'; // Aquí va la KEY de nuestra OpenWeather
  const url = `http://api.openweathermap.org/data/2.5/weather?q=${location},${country}&units=metric&appid=${apiKey}`;
  
  try {
    const response = await axios.get(url);
    return response.data.main.temp; // Retorna la temperatura en grados Celsius
  } catch (error) {
    throw new Error('Error fetching weather data');
  }
};

module.exports = { getWeatherByLocation };
