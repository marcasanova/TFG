import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar'; // Importamos la Navbar
import './css/HomePage.css'; // Estilos específicos para la homepage
import weatherConditionsTranslations from './components/WeatherConditions';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const HomePage = ({ username }) => {
  const [currentUsername, setCurrentUsername] = useState(username);
  const [weatherData, setWeatherData] = useState(null); // Estado para los datos meteorológicos
  const [prompt, setPrompt] = useState(""); // Estado para el prompt del usuario
  const [response, setResponse] = useState(""); // Estado para la respuesta de OpenAI
  const [loading, setLoading] = useState(false); // Estado para mostrar carga

  // Normalizar el texto de las condiciones meteorológicas
  const normalizeCondition = (condition) => condition.trim();

  // useEffect para actualizar el username cuando cambie en localStorage
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername && storedUsername !== currentUsername) {
      setCurrentUsername(storedUsername); // Actualiza el estado con el nuevo username
    }
  }, [currentUsername]);

  // useEffect para obtener los datos meteorológicos
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const token = localStorage.getItem('token'); // Obtener el token del usuario
        if (!token) {
          toast.error('No se encontró el token de autenticación.');
          return;
        }

        const response = await fetch('http://localhost:5000/api/users/weather', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setWeatherData(data); // Guardar los datos meteorológicos
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || 'Error al obtener los datos del clima.');
        }
      } catch (error) {
        toast.error('Error al conectar con el servidor.');
        console.error('Error al obtener los datos meteorológicos:', error);
      }
    };

    fetchWeatherData(); // Llamar a la función para obtener los datos meteorológicos
  }, []);

  // Manejar el envío del prompt a OpenAI
  const handleSendPrompt = async () => {
    if (!prompt.trim()) {
      toast.error("Por favor, escribe un mensaje antes de enviarlo.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/openai/send-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      if (res.ok) {
        const data = await res.json();
        setResponse(data.message); // Guardar la respuesta de OpenAI
        setPrompt(""); // Limpiar el campo de texto
      } else {
        const errorData = await res.json();
        toast.error(errorData.error || "Error al procesar el mensaje.");
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor.");
      console.error("Error en la solicitud:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="homepage-container">
      <header>
        <Navbar />
      </header>

      <h1 className="homepage-title">Bienvenido, {currentUsername}!</h1>

      {/* Tarjeta principal para Información Meteorológica */}
      <section className="main-card weather-section">
        <h2>Información Meteorológica</h2>
        {weatherData ? (
          <div className="weather-cards">
            <div className="weather-card">
              <img
                src="/temperature.png"
                alt="Temperatura"
                className="weather-icon"
              />
              <p><strong>Temperatura:</strong> {weatherData.temperature} °C</p>
            </div>
            <div className="weather-card">
              <img
                src="/humidity.png"
                alt="Humedad"
                className="weather-icon"
              />
              <p><strong>Humedad:</strong> {weatherData.humidity} %</p>
            </div>
            <div className="weather-card">
              <img
                src="/condition.png"
                alt="Condición"
                className="weather-icon"
              />
              <p><strong>Condición:</strong> {weatherConditionsTranslations[normalizeCondition(weatherData.weather_description)] || weatherData.weather_description}</p>
            </div>
            <div className="weather-card">
              <img
                src="/wind.png"
                alt="Velocidad del viento"
                className="weather-icon"
              />
              <p><strong>Viento:</strong> {weatherData.wind_speed} km/h</p>
            </div>
          </div>
        ) : (
          <p>Cargando información meteorológica...</p>
        )}
      </section>


      {/* Tarjeta principal para interacción con OpenAI */}
      <section className="main-card">
        <h2 className='assistant-title'>Asistente IA</h2>
        <textarea
          className="prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Escribe tu mensaje aquí..."
        />
        <button
          className="send-button"
          onClick={handleSendPrompt}
          disabled={loading}
        >
          {loading ? "Enviando..." : "Enviar"}
        </button>
        {response && (
          <div className="response-container">
            <h3>Respuesta:</h3>
            <p>{response}</p>
          </div>
        )}
      </section>

      <ToastContainer />
    </div>
  );
};

export default HomePage;
