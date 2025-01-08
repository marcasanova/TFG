import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './css/LandingPage.css';

const testimonialsData = [
  {
    name: "Miguel Angel Casanova Biosca",
    opinion: "Desde que uso RiegAI, ya no hace falta que riegue manualmente. Con pulsar un simple botón es suficiente.",
    rating: 5,
    image: "/profileMan.png", // Foto de cliente (opcional)
  },
  {
    name: "Mónica",
    opinion: "Me encanta la facilidad de uso y cómo puedo ahorrar tiempo.",
    rating: 4,
    image: "/profileWoman.png", // Foto de cliente (opcional)
  },
  {
    name: "Carlos López",
    opinion: "Un sistema excelente, ha cambiado por completo cómo cuido mis plantas.",
    rating: 5,
    image: "/profileMan.png", // Foto de cliente (opcional)
  },
  {
    name: "María Fernández",
    opinion: "La interfaz es muy intuitiva, y mis plantas están mejor que nunca.",
    rating: 4,
    image: "/profileWoman.png", // Foto de cliente (opcional)
  },
];

const LandingPage = () => {

  const [currentTestimonial, setCurrentTestimonial] = useState(0); // Controla la opinión actual
  const [fade, setFade] = useState(true); // Controla la clase para animación de fade


  useEffect(() => {
    const interval = setInterval(() => {
      // Activar transición de salida
      setFade(false);
      setTimeout(() => {
        // Cambiar al siguiente testimonio
        setCurrentTestimonial((prevIndex) =>
          prevIndex === testimonialsData.length - 1 ? 0 : prevIndex + 1
        );
        // Activar transición de entrada
        setFade(true);
      }, 500); // Tiempo de la transición de salida
    }, 5000); // Cambia cada 3 segundos

    return () => clearInterval(interval); // Limpia el intervalo cuando el componente se desmonta
  }, []);

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <img src="/logo.png" alt="Rieg AI Logo" className="hero-logo" />
          <h1 className="hero-title">Bienvenido a RiegAI</h1>
          <p className="hero-subtitle">Automatiza el cuidado de tus plantas de forma inteligente.</p>
          <div className="hero-buttons">
            <Link to="/register">
              <button className="btn btn-primary">Regístrate</button>
            </Link>
            <Link to="/login">
              <button className="btn btn-secondary">Iniciar Sesión</button>
            </Link>
          </div>
        </div>
      </header>

      {/* Carrusel de Imágenes */}
      <section className="carousel-section">
        <h2>Conoce Rieg AI</h2>
        <div className="carousel">
          <img src="/vivero1.jpg" alt="Vivero 1" />
          <img src="/vivero2.jpg" alt="Vivero 2" />
          <img src="/vivero3.jpg" alt="Vivero 3" />
        </div>
      </section>

      {/* Información y Beneficios */}
      <section className="info-section">
        <h2>¿Qué es RiegAI?</h2>
        <p>Rieg AI es un sistema avanzado de riego automático que utiliza sensores y tecnología IoT para cuidar tus plantas mientras ahorras tiempo.</p>
        <div className="benefits">
          <div className="benefit-card">
            <img src="/ahorroAgua.png" alt="Ahorro de Agua" />
            <h3>Ahorro de Agua</h3>
            <p>Optimiza el uso del agua y reduce el desperdicio.</p>
          </div>
          <div className="benefit-card">
            <img src="/controliot.png" alt="Control IoT" />
            <h3>Control IoT</h3>
            <p>Administra tu sistema desde cualquier lugar con nuestra Web App.</p>
          </div>
          <div className="benefit-card">
            <img src="/cuidadoContinuo.png" alt="Cuidado Continuo" />
            <h3>Cuidado Continuo</h3>
            <p>Monitorea y cuida tus plantas 24/7 con sensores inteligentes.</p>
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <h2>Lo que dicen nuestros usuarios</h2>
      <section className="testimonials-section">
        <div className={`testimonial-card ${fade ? 'fade-in' : 'fade-out'}`}>
          {/* Imagen del cliente */}
          <img
            src={testimonialsData[currentTestimonial].image}
            alt={`Foto de ${testimonialsData[currentTestimonial].name}`}
            className="testimonial-image"
          />
          {/* Opinión */}
          <p className="testimonial-opinion">"{testimonialsData[currentTestimonial].opinion}"</p>
          {/* Nombre */}
          <footer className="testimonial-footer">
            — {testimonialsData[currentTestimonial].name}
          </footer>
          {/* Estrellas de valoración */}
          <div className="testimonial-rating">
            {[...Array(testimonialsData[currentTestimonial].rating)].map((_, i) => (
              <img
                key={i}
                src="/star.png" // Reemplaza con la URL de tu imagen de estrella
                alt="Estrella"
                className="star-icon"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
