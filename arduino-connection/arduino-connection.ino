#include <SPI.h>
#include <WiFiNINA.h>
#include <WiFiClient.h>
#include <PubSubClient.h>
#include <ArduinoHttpClient.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// Configuración Wi-Fi
const char* ssid = "iPhone de Marc";
const char* password = "123456789";

// Broker MQTT local (puerto 1883)
const char* mqtt_server = "172.20.10.6"; 
WiFiClient wifiClient;
PubSubClient client(wifiClient);

// Configuración del servidor backend
const char* backend_host = "172.20.10.6";
int backend_port = 5000;  
HttpClient httpClient = HttpClient(wifiClient, backend_host, backend_port);

// Token JWT
String token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NzQ2MDA5Mzg4OTNjNWFhZDg4ZTUxNGUiLCJpYXQiOjE3MzQ0MjYxNDUsImV4cCI6MTczNDQyOTc0NX0.zUiJImE-MS0yrgSJxo7nWXVLVqS3g7oGZmfCLK_9w3g";

// Definir el tableId
const char* tableId = "44";  // El tableId de la mesa en cuestión

// Sensor de Temperatura (DS18B20)
#define ONE_WIRE_BUS 2
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);

// Sensor de Humedad (Capacitive Soil Moisture Sensor v1.2)
int soilMoisturePin = A0;

// Sensor de Nivel de Agua (HC-SR04)
#define TRIG_PIN 9
#define ECHO_PIN 10
const float alturaTotalTanque = 100.0;  // Altura total del tanque

#define PIN_FILL 7
#define PIN_DRAIN 8

// Variables para almacenar valores de los sensores
float temperature = 0;
int soilMoistureValue = 0;
float porcentajeLlenado = 0;

// Variable para controlar si el tableId es válido
bool isTableIdValid = false;

void setup() {
  Serial.begin(9600);
  
  // Iniciar sensores
  sensors.begin();
  
  // Configuración de pines para el sensor ultrasónico
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(PIN_FILL, OUTPUT);
  pinMode(PIN_DRAIN, OUTPUT);
  digitalWrite(PIN_FILL, LOW);
  digitalWrite(PIN_DRAIN, LOW);
 
    
  client.setCallback(callback);


  // Conectar al Wi-Fi
  connectToWiFi();

  // Conectar al broker MQTT
  connectToMQTT();

  // Verificar si el tableId es válido
  verifyTableId();

  if (!isTableIdValid) {
    Serial.println("tableId no válido, no se publicarán datos.");
  }

  // Suscribirse al tópico de comandos
  String commandTopic = "table/" + String(tableId) + "/commands";
  if (client.subscribe(commandTopic.c_str())) {
    Serial.println("Suscripción exitosa al tópico de comandos: " + commandTopic);
  } else {
    Serial.println("Fallo al suscribirse al tópico de comandos: " + commandTopic);
  }
}

void loop() {
  if (!client.connected()) {
    reconnectMQTT();
  }
  client.loop();



  if (isTableIdValid) {
    // Leer valores de los sensores
    leerTemperatura();
    leerHumedad();
    leerNivelAgua();

    // Crear un JSON con los valores de los tres sensores
    String payload = "{";
    payload += "\"temperature\":" + String(temperature, 2) + ",";
    payload += "\"humidity\":" + String(soilMoistureValue) + ",";
    payload += "\"waterLevel\":" + String(porcentajeLlenado, 2);
    payload += "}";

    // Publicar en el tópico MQTT
    String topic = "table/" + String(tableId) + "/sensors/data";
    client.publish(topic.c_str(), payload.c_str());

    delay(10000); // Publicar cada 10 segundos
  } else {
    Serial.println("El tableId no es válido, no se enviarán datos.");
    delay(10000); // Esperar antes de volver a intentar
  }
}



void leerTemperatura() {
  sensors.requestTemperatures();
  temperature = sensors.getTempCByIndex(0);
  Serial.print("Temperatura del agua: ");
  Serial.print(temperature);
  Serial.println(" °C");
}

void leerHumedad() {
  soilMoistureValue = analogRead(soilMoisturePin);

  Serial.print("Humedad del suelo: ");
  Serial.println(soilMoistureValue);  // Solo imprime el valor numérico
}


void leerNivelAgua() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH);
  float distancia = (duration * 0.034) / 2;
  porcentajeLlenado = ((alturaTotalTanque - distancia) / alturaTotalTanque) * 100;
  porcentajeLlenado = constrain(porcentajeLlenado, 0, 100);

  Serial.print("Porcentaje de llenado: ");
  Serial.print(porcentajeLlenado);
  Serial.println("%");
}

