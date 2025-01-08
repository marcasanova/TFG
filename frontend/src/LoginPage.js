// src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Cambiado a useNavigate
import './css/LoginPage.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const navigate = useNavigate(); // Hook para redirigir

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token); // Guardamos el token en localStorage
        localStorage.setItem('username', formData.username); // Guardamos el username
        navigate('/home'); // Redirigir a la HomePage
      } else {
        toast.error(data.message || 'Error al iniciar sesión.');
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Nombre de Usuario"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>


        {/* Enlace para redirigir a la página de Register */}

        <p className="register-prompt">
          ¿Aún no tienes una cuenta? <a href="/register">Regístrate aquí</a>
        </p>
      </div>
      <ToastContainer />

    </div>
  );
};

export default LoginPage;
