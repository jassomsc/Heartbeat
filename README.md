# ❤️ Heartbeat

**Heartbeat** es una aplicación web de recomendación musical diseñada para ayudar a encontrar una canción que represente lo que una persona quiere expresar en una situación específica.

A partir de una descripción escrita por el usuario y datos como el tipo de relación, estado de ánimo y preferencias musicales, Heartbeat utiliza inteligencia artificial para analizar el contexto y generar **cinco recomendaciones de canciones**. Posteriormente, integra Spotify para localizar las canciones, mostrar sus portadas y permitir escucharlas antes de elegir una para dedicar.

> Proyecto académico desarrollado en la **Escuela Bancaria y Comercial (EBC)** · 2026

---

## 🎵 ¿Cómo funciona?

Heartbeat busca ir más allá de recomendar canciones únicamente por género o estado de ánimo.

El usuario describe la situación que está viviendo y el mensaje que quiere transmitir. La aplicación analiza aspectos como:

- la emoción principal y las emociones secundarias;
- el tipo de relación entre las personas;
- el mensaje que se desea comunicar;
- aquello que no se quiere comunicar accidentalmente;
- las circunstancias particulares de la situación;
- el estado de ánimo;
- y las preferencias musicales indicadas.

Con esta información, la inteligencia artificial genera **cinco recomendaciones musicales dinámicas** y asigna a cada canción un porcentaje de compatibilidad (`matchScore`) según qué tan bien se adapta su significado a la situación descrita.

Después, Heartbeat utiliza Spotify para localizar las canciones recomendadas, mostrar información musical y permitir al usuario escucharlas antes de realizar su elección.

---

## ✨ Funcionalidades principales

- Análisis de situaciones mediante la API de OpenAI.
- Generación dinámica de cinco recomendaciones musicales.
- Recomendaciones basadas en el contexto específico de la situación.
- Consideración del tipo de relación, emociones, intención y preferencias musicales.
- Porcentaje de compatibilidad para cada recomendación.
- Integración con Spotify mediante OAuth 2.0 + PKCE.
- Búsqueda automática de las canciones recomendadas en Spotify.
- Visualización de portadas de álbumes.
- Reproducción de canciones mediante Spotify.
- Selección de una canción para dedicar.
- Personalización de la dedicatoria.
- Copia del enlace de Spotify.
- Opción para compartir mediante WhatsApp.
- Generación de contenido para compartir en Instagram.
- Diseño responsivo para diferentes tamaños de pantalla.

---

## 🛠️ Tecnologías utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express

### APIs y servicios

- OpenAI API
- Spotify Web API
- Spotify OAuth 2.0 con Authorization Code + PKCE

### Dependencias

- `express`
- `openai`
- `dotenv`

---

# 🚀 Instalación y ejecución

Esta sección contiene los pasos necesarios para ejecutar Heartbeat de manera local.

## 1. Requisitos previos

Antes de comenzar es necesario contar con:

- Node.js instalado.
- Una cuenta de OpenAI con acceso a su API.
- Una API Key de OpenAI con crédito disponible.
- Una cuenta de Spotify.
- Una aplicación creada en Spotify for Developers.
- Conexión a Internet.

Las credenciales personales utilizadas durante el desarrollo **no se encuentran incluidas en este repositorio**. Cada persona que ejecute el proyecto debe utilizar sus propias credenciales.

---

## 2. Clonar el repositorio

Desde una Terminal, ejecutar:

```bash
git clone https://github.com/jassomsc/Heartbeat.git
```

Después, entrar a la carpeta del proyecto:

```bash
cd Heartbeat
```

---

## 3. Instalar las dependencias

Ejecutar:

```bash
npm install
```

Esto instalará automáticamente las dependencias definidas en `package.json`.

---

## 4. Configurar las variables de entorno

El repositorio contiene el archivo:

```text
.env.example
```

Este archivo funciona como plantilla para configurar las credenciales necesarias.

Se debe crear una copia llamada:

```text
.env
```

En macOS o Linux puede realizarse desde la Terminal con:

```bash
cp .env.example .env
```

En Windows:

```bash
copy .env.example .env
```

