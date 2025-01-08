import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Importar useNavigate para redirigir
import Navbar from './components/Navbar'; // Importamos la Navbar
import './css/TablesPage.css'; // Importamos el CSS específico
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const TablesPage = () => {

  const [tables, setTables] = useState([]); // Estado para almacenar las mesas del usuario
  const [tableName, setTableName] = useState(''); // Estado para el nombre de la mesa
  const [tableDescription, setTableDescription] = useState(''); // Estado para la descripción de la mesa
  const [username, setUsername] = useState(''); // Estado para el nombre del usuario logueado
  const navigate = useNavigate(); // Hook para redirigir

  // Función para obtener mesas del usuario
  const fetchTables = async () => {
    try {
      const token = localStorage.getItem('token'); // Obtener token de autenticación
      if (!token) {
        toast.error('No token available');
        return;
      }

      const response = await fetch('http://localhost:5000/api/tables/user-tables', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setTables(data); // Guardar las mesas en el estado
      } else {
        toast.error(data.message || 'Error al cargar las mesas');
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor.');
    }
  };

  // useEffect para obtener mesas al cargar la página
  useEffect(() => {
    fetchTables(); // Llamada para obtener las mesas al cargar la página
    const storedUsername = localStorage.getItem('username'); // Obtener el nombre de usuario del localStorage
    if (storedUsername) {
      setUsername(storedUsername); // Guardar el nombre de usuario en el estad
    }
  }, []);

  // Manejar la creación de nuevas mesas
  const handleCreateTable = async () => {
    if (!tableName || !tableDescription) {
      toast.error('El nombre y la descripción de la mesa son obligatorios.');
      return;
    }

    try {
      const token = localStorage.getItem('token'); // Obtener token del usuario
      if (!token) {
        toast.error('No token available');
        return;
      }

      const response = await fetch('http://localhost:5000/api/tables/create-table', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: tableName, description: tableDescription }) // Pasar el nombre y la descripción de la mesa
      });

      if (response.ok) {
        toast.success('Mesa creada exitosamente.'); // Mostrar mensaje de éxito
        // Refetch de las mesas actualizadas después de la creación
        await fetchTables(); // Llamada para volver a obtener las mesas
        setTableName(''); // Limpiar el campo de entrada del nombre
        setTableDescription(''); // Limpiar el campo de entrada de la descripción
      } else {
        const newTable = await response.json();
        toast.error(newTable.message || 'Error al crear la mesa');
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor.');
    }
  };

  // Función para manejar el click en una mesa y redirigir a la página de detalles
  const handleTableClick = (tableId) => {
    navigate(`/table/${tableId}`); // Redirigir a la página de detalles de la mesa
  };

  return (
    <div className="tables-container">
      <header>
        <Navbar /> {/* Navbar que se reutiliza en todas las páginas */}
      </header>

      <main>
        <h1>Gestión de mesas de riego automático</h1>
        <section className="create-table-section">
          <h2>Crear una nueva Mesa</h2>
          <div className="form-container">
            <input
              type="text"
              placeholder="Nombre de la Nueva Mesa"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              className="table-input"
            />
            <input
              type="text"
              placeholder="Descripción de la Nueva Mesa"
              value={tableDescription}
              onChange={(e) => setTableDescription(e.target.value)}
              className="table-input"
            />
            <button className="create-table-btn" onClick={handleCreateTable}>
              Crear Mesa
            </button>
          </div>
        </section>

        <section className="tables-list-section">
          <h2>Lista de las Mesas creadas por {username}</h2>
          <div className="tables-list">
            {tables.length > 0 ? (
              tables.map((table, index) => (
                <div
                  key={index}
                  className="table-item"
                  onClick={() => handleTableClick(table.tableId)}
                >
                  <div className="table-image-container">
                    {table.tableImage ? (
                      <img
                        src={`http://localhost:5000${table.tableImage}`}
                        alt={`Imagen de la mesa ${table.name}`}
                        className="table-image"
                      />
                    ) : (
                      <div className="table-placeholder">Sin Imagen</div>
                    )}
                  </div>
                  <p><strong>ID Mesa:</strong> {table.tableId}</p>
                  <p><strong>Nombre:</strong> {table.name}</p>
                  <p><strong>Descripción:</strong> {table.description}</p>
                </div>
              ))
            ) : (
              <p>No hay mesas creadas</p>
            )}
          </div>
        </section>
      </main>
      <ToastContainer />

    </div>
  );
};

export default TablesPage;
