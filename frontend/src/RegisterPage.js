import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { provinces } from './components/locationData'; // Importar las provincias del archivo separado
import './css/RegisterPage.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    country: '',
    province: '',
    companyName: ''
  });

  const countries = useMemo(() => countryList().getData(), []);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedProvince, setSelectedProvince] = useState(null);

  const navigate = useNavigate(); // Hook para redirigir

  // Manejo de cambios en el país
  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption);
    setSelectedProvince(null);  // Resetear provincia cuando se cambia el país
    setFormData({
      ...formData,
      country: selectedOption.label, // Guardamos el país seleccionado
    });
  };

  // Manejo de cambios en la provincia
  const handleProvinceChange = (selectedOption) => {
    setSelectedProvince(selectedOption);
    setFormData({
      ...formData,
      province: selectedOption.label, // Guardamos la provincia seleccionada
    });
  };

  // Manejo del formulario
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/users/register', {
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
        toast.error(data.message || 'Error al registrar usuario.');
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>Registro</h1>
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
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="phone"
            placeholder="Teléfono"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          {/* Selector de País */}
          <div className="form-group">
            <label htmlFor="country-select">País</label>
            <Select
              id="country-select"
              className="select-country"
              options={countries}
              value={selectedCountry}
              onChange={handleCountryChange}
              placeholder="Selecciona tu País"
            />
          </div>
          {/* Selector de Provincia */}
          {selectedCountry && provinces[selectedCountry.value] && (
            <div className="form-group">
              <label htmlFor="province-select">Provincia</label>
              <Select
                id="province-select"
                className="select-province"
                options={provinces[selectedCountry.value]}
                value={selectedProvince}
                onChange={handleProvinceChange}
                placeholder="Selecciona tu Provincia"
              />
            </div>
          )}
          <input
            type="text"
            name="companyName"
            placeholder="Nombre de la Compañia"
            value={formData.companyName}
            onChange={handleChange}
            required
          />
          <button type="submit">Registrarse</button>
        </form>


        {/* Enlace para redirigir a la página de Login */}
        <p className="login-prompt">
          ¿Ya tienes una cuenta? <a href="/login">Inicia sesión aquí</a>
        </p>
      </div>
      <ToastContainer />

    </div>
  );
};

export default Register;