El archivo deberá conservar la siguiente estructura:

```env
# OpenAI
OPENAI_API_KEY=pon_tu_api_key_aqui
OPENAI_MODEL=gpt-5.6-luna

# Spotify
SPOTIFY_CLIENT_ID=pon_tu_client_id_aqui
PORT=3000
```

Los valores de ejemplo deben sustituirse por las credenciales correspondientes.

> ⚠️ **Importante:** el archivo `.env` contiene información sensible y está excluido del repositorio mediante `.gitignore`. Nunca debe subirse a GitHub.

---

# 🤖 Configuración de OpenAI

Heartbeat utiliza la **OpenAI API** para analizar la situación escrita por el usuario y generar las cinco recomendaciones musicales.

Es necesario obtener una API Key de OpenAI y colocarla en el archivo `.env`:

```env
OPENAI_API_KEY=tu_api_key
```

El modelo utilizado se define mediante:

```env
OPENAI_MODEL=gpt-5.6-luna
```

La cuenta asociada a la API Key debe contar con acceso al modelo configurado y crédito disponible para utilizar la API.

El uso de la API puede generar costos dependiendo del modelo utilizado y del consumo realizado.

### ¿Qué analiza la IA?

La IA recibe información como:

- situación descrita;
- tipo de relación;
- estado de ánimo;
- género musical preferido.

A partir de ella intenta diferenciar:

1. qué siente el usuario;
2. qué quiere comunicar;
3. qué no quiere comunicar;
4. qué circunstancias hacen particular esa situación.

La aplicación solicita cinco canciones existentes y evalúa individualmente qué tan bien se adapta cada una a la dedicatoria.

### Match Score

Cada recomendación incluye un `matchScore` entre 0 y 100.

Este valor representa **qué tan bien encaja el significado de la canción con la situación específica descrita por el usuario**.

No representa popularidad, probabilidad ni la confianza de la IA.

La aplicación también maneja por separado un valor de `confidence`, utilizado para representar el nivel de confianza del modelo respecto a la identificación y significado de la canción.

> Heartbeat no descarga, almacena ni envía letras completas de canciones a OpenAI. Las recomendaciones se generan a partir del análisis de la situación y del conocimiento musical disponible para el modelo, por lo que sus resultados pueden contener imprecisiones.

---

# 🎧 Configuración de Spotify

Spotify se utiliza para complementar las recomendaciones generadas por Heartbeat.

Después de obtener las canciones sugeridas, la aplicación las busca en Spotify para obtener información como su portada, enlace y opciones de reproducción disponibles.

## 1. Crear una aplicación de Spotify

Para utilizar esta integración:

1. Ingresar a Spotify for Developers.
2. Crear una nueva aplicación.
3. Obtener el **Client ID**.
4. Agregar el Client ID al archivo `.env`:

```env
SPOTIFY_CLIENT_ID=tu_client_id_de_spotify
```

Heartbeat utiliza **Authorization Code con PKCE**, por lo que el flujo utilizado por el navegador no requiere almacenar ni exponer un Spotify Client Secret.

---

## 2. Configurar la Redirect URI

En la configuración de la aplicación creada en Spotify debe agregarse exactamente:

```text
http://127.0.0.1:3000/
```

La dirección debe coincidir con la utilizada por Heartbeat.

> Si se modifica `PORT` dentro del archivo `.env`, también deberá configurarse en Spotify una Redirect URI que utilice ese mismo puerto.

Dependiendo de la configuración y modo de desarrollo de la aplicación creada en Spotify, puede ser necesario autorizar previamente las cuentas que utilizarán la integración.

---

# ▶️ Iniciar Heartbeat

Una vez instaladas las dependencias y configurado el archivo `.env`, ejecutar:

```bash
npm start
```

Heartbeat iniciará su servidor local.

Si las variables principales fueron detectadas correctamente, la Terminal mostrará:

```text
❤️  HEARTBEAT
Heartbeat abierto en http://127.0.0.1:3000
IA: API key detectada ✓
Spotify: Client ID detectado ✓
```

Después, abrir en el navegador:

```text
http://127.0.0.1:3000/
```