void connectToWiFi() {
  Serial.println("Iniciando conexión Wi-Fi...");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print("Estado Wi-Fi: ");
    Serial.println(WiFi.status()); // Imprime el estado actual
    delay(2000);
  }
  Serial.println("Wi-Fi conectado");
}

void connectToMQTT() {
  client.setServer(mqtt_server, 1883);
  while (!client.connected()) {
    if (client.connect("ArduinoClient")) {
      Serial.println("Conectado al broker MQTT");
    } else {
      Serial.print("Fallo al conectar, rc=");
      Serial.print(client.state());
      delay(2000);
    }
  }
}

void reconnectMQTT() {
  while (!client.connected()) {
    if (client.connect("ArduinoClient")) {
      Serial.println("Reconectado al broker MQTT");
      // Resuscribirse al tópico de comandos
      String commandTopic = "table/" + String(tableId) + "/commands";
      if (client.subscribe(commandTopic.c_str())) {
        Serial.println("Suscripción exitosa al tópico de comandos: " + commandTopic);
      } else {
        Serial.println("Fallo al resuscribirse al tópico de comandos: " + commandTopic);
      }
    } else {
      delay(2000);
    }
  }
}


void verifyTableId() {
  Serial.println("Verificando tableId con el backend...");

  String url = "/api/tables/verify-table/" + String(tableId);
  httpClient.beginRequest();
  httpClient.get(url);
  httpClient.sendHeader("Authorization", "Bearer " + token);
  httpClient.endRequest();

  int statusCode = httpClient.responseStatusCode();
  String response = httpClient.responseBody();
  Serial.print("Código de estado: ");
  Serial.println(statusCode);
  Serial.print("Respuesta: ");
  Serial.println(response);

  if (statusCode == 200) {
    Serial.println("tableId es válido.");
    isTableIdValid = true;
  } else {
    Serial.println("tableId no es válido.");
    isTableIdValid = false;
  }

  httpClient.stop();
}

void publicarDatos(String topic, String value) {
  Serial.println("Publicando en MQTT:");
  Serial.println(topic + ": " + value);
  client.publish(topic.c_str(), value.c_str());
}

void callback(char* topic, byte* payload, unsigned int length) {
    String message;
    for (int i = 0; i < length; i++) {
        message += (char)payload[i];
    }

    Serial.println("Mensaje recibido en el Arduino:");
    Serial.print("Tópico: ");
    Serial.println(topic);
    Serial.print("Mensaje: ");
    Serial.println(message);

    // Verificar si el comando es 'fillTable'
    if (String(topic).endsWith("/commands")) {
        if (message == "fillTable") {
            Serial.println("Comando de llenado recibido. Ejecutando llenarMesa().");
            llenarMesa();
        } else if (message == "drainTable") {
            Serial.println("Comando de vaciado recibido. Ejecutando vaciarMesa().");
            vaciarMesa();
        } else {
            Serial.println("Comando desconocido recibido." + message);
        }
    } else {
        Serial.println("Tópico desconocido." + String(topic));
    }
}


void llenarMesa() {
  digitalWrite(PIN_FILL, HIGH);  // Activar válvula de llenado
  digitalWrite(PIN_DRAIN, LOW);  // Asegurarse de que la válvula de vaciado está cerrada
  Serial.println("Llenando la mesa...");

  // Enviar estado de llenado al backend
  publicarDatos("table/" + String(tableId) + "/status", "filling");

  delay(5000);  // Simular el tiempo de llenado (5 segundos)

  digitalWrite(PIN_FILL, LOW);  // Cerrar válvula de llenado
  Serial.println("Válvula de llenado cerrada después de 5 segundos");

  // Enviar estado de mesa llena al backend
  publicarDatos("table/" + String(tableId) + "/status", "full");
}


void vaciarMesa() {
  digitalWrite(PIN_FILL, LOW);  // Asegurarse de que la válvula de llenado esté cerrada
  digitalWrite(PIN_DRAIN, HIGH);  // Abrir válvula de vaciado
  Serial.println("Vaciando la mesa...");

  // Enviar estado de vaciado al backend
  publicarDatos("table/" + String(tableId) + "/status", "draining");

  delay(7000);  // Simular el tiempo de vaciado (5 segundos)

  digitalWrite(PIN_DRAIN, LOW);  // Cerrar válvula de vaciado
  Serial.println("Válvula de vaciado cerrada después de 5 segundos");

  // Enviar estado de mesa vacía al backend
  publicarDatos("table/" + String(tableId) + "/status", "empty");
}