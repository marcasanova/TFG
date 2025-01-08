import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Importamos useNavigate para redirigir
import Navbar from './components/Navbar';
import './css/TableDetailsPage.css'; // Importamos el CSS específico
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const TableDetailsPage = () => {
  const { tableId } = useParams();
  const [tableDetails, setTableDetails] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [filling, setFilling] = useState(false);
  const [draining, setDraining] = useState(false);
  const [wateringPlan, setWateringPlan] = useState({
    days: [],
    fillTime: '',
    drainTime: ''
  });
  const [currentPlan, setCurrentPlan] = useState({
    days: [],
    fillTime: '',
    drainTime: ''
  });
  const [newTableName, setNewTableName] = useState('');  // Actualizamos para inicializar con el valor actual
  const [newTableDescription, setNewTableDescription] = useState('');  // Igual aquí
  const [imageFile, setImageFile] = useState(null); // Para la nueva imagen
  const [tableState, setTableState] = useState("Desconocido");



  // Estado para los datos de los sensores en tiempo real
  const [sensorData, setSensorData] = useState({
    temperature: 'No disponible',
    humidity: 'No disponible',
    waterLevel: 'No disponible',
    lastSensorDataAt: 'No disponible', // Nuevo campo
  });

  const navigate = useNavigate(); // Para redirigir después de eliminar la mesa

  // Días de la semana
  const daysOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    const fetchTableDetails = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('No token available');
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/tables/${tableId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (response.ok) {
          setTableDetails(data);
          // Sincronizar los estados de llenado y vaciado
          setFilling(data.state === 'filling');
          setDraining(data.state === 'draining');

          // Inicializar tanto la planificación actual como el formulario de edición
          if (data.wateringSchedule) {
            const schedule = {
              days: data.wateringSchedule.days || [],
              fillTime: data.wateringSchedule.fillTime || '',
              drainTime: data.wateringSchedule.drainTime || ''
            };

            setCurrentPlan(schedule); // Actualizar el estado de la planificación actual
            setWateringPlan(schedule); // Inicializar el formulario de edición
          }
        } else {
          toast.error(data.message || 'Error al cargar los detalles de la mesa');
        }
      } catch (error) {
        toast.error('Error al conectar con el servidor.');
      }
    };

    fetchTableDetails();
  }, [tableId]);

  // Manejar la selección de una nueva imagen
  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
    console.log("Archivo seleccionado:", e.target.files[0]);
  };

  // Subir la nueva imagen al servidor
  const handleImageUpload = async () => {
    if (!imageFile) {
      toast.error('No se ha seleccionado ninguna imagen.');
      return;
    }

    const formData = new FormData();
    formData.append('tableImage', imageFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/tables/${tableId}/upload-image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Imagen de la mesa actualizada con éxito.');
        setTableDetails((prevDetails) => ({
          ...prevDetails,
          tableImage: data.tableImage,
        }));
      } else {
        toast.error(data.message || 'Error al subir la imagen de la mesa.');
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor.');
    }
  };

  // Conexión con el WebSocket para recibir datos en tiempo real
  useEffect(() => {
    console.log('Iniciando conexión WebSocket...');

    const socket = new WebSocket('ws://localhost:8080');  // Conectarse al servidor WebSocket

    socket.onopen = () => {
      console.log('Conexión WebSocket abierta. Suscribiéndose a la mesa:', tableId);
      // Suscribirse a los datos de los sensores de la mesa
      socket.send(JSON.stringify({ action: 'subscribeToTable', tableId }));
    };

    socket.onerror = (error) => {
      console.error('Error en la conexión WebSocket:', error);
    };

    socket.onmessage = (event) => {
      console.log('Mensaje recibido desde el WebSocket:', event.data);
      const data = JSON.parse(event.data);

      // Asegúrate de que el mensaje contiene todos los datos necesarios
      if (data.action === 'fillComplete' || data.action === 'drainComplete') {
        // Mostrar mensaje de éxito en la pantalla
        toast.success(data.message);
        // Ocultar el mensaje después de 5 segundos
        setTimeout(() => setSuccessMessage(''), 5000);
      } else if (data.type === 'sensorData') {
        console.log('Datos de sensores y estado recibidos:', data);

        // Actualizar los datos de sensores
        setSensorData({
          temperature: data.temperature,
          humidity: data.humidity,
          waterLevel: data.waterLevel,
          lastSensorDataAt: data.lastSensorDataAt ? formatDate(data.lastSensorDataAt) : 'No disponible',
        });

        // Actualizar el estado de la mesa
        setTableState(data.state || 'Desconocido');

        // Actualizar las estadísticas de la mesa
        setTableDetails((prevDetails) => ({
          ...prevDetails,
          fillCount: data.fillCount ?? prevDetails?.fillCount,
          drainCount: data.drainCount ?? prevDetails?.drainCount,
          lastFilledAt: data.lastFilledAt ?? prevDetails?.lastFilledAt,
          lastDrainedAt: data.lastDrainedAt ?? prevDetails?.lastDrainedAt,
        }));

        // Sincronizar los estados de llenado y vaciado
        setFilling(data.state === 'filling');
        setDraining(data.state === 'draining');
      } else {
        console.log('Tipo de mensaje no reconocido:', data.type);
      }
    };


    socket.onclose = (event) => {
      if (event.wasClean) {
        console.log('Conexión WebSocket cerrada limpiamente.');
      } else {
        console.error('Conexión WebSocket cerrada inesperadamente.');
      }
      console.log('Código de cierre:', event.code, 'Motivo:', event.reason);
    };

    return () => {
      console.log('Cerrando conexión WebSocket...');
      socket.close(); // Limpiamos la conexión al desmontar el componente
    };
  }, [tableId]);

  // Función para llenar la mesa (llama al método fillTable en el backend)
  const handleFillTable = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No token available');
      return;
    }

    if (filling) {
      toast.info('La mesa ya se está llenando.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/tables/${tableId}/fill`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setFilling(true);  // Actualizamos el estado local
        toast.success('Llenando la mesa...');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Error al llenar la mesa');
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor.');
    }
  };

  // Función para vaciar la mesa (llama al método drainTable en el backend)
  const handleDrainTable = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No token available');
      return;
    }

    if (draining) {
      toast.info('La mesa ya se está vaciando.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/tables/${tableId}/drain`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setDraining(true);  // Actualizamos el estado local
        toast.success('Vaciando la mesa...');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Error al vaciar la mesa');
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor.');
    }
  };


  // Manejar la selección de los días
  const handleDaySelect = (day) => {
    setWateringPlan(prevPlan => {
      const newDays = prevPlan.days.includes(day)
        ? prevPlan.days.filter(d => d !== day) // Desmarcar si ya está seleccionado
        : [...prevPlan.days, day]; // Marcar si no está seleccionado
      return { ...prevPlan, days: newDays };
    });
  };

  // Función para validar y guardar el plan de riego
  const handleWateringPlan = async () => {

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No token available');
      return;
    }

    if (!wateringPlan.fillTime || !wateringPlan.drainTime) {
      toast.error('Las horas de llenado y vaciado son obligatorias');

      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/tables/${tableId}/watering-schedule`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(wateringPlan)
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Plan de riego guardado correctamente.');
        setCurrentPlan(wateringPlan); // Actualizar el estado de la planificación actual
        setTableDetails((prevDetails) => ({
          ...prevDetails,
          wateringSchedule: { ...wateringPlan }
        }));
      } else {
        toast.error(data.message || 'Error al guardar el plan de riego');
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor.');
    }
  };

  const handleDeleteTable = async () => {
    const confirmDelete = window.confirm("¿Estás seguro de que quieres eliminar esta mesa?");
    if (confirmDelete) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/tables/delete-table/${tableId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          toast.success('Mesa eliminada con éxito');

          // Redirigir a la página de las mesas
          navigate('/tables');
        } else {
          const data = await response.json();
          console.error('Error al eliminar mesa:', data.message || 'Error desconocido'); // Debugging error message
          toast.error(data.message || 'Error al eliminar la mesa');
        }
      } catch (error) {
        console.error('Error al conectar con el servidor:', error); // Debugging connection issue
        toast.error('Error al conectar con el servidor');
      }
    }
  };

  // Función para actualizar el nombre de la mesa
  const handleUpdateName = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No token available');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/tables/${tableId}/update-name`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newTableName })  // Usamos newTableName
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Nombre de la mesa actualizado correctamente')

        setTableDetails(prevDetails => ({ ...prevDetails, name: newTableName }));  // Actualizamos tableDetails
        setNewTableName(''); // Limpiar el input

      } else {

        toast.error(data.message || 'Error al actualizar el nombre');
      }
    } catch (error) {
      toast.error('Error al conectar con el servidor.');
    }
  };

  // Función para actualizar la descripción de la mesa
  const handleUpdateDescription = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('No token available');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/tables/${tableId}/update-description`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ description: newTableDescription })  // Usamos newTableDescription
      });

      const data = await response.json();
      if (response.ok) {
        toast.success('Descripción de la mesa actualizada correctamente')
        setTableDetails(prevDetails => ({ ...prevDetails, description: newTableDescription }));  // Actualizamos tableDetails
        setNewTableDescription(''); // Limpiar el input

      } else {
        toast.error(data.message || 'Error al actualizar la descripción')

      }
    } catch (error) {
      toast.error('Descripción de la mesa actualizada correctamente')

    }
  };

  // Función para formatear la fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';

    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat('es-ES', options).format(new Date(dateString));

    return formattedDate;
  };

  // Función para traducir los estados
  const translateState = (state) => {
    const translations = {
      filling: 'Llenándose',
      full: 'Llena',
      draining: 'Vaciándose',
      empty: 'Vacía',
    };

    return translations[state] || 'Desconocido';
  };


  return (
    <div className="table-details-container">
      <Navbar />

      {/* Título principal */}
      <header className="table-details-header">
        <h1>Detalles de la Mesa</h1>
      </header>

      {tableDetails ? (
        <div className="table-details-content">

          <section className="table-card-section">
            <div className="table-card">
              {/* Contenedor de la imagen y botones */}
              <div className="table-card-image">
                {tableDetails.tableImage ? (
                  <img
                    src={`http://localhost:5000${tableDetails.tableImage}`}
                    alt="Imagen de la Mesa"
                    className="table-image"
                  />
                ) : (
                  <div className="table-placeholder">Sin imagen</div>
                )}
                <div className="table-card-buttons">
                  <label className="custom-file-upload">
                    <input
                      type="file"
                      name="tableImage"
                      onChange={handleImageChange}
                      className="file-input"
                    />
                    Seleccionar Imagen
                  </label>
                  <button onClick={handleImageUpload} className="upload-btn">
                    Subir Imagen
                  </button>
                </div>
              </div>

              {/* Contenedor de la información */}
              <div className="table-card-info">
                <p>
                  <strong>ID de la Mesa:</strong> {tableDetails.tableId}
                </p>
                <p>
                  <strong>Nombre:</strong> {tableDetails.name}
                </p>
                <p>
                  <strong>Descripción:</strong> {tableDetails.description}
                </p>
              </div>
            </div>
          </section>

          {/* Control de Válvulas */}
          <section className="valve-control-section">
            <h2>Control de Válvulas</h2>
            <div className="valve-controls">
              {/* Estado en tiempo real */}
              <p className="state-indicator">Estado de la mesa: {translateState(tableState)}</p>
              <div className="valve-buttons">
                {filling ? (
                  <p className="status-indicator">Llenando la mesa...</p>
                ) : draining ? (
                  <p className="status-indicator">Vaciando la mesa...</p>
                ) : (
                  <>
                    <button onClick={handleFillTable} disabled={filling || draining}>
                      Llenar Mesa
                    </button>
                    <button onClick={handleDrainTable} disabled={filling || draining}>
                      Vaciar Mesa
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>


          <section className="sensor-data-section">
            <h2>Datos de Sensores en Tiempo Real</h2>
            <div className="sensor-data">
              {/* Temperatura */}
              <div className="sensor-item">
                <img
                  src='/temperature.png'
                  alt="Estado de temperatura"
                  className="sensor-image"
                />
                <p><strong>Temperatura:</strong> {sensorData.temperature} °C</p>
              </div>

              {/* Humedad */}
              <div className="sensor-item">
                <img
                  src='/humidity.png'
                  alt="Estado de humedad"
                  className="sensor-image"
                />
                <p><strong>Humedad:</strong> {sensorData.humidity}</p>
              </div>

              {/* Nivel de Agua */}
              <div className="sensor-item">
                <img
                  src='/waterlevel.png'
                  alt="Estado del nivel de agua"
                  className="sensor-image"
                />
                <p><strong>Nivel de Agua:</strong> {sensorData.waterLevel}%</p>
              </div>
            </div>
          </section>



          {/* Planificación de Riego */}
          <section className="watering-plan-section">
            <h2>Planificación de Riego</h2>
            <div className="watering-plan">
              <div className="watering-days">
                <label>Días:</label>
                <div className="days-selector">
                  {daysOfWeek.map((day, index) => {
                    const lowerCaseDay = day.toLowerCase(); // Convertimos cada día a minúsculas
                    return (
                      <button
                        key={index}
                        className={wateringPlan.days.includes(lowerCaseDay) ? 'selected-day' : 'unselected-day'}
                        onClick={() => handleDaySelect(lowerCaseDay)}
                      >
                        {day} {/* Mostrar el día con la primera letra en mayúscula */}
                      </button>
                    );
                  })}
                </div>

              </div>
              <div className="watering-times">
                <label>Hora de llenado:</label>
                <input
                  type="time"
                  value={wateringPlan.fillTime}
                  onChange={(e) => setWateringPlan({ ...wateringPlan, fillTime: e.target.value })}
                />
                <label>Hora de vaciado:</label>
                <input
                  type="time"
                  value={wateringPlan.drainTime}
                  onChange={(e) => setWateringPlan({ ...wateringPlan, drainTime: e.target.value })}
                />
              </div>
              <button onClick={handleWateringPlan}>Guardar Planificación</button>
            </div>
            {/* Resumen de la planificación actual */}
            {currentPlan.days.length > 0 || currentPlan.fillTime || currentPlan.drainTime ? (
              <div className="current-plan-summary">
                <h3>Planificación Actual:</h3>
                <ul>
                  <li><strong>Días seleccionados:</strong> {currentPlan.days.join(', ') || 'Ninguno'}</li>
                  <li><strong>Hora de llenado:</strong> {currentPlan.fillTime || 'No definido'}</li>
                  <li><strong>Hora de vaciado:</strong> {currentPlan.drainTime || 'No definido'}</li>
                </ul>
              </div>
            ) : (
              <p>No hay planificación actual definida.</p>
            )}
          </section>

          {/* Estadísticas */}
          <section className="statistics-section">
            <h2>Estadísticas</h2>
            <div className="statistics">
              <div className="stat-item">
                <img
                  src='/counter.png'
                  alt="Veces llenada"
                  className="stat-image"
                />
                <p><strong>Veces llenada:</strong> {tableDetails?.fillCount ?? 'No disponible'}</p>
              </div>
              {/* Veces vaciada */}
              <div className="stat-item">
                <img
                  src='/counter.png'
                  alt="Veces vaciada"
                  className="stat-image"
                />
                <p><strong>Veces vaciada:</strong> {tableDetails?.drainCount ?? 'No disponible'}</p>
              </div>

              {/* Última vez llenada */}
              <div className="stat-item">
                <img
                  src='/schedule.png'
                  alt="Última vez llenada"
                  className="stat-image"
                />
                <p><strong>Última vez llenada:</strong> {formatDate(tableDetails?.lastFilledAt)}</p>
              </div>

              {/* Última vez vaciada */}
              <div className="stat-item">
                <img
                  src='/schedule.png'
                  alt="Última vez vaciada"
                  className="stat-image"
                />
                <p><strong>Última vez vaciada:</strong> {formatDate(tableDetails?.lastDrainedAt)}</p>
              </div>

              <div className="stat-item">
                <img
                  src='/schedule.png'
                  alt="Última vez vaciada"
                  className="stat-image"
                />
              <p><strong>Última actualización de sensores:</strong> {sensorData.lastSensorDataAt}</p>
              </div>
            </div>
          </section>

          {/* Nueva sección para modificar elementos */}
          <section className="modify-elements-section">
            <h2>Actualizar la Información de la Mesa</h2>
            <div className="table-edit">
              <label htmlFor="tableName">Nombre:</label>
              <input
                id="tableName"
                type="text"
                placeholder="Nuevo nombre de la mesa"
                value={newTableName} // Este valor seguirá manejando el input controlado
                onChange={(e) => setNewTableName(e.target.value)}
                className="table-input2"
                required
              />
              <button onClick={handleUpdateName}>Guardar</button>
            </div>
            <div className="table-edit">
              <label htmlFor="tableDescription">Descripción:</label>
              <input
                id="tableDescription"
                type="text"
                placeholder="Nueva descripción de la mesa"
                value={newTableDescription} // Este valor seguirá manejando el input controlado
                onChange={(e) => setNewTableDescription(e.target.value)}
                className="table-input2"
                required
              />
              <button onClick={handleUpdateDescription}>Guardar</button>
            </div>
          </section>

          {/* Botón de eliminación */}
          <section className="delete-table-section">
            <button onClick={handleDeleteTable} className="delete-table-btn">Eliminar Mesa</button>
          </section>

        </div>
      ) : (
        <p>Cargando detalles...</p>
      )}

      {/* Mensajes */}
      {successMessage && <p className="success-message">{successMessage}</p>}
      <ToastContainer />

    </div>

  );
};

export default TableDetailsPage;
