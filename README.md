## Ejecución Cronológica

### Inicio del Servidor (index.js):
1. Se ejecuta `src/index.js`.
2. Importa la aplicación desde `app.js`.
3. Define el puerto y comienza a escuchar las solicitudes.

### Configuración de la Aplicación (app.js):
1. Se ejecuta la función `connectDB()` para conectar con MongoDB.
2. Configura el middleware `express.json()` para parsear cuerpos de solicitudes JSON.
3. Define las rutas de la API (`/api/users`) y las enlaza con `userRoutes`.

### Conexión a la Base de Datos (db.js):
1. La función `connectDB()` se ejecuta.
2. `mongoose.connect` intenta establecer una conexión con MongoDB usando la URL y las opciones de configuración proporcionadas.
3. Si la conexión es exitosa, imprime "MongoDB connected successfully".
4. Si falla, imprime el error y detiene la aplicación.

### Manejo de Solicitudes de Usuario (userRoutes.js y userController.js):
1. Cuando se recibe una solicitud POST a `/api/users/register`, se llama a la función `registerUser` del controlador.
2. `registerUser` recibe los datos del cuerpo de la solicitud, crea un nuevo usuario usando el modelo `User` y lo guarda en la base de datos.
3. Responde con un mensaje de éxito o error basado en el resultado de la operación.