> **No se recomienda abrir `public/index.html` directamente.** Heartbeat necesita ejecutarse mediante su servidor de Node.js para acceder al backend de OpenAI y proporcionar al frontend la configuración necesaria para Spotify.

Para detener el servidor puede utilizarse:

```text
Ctrl + C
```

en la Terminal donde se está ejecutando Heartbeat.

---

# 💡 Flujo de uso

Una vez iniciada la aplicación:

1. Seleccionar las preferencias musicales.
2. Indicar el nombre de la persona a quien se desea dedicar la canción.
3. Describir la situación y lo que se desea expresar.
4. Seleccionar el tipo de relación.
5. Indicar el estado de ánimo.
6. Conectar Spotify cuando sea necesario.
7. Solicitar el análisis.
8. Esperar mientras Heartbeat genera cinco recomendaciones.
9. Revisar el porcentaje de compatibilidad y explicación de cada canción.
10. Escuchar las opciones disponibles mediante Spotify.
11. Seleccionar una canción.
12. Escribir una dedicatoria personalizada.
13. Compartirla utilizando alguna de las opciones disponibles.

---

# 🔐 Seguridad y credenciales

Heartbeat separa las credenciales privadas del código fuente.

La variable:

```text
OPENAI_API_KEY
```

permanece en el servidor y no se proporciona directamente al navegador.

El archivo `.env` está excluido del repositorio mediante `.gitignore`, evitando que las credenciales locales sean publicadas accidentalmente en GitHub.

El Spotify Client ID se proporciona al frontend mediante:

```text
/api/config
```

Un Client ID identifica a la aplicación de Spotify, mientras que la autenticación del usuario se realiza mediante OAuth 2.0 con PKCE.

**Nunca deben agregarse API Keys, Client Secrets, tokens de acceso u otras credenciales privadas directamente al código fuente o al repositorio.**

---

# 📁 Estructura general del proyecto

```text
heartbeat-ai/
│
├── public/
│   ├── index.html
│   ├── spotify.js
│   ├── styles_heartbeat.css
│   ├── mis-dedicatorias.html
│   └── ...
│
├── server.mjs
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

### `public/`

Contiene la interfaz de Heartbeat, estilos, lógica ejecutada en el navegador e integración del frontend con Spotify.

### `server.mjs`

Contiene el servidor de Express, el endpoint utilizado para el análisis mediante OpenAI y la configuración que se proporciona al frontend.

### `spotify.js`

Gestiona la autenticación con Spotify mediante PKCE y las funciones utilizadas para interactuar con Spotify desde el navegador.

### `package.json`

Define la configuración del proyecto, scripts y dependencias de Node.js.

### `.env.example`

Sirve como plantilla para indicar qué variables de entorno necesita Heartbeat sin publicar credenciales reales.

---

# ❤️ Acerca del proyecto

Heartbeat nació a partir de una motivación personal y de mi personalidad melómana hasta los huesos. En distintas ocasiones he experimentado lo difícil que puede ser encontrar una canción que represente exactamente un sentimiento, una persona o un momento, llegando incluso a dedicar horas a esa búsqueda.

Por ello, Heartbeat utiliza la tecnología para **agilizar el proceso de encontrar una canción que ayude a expresar aquello que a veces es difícil poner en palabras**. Su propósito no es sustituir la sensibilidad ni la experiencia humana detrás de la música, sino utilizar la inteligencia artificial como una herramienta de apoyo para acercar al usuario a ella.

El proyecto comenzó como un prototipo académico que podía funcionar con un número limitado de canciones precargadas. Durante su desarrollo, el alcance se amplió mediante la integración de OpenAI y Spotify, permitiendo convertir el concepto inicial en una experiencia dinámica y funcional.

Su desarrollo permitió aplicar conocimientos de frontend y backend, diseño responsivo, consumo de APIs, autenticación mediante PKCE, variables de entorno, seguridad de credenciales e integración de inteligencia artificial.

---

## 👩‍💻 Autora

**Manola Sarahí Cuellar Jasso**

Estudiante de la **Escuela Bancaria y Comercial (EBC)**.

**2026**

Desarrollado en México 🇲🇽