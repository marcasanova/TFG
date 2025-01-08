import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate para redirigir
import Navbar from './components/Navbar';
import './css/ProfilePage.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ProfilePage = () => {
  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
    phone: '',
    country: '',
    province: '',
    companyName: '',
    profileImage: ''
  });

  const [imageFile, setImageFile] = useState(null);

  const navigate = useNavigate(); // Hook para redirigir

  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState(''); // Estado para el nuevo teléfono
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('No token available');
          return;
        }
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        const data = await response.json();
        if (response.ok) {
          setProfileData(data);
        } else {
          toast.error(data.message || 'Error al cargar el perfil.');
        }
      } catch (error) {
        toast.error('Error al conectar con el servidor.');
      }
    };
    fetchProfileData();
  }, []);

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
    console.log("Archivo seleccionado:", e.target.files[0]); // Debugging para ver el archivo seleccionado
  };

  const handleImageUpload = async () => {
    if (!imageFile) {
      toast.error('No se ha seleccionado ninguna imagen.');
      return;
    }
    const formData = new FormData();
    formData.append('profileImage', imageFile);
    console.log("Enviando imagen al servidor:", imageFile); // Debugging para verificar la imagen que se está enviando

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/upload-profile-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        console.log("Respuesta exitosa del servidor:", data); // Debugging para confirmar la respuesta del servidor
        toast.success('Imagen de perfil actualizada con éxito.');
        setProfileData({ ...profileData, profileImage: data.profileImage });
      } else {
        console.error("Error en la respuesta del servidor:", data); // Debugging para errores en la respuesta
        toast.error(data.message || 'Error al subir la imagen.');
      }
    } catch (error) {
      console.error("Error en la conexión con el servidor:", error); // Debugging para errores de conexión

      toast.error('Error al conectar con el servidor.');
    }
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    // Mostrar la ventana de confirmación
    if (window.confirm('¿Estás seguro de que quieres cambiar tu nombre de usuario?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/update-username', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ username: newUsername }),
        });
        const data = await response.json();
        if (response.ok) {
          toast.success('Nombre de usuario actualizado.');
          setProfileData({ ...profileData, username: newUsername });
          setNewUsername(''); // Limpiar el campo de entrada del nombre de usuario
        } else {
          toast.error(data.message || 'Error al actualizar el nombre de usuario.');
        }
      } catch (error) {
        toast.error('Error al conectar con el servidor.');
      }
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    // Mostrar la ventana de confirmación
    if (window.confirm('¿Estás seguro de que quieres cambiar tu correo electrónico?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/update-email', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: newEmail }),
        });
        const data = await response.json();
        if (response.ok) {
          toast.success('Correo electrónico actualizado.');
          setProfileData({ ...profileData, email: newEmail });
          setNewEmail(''); // Limpiar el campo de entrada del correo electrónico
        } else {
          toast.error(data.message || 'Error al actualizar el correo electrónico.');
        }
      } catch (error) {
        toast.error('Error al conectar con el servidor.');
      }
    }
  };

  // Nueva función para actualizar el número de teléfono
  const handleUpdatePhone = async (e) => {
    e.preventDefault();
    if (window.confirm('¿Estás seguro de que quieres cambiar tu número de teléfono?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/update-phone', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ phone: newPhone }),
        });
        const data = await response.json();
        if (response.ok) {
          toast.success('Número de teléfono actualizado.');
          setProfileData({ ...profileData, phone: newPhone });
          setNewPhone(''); // Limpiar el campo del número de teléfono
        } else {
          toast.error(data.message || 'Error al actualizar el número de teléfono.');
        }
      } catch (error) {
        toast.error('Error al conectar con el servidor.');
      }
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    // Verificar si la contraseña actual y la nueva son iguales
    if (currentPassword === newPassword) {
      toast.error('La nueva contraseña no puede ser igual a la actual.');
      return;
    }
    // Mostrar la ventana de confirmación
    if (window.confirm('¿Estás seguro de que quieres cambiar tu contraseña?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/update-password', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await response.json();
        if (response.ok) {
          toast.success('Contraseña actualizada con éxito.');
          setCurrentPassword(''); // Limpiar el campo de la contraseña actual
          setNewPassword(''); // Limpiar el campo de la nueva contraseña
        } else {
          toast.error(data.message || 'Error al actualizar la contraseña.');
        }
      } catch (error) {
        toast.error('Error al conectar con el servidor.');
      }
    }
  };

  // Función para eliminar el usuario
  const handleDeleteUser = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/delete', {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          toast.error('Usuario eliminado con éxito.');
          // Redirigir al usuario a la página de inicio de sesión después de eliminar su cuenta
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          toast.error(data.message || 'Error al eliminar la cuenta.');
        }
      } catch (error) {
        toast.error('Error al conectar con el servidor.');
      }
    }
  };
  // Función para manejar el cierre de sesión
  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem('token'); // Elimina el token de autenticación
      localStorage.removeItem('username'); // Elimina el username almacenado
      navigate('/login'); // Redirige al usuario a la página de inicio de sesión
    }
  };


  return (
    <div className="profile-container">
      <header>
        <Navbar />
      </header>

      <h1 className="profile-title">
        Ajustes del usuario {profileData.username}
      </h1>

      {/* Sección de la tarjeta de perfil */}
      <section className="profile-card">
        <div className="profile-info-section">
          <div className="profile-image-container">
            {profileData.profileImage ? (
              <img src={`http://localhost:5000${profileData.profileImage}`} alt="Profile" className="profile-image" />
            ) : (
              <div className="profile-placeholder"></div>
            )}
            <label className="custom-file-upload">
              <input type="file" name="profileImage" onChange={handleImageChange} className="file-input" />
              Seleccionar imagen
            </label>
            <button onClick={handleImageUpload} className="upload-btn">Subir Imagen</button>
          </div>

          <div className="profile-details">
            <div className="info-block">
              <p>
                <img src="/user.png" alt="Usuario" className="icon" />
                <strong> Usuario:</strong> {profileData.username}
              </p>
              <p>
                <img src="/gmail.png" alt="Email" className="icon" />
                <strong> Email:</strong> {profileData.email}
              </p>
              <p>
                <img src="/smartphone.png" alt="Teléfono" className="icon" />
                <strong> Teléfono:</strong> {profileData.phone}
              </p>
            </div>
            <div className="info-block">
              <p>
                <img src="/country.png" alt="País" className="icon" />
                <strong> País:</strong> {profileData.country}
              </p>
              <p>
                <img src="/placeholder.png" alt="Provincia" className="icon" />
                <strong> Provincia:</strong> {profileData.province}
              </p>
              <p>
                <img src="/enterprise.png" alt="Compañía" className="icon" />
                <strong> Compañía:</strong> {profileData.companyName}
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Sección de actualización de datos */}
      <section className="update-section">
        <h2>Actualizar Datos del Usuario</h2>

        <div className="form-section">
          <form onSubmit={handleUpdateUsername}>
            <input
              type="text"
              className='profile-input'
              placeholder="Nuevo nombre de usuario"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              required
            />
            <button type="submit" className="form-btn">Cambiar Nombre de Usuario</button>
          </form>

          <form onSubmit={handleUpdateEmail}>
            <input
              type="email"
              className='profile-input'
              placeholder="Nuevo correo electrónico"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <button type="submit" className="form-btn">Cambiar Correo Electrónico</button>
          </form>

          <form onSubmit={handleUpdatePhone}>
            <input
              type="text"
              className='profile-input'
              placeholder="Nuevo número de teléfono"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              required
            />
            <button type="submit" className="form-btn">Cambiar Número de Teléfono</button>
          </form>

          <form onSubmit={handleUpdatePassword}>
            <input
              type="password"
              className='profile-input'
              placeholder="Contraseña actual"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <input
              type="password"
              className='profile-input'
              placeholder="Nueva contraseña"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            <button type="submit" className="form-btn">Cambiar Contraseña</button>
          </form>
        </div>
      </section>

      {/* Botón para eliminar cuenta */}
      <div className="delete-section">
        <button className="delete-account-btn" onClick={handleDeleteUser}>
          Eliminar Cuenta
        </button>
        {/* Botón para cerrar sesión */}
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      {/* Mensajes */}
      <ToastContainer />

    </div>
  );

};

export default ProfilePage;
