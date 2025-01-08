# 🌱 Proyecto de Riego Automático Inteligente

**Autor:** Marc Casanova  
**Tecnologías:** Node.js, React, MongoDB, Arduino Nano BLE 33 IoT, WebSockets, MQTT  

---

## 🚀 Descripción del proyecto

Este proyecto consiste en un **sistema de riego automático inteligente** diseñado para optimizar el cuidado de plantas utilizando sensores y controladores. El sistema combina hardware avanzado y una plataforma web interactiva, lo que permite a los usuarios gestionar y monitorear sus mesas de cultivo en tiempo real.

🌟 **Características principales:**
- Riego automatizado basado en datos en tiempo real de sensores.
- Control manual de válvulas para llenar o vaciar mesas.
- Estadísticas avanzadas sobre temperatura, humedad y nivel de agua.
- Interfaz web responsiva y minimalista para gestión remota.
- Alerta sonora cuando las mesas están llenas.
- Integración con datos meteorológicos para planificar riegos.

---

## 🛠️ Hardware utilizado

El sistema emplea los siguientes componentes electrónicos:
- **Arduino Nano BLE 33 IoT**: Microcontrolador principal.
- **Sensor de nivel de agua**: Monitorea la cantidad de agua en las mesas.
- **Sensor de temperatura impermeable (DS18B20)**: Mide la temperatura del agua.
- **Sensor de humedad del suelo (capacitivo)**: Detecta el estado del suelo (seco, húmedo, mojado).
- **Válvulas solenoides**: Controlan el llenado y vaciado de agua.
- **Pantalla OLED**: Muestra la temperatura en tiempo real.
- **Actuador sirena**: Alerta cuando una mesa está llena.
- **Transformadores**: Proporcionan energía al sistema.

---

## 🌐 Arquitectura del sistema

El proyecto se divide en tres componentes principales:

1. **Backend**:
   - Construido con **Node.js** y **MongoDB**.
   - Gestiona usuarios, mesas, sensores y estadísticas.
   - Comunicación en tiempo real mediante **WebSockets**.
   - Integración con **MQTT** para interactuar con el hardware.
   - API RESTful para las operaciones del sistema.

2. **Frontend**:
   - Desarrollado en **React** con un diseño minimalista y responsivo.
   - Páginas principales:
     - **HomePage**: Muestra estadísticas y datos en tiempo real.
     - **ProfilePage**: Configuración del perfil de usuario.
     - **TablesPage**: Gestión de mesas y sensores.
     - **TableDetailsPage**: Información detallada de cada mesa.
   - **FilePond** para subir imágenes de perfil y mesas.

3. **Hardware (Arduino)**:
   - Controla sensores y válvulas solenoides.
   - Envía datos en tiempo real al backend mediante **MQTT**.
   - Monitoreo y ejecución de comandos para riego.

---

## 📊 Funcionalidades clave

- **Gestión de usuarios**:
  - Registro, login y autenticación con JWT.
  - Subida de imágenes de perfil.

- **Gestión de mesas**:
  - Creación, eliminación y visualización de mesas.
  - Datos en tiempo real de temperatura, humedad y nivel de agua.

- **Estadísticas y análisis**:
  - Promedios históricos de sensores.
  - Visualización gráfica de datos.

- **Control de válvulas**:
  - Riego automatizado o manual.
  - Estados de las mesas: `full`, `empty`, `filling`, `draining`.

- **Alertas**:
  - Sirena activada cuando las mesas están llenas.

---

## ⚙️ Instalación y configuración

Sigue estos pasos para instalar el proyecto localmente:

### **1. Clonar el repositorio**
```bash
git clone https://github.com/marcasanova/TFG.git
cd TFG
