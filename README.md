# ❤️ Heartbeat

**Heartbeat** es una aplicación web de recomendación musical diseñada para ayudar a encontrar una canción que represente lo que una persona quiere expresar en una situación específica.

A partir de una descripción escrita por el usuario, su estado de ánimo y sus preferencias musicales, Heartbeat utiliza inteligencia artificial para analizar el contexto emocional y generar **cinco recomendaciones de canciones**. Posteriormente, integra Spotify para localizar las canciones, mostrar sus portadas, permitir su reproducción y utilizar los gustos musicales del usuario para personalizar aún más la experiencia.

> Proyecto académico desarrollado en la **Escuela Bancaria y Comercial (EBC)** · 2026

---

## 🌐 Probar Heartbeat

Heartbeat se encuentra desplegado públicamente mediante Render y puede utilizarse directamente desde el navegador:

**https://heartbeat-rxh0.onrender.com/**

La versión pública no requiere instalar Node.js, clonar el repositorio ni configurar una API Key de OpenAI de manera local.

> **Nota sobre Spotify:** la aplicación de Spotify utilizada por Heartbeat se encuentra configurada en modo de desarrollo. Por esta razón, la autenticación mediante Spotify puede estar limitada a las cuentas previamente autorizadas dentro de Spotify for Developers. El resto de las funciones de Heartbeat puede utilizarse independientemente de esta restricción.

---

## 🎵 ¿Cómo funciona?

Heartbeat busca ir más allá de recomendar canciones únicamente por género o estado de ánimo.

El usuario describe la situación que está viviendo y aquello que quiere transmitir mediante una canción. La aplicación analiza aspectos como:

- la emoción principal y las emociones secundarias;
- el vínculo o relación descrita por el usuario;
- el mensaje que se desea comunicar;
- aquello que no se quiere comunicar accidentalmente;
- las circunstancias particulares de la situación;
- el estado de ánimo;
- y las preferencias musicales indicadas.

Con esta información, la inteligencia artificial genera **cinco recomendaciones musicales dinámicas** y asigna a cada canción un porcentaje de compatibilidad (`matchScore`) según qué tan bien se adapta su significado a la situación descrita.

Después, Heartbeat busca las canciones recomendadas mediante Spotify para obtener información musical, portadas, enlaces y opciones de reproducción.

Si el usuario conecta su cuenta de Spotify, Heartbeat también puede consultar sus artistas más escuchados y utilizar esta información como un elemento adicional de personalización.

Finalmente, el usuario puede seleccionar una canción, escribir una dedicatoria y compartir el resultado.

---

## ✨ Funcionalidades principales

- Análisis de situaciones mediante la API de OpenAI.
- Generación dinámica de cinco recomendaciones musicales.
- Análisis del contexto específico de cada situación.
- Consideración de emociones, intención, circunstancias y preferencias musicales.
- Porcentaje de compatibilidad individual para cada recomendación.
- Integración con Spotify mediante OAuth 2.0 + PKCE.
- Personalización mediante los artistas más escuchados del usuario en Spotify.
- Búsqueda automática de las canciones recomendadas en Spotify.
- Visualización de portadas de álbumes.
- Reproducción mediante el reproductor integrado de Spotify.
- Enlace directo a cada canción en Spotify.
- Selección de una canción para dedicar.
- Personalización de la dedicatoria.
- Copia del enlace de Spotify.
- Opción para compartir mediante WhatsApp.
- Generación de una imagen vertical para compartir como Story de Instagram.
- Diseño responsivo para diferentes tamaños de pantalla.
- Versión pública desplegada mediante Render.

---

# 🧠 Arquitectura general

Heartbeat combina una interfaz web ejecutada en el navegador con un servidor desarrollado en Node.js y Express.

El flujo general puede representarse de la siguiente manera:

```text
Usuario
   │
   ▼
Frontend
HTML + CSS + JavaScript
   │
   ├──────────────► Spotify Web API
   │                OAuth 2.0 + PKCE
   │
   ▼
Servidor Node.js + Express
   │
   ▼
OpenAI API
   │
   ▼
Recomendaciones musicales
   │
   ▼
Frontend
   │
   ▼
Búsqueda y reproducción mediante Spotify
```

La comunicación con OpenAI se realiza desde el servidor para evitar exponer la API Key en el navegador.

Spotify utiliza un flujo diferente: la autenticación del usuario se realiza desde el navegador mediante **Authorization Code con PKCE**, evitando la necesidad de almacenar un Spotify Client Secret en el frontend.

---

## 🛠️ Tecnologías utilizadas

### Frontend

- HTML5
- CSS3
- JavaScript
- Canvas API para la generación de contenido compartible

### Backend

- Node.js
- Express

### APIs y servicios

- OpenAI API
- Spotify Web API
- Spotify OAuth 2.0 con Authorization Code + PKCE
- Render para el despliegue de la aplicación

### Dependencias principales

- `express`
- `openai`
- `dotenv`

---

# 🚀 Ejecución local

Además de la versión pública, Heartbeat puede ejecutarse de manera local para desarrollo, pruebas o evaluación académica.

## 1. Requisitos previos

Para ejecutar todas las funciones de Heartbeat localmente es necesario contar con:

- Node.js instalado.
- Una cuenta de OpenAI con acceso a su API.
- Una API Key de OpenAI con crédito disponible.
- Una cuenta de Spotify.
- Una aplicación creada en Spotify for Developers.
- Conexión a Internet.

Las credenciales personales utilizadas durante el desarrollo **no se encuentran incluidas en este repositorio**. Cada persona que ejecute su propia instancia local debe utilizar sus propias credenciales.

---

## 2. Clonar el repositorio

Desde una Terminal, ejecutar:

```bash
git clone https://github.com/jassomsc/Heartbeat.git
```

Después, entrar a la carpeta:

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

El repositorio contiene:

```text
.env.example
```

Este archivo funciona como plantilla para indicar las variables necesarias sin incluir credenciales reales.

Se debe crear una copia llamada:

```text
.env
```

En macOS o Linux:

```bash
cp .env.example .env
```

En Windows:

```bash
copy .env.example .env
```

La estructura es:

```env
# OpenAI
OPENAI_API_KEY=pon_tu_api_key_aqui
OPENAI_MODEL=gpt-5.6-luna

# Spotify
SPOTIFY_CLIENT_ID=pon_tu_client_id_aqui

PORT=3000
```

Los valores de ejemplo deben sustituirse por las credenciales correspondientes.

> ⚠️ **Importante:** `.env` contiene información privada y está excluido del repositorio mediante `.gitignore`. Nunca debe publicarse en GitHub.

---

# 🤖 Configuración de OpenAI

Heartbeat utiliza la **OpenAI API** para analizar la situación escrita por el usuario y generar cinco recomendaciones musicales.

La API Key debe colocarse en:

```env
OPENAI_API_KEY=tu_api_key
```

El modelo puede configurarse mediante:

```env
OPENAI_MODEL=gpt-5.6-luna
```

La cuenta asociada a la API Key debe tener acceso al modelo configurado y crédito disponible.

El uso de la API puede generar costos dependiendo del modelo y del consumo realizado.

## ¿Qué analiza la IA?

La IA recibe información como:

- situación descrita;
- vínculo o contexto entre las personas;
- estado de ánimo;
- género musical preferido.

A partir de esta información intenta diferenciar:

1. qué siente el usuario;
2. qué quiere comunicar;
3. qué no quiere comunicar;
4. qué circunstancias hacen particular esa situación.

La aplicación solicita cinco canciones existentes y evalúa individualmente qué tan bien se adapta cada una al contexto.

## Match Score

Cada recomendación incluye un `matchScore` entre 0 y 100.

Este valor representa **qué tan bien encaja el significado de la canción con la situación específica descrita por el usuario**.

No representa popularidad ni probabilidad.

La aplicación también maneja por separado un valor de `confidence`, utilizado para representar el nivel de confianza del modelo respecto a la identificación y significado de la canción.

> Heartbeat no descarga, almacena ni envía letras completas de canciones a OpenAI. Las recomendaciones se generan a partir del análisis de la situación y del conocimiento musical disponible para el modelo, por lo que los resultados generados por inteligencia artificial pueden contener imprecisiones.

---

# 🎧 Configuración de Spotify

Spotify complementa las recomendaciones generadas por Heartbeat.

La aplicación puede utilizar Spotify para:

- localizar las canciones recomendadas;
- obtener sus portadas;
- obtener sus enlaces oficiales;
- permitir su reproducción mediante el reproductor integrado;
- consultar los artistas más escuchados del usuario cuando este autoriza la conexión.

## OAuth 2.0 + PKCE

Heartbeat utiliza **Authorization Code con PKCE**.

Este mecanismo permite realizar la autorización desde el navegador sin almacenar ni exponer un Spotify Client Secret.

Durante el proceso se genera un `code_verifier` temporal y su correspondiente `code_challenge`. Después de que el usuario autoriza Heartbeat, Spotify devuelve un código de autorización que se intercambia por un token de acceso.

---

## Configuración para desarrollo local

Para utilizar Spotify en una instalación local:

1. Ingresar a Spotify for Developers.
2. Crear una aplicación.
3. Obtener su **Client ID**.
4. Colocar el Client ID en `.env`:

```env
SPOTIFY_CLIENT_ID=tu_client_id_de_spotify
```

5. Agregar como Redirect URI:

```text
http://127.0.0.1:3000/
```

La dirección debe coincidir exactamente con la utilizada por Heartbeat.

> Si se modifica `PORT`, también deberá configurarse en Spotify una Redirect URI compatible con el nuevo puerto.

Dependiendo de las restricciones vigentes de Spotify para aplicaciones en modo de desarrollo, puede ser necesario agregar previamente las cuentas autorizadas desde el panel de Spotify for Developers.

---

# ▶️ Iniciar Heartbeat localmente

Una vez instaladas las dependencias y configurado `.env`, ejecutar:

```bash
npm start
```

El servidor se iniciará mediante Node.js y Express.

Con la configuración predeterminada, Heartbeat estará disponible en:

```text
http://127.0.0.1:3000/
```

> **No se recomienda abrir `public/index.html` directamente.** Heartbeat necesita ejecutarse mediante su servidor de Node.js para utilizar el backend de OpenAI y obtener la configuración necesaria para Spotify.

Para detener el servidor:

```text
Ctrl + C
```

---

# ☁️ Despliegue en Render

La versión pública de Heartbeat está desplegada mediante Render:

**https://heartbeat-rxh0.onrender.com/**

En producción, Render ejecuta el servidor Node.js y proporciona las variables de entorno necesarias sin incluirlas en el repositorio público.

El servidor utiliza el puerto proporcionado por el entorno de ejecución y escucha conexiones externas mediante:

```text
0.0.0.0
```

Heartbeat distingue entre el entorno local y el entorno desplegado para proporcionar la Redirect URI correspondiente a Spotify.

### Redirect URIs utilizadas

Para el proyecto actual se encuentran configuradas:

```text
http://127.0.0.1:3000/
https://heartbeat-rxh0.onrender.com/
```

Esto permite utilizar el flujo de autorización tanto durante el desarrollo local como desde la versión desplegada.

---

# 💡 Flujo de uso

Una vez abierta la aplicación:

1. Iniciar Heartbeat desde la pantalla principal.
2. Indicar el nombre de la persona a quien se desea dedicar la canción.
3. Describir la situación y aquello que se desea expresar.
4. Seleccionar un estado de ánimo.
5. Seleccionar un género musical.
6. Opcionalmente, conectar una cuenta de Spotify para personalizar la experiencia.
7. Solicitar el análisis.
8. Esperar mientras Heartbeat genera cinco recomendaciones.
9. Revisar el porcentaje de compatibilidad y la explicación de cada canción.
10. Escuchar las opciones disponibles mediante Spotify.
11. Seleccionar la canción que mejor represente el mensaje.
12. Escribir una dedicatoria personalizada.
13. Copiar el enlace o compartir mediante las opciones disponibles.

---

# 🔐 Seguridad y credenciales

Heartbeat separa las credenciales privadas del código fuente.

La variable:

```text
OPENAI_API_KEY
```

permanece únicamente en el servidor y **no se proporciona al navegador**.

Las variables privadas utilizadas por la versión desplegada se almacenan en la configuración del entorno de Render y no forman parte del repositorio.

El archivo local:

```text
.env
```

está excluido mediante `.gitignore`.

El Spotify Client ID se proporciona al frontend mediante:

```text
/api/config
```

El Client ID identifica a la aplicación de Spotify y no sustituye la autorización individual del usuario. La autenticación se realiza mediante OAuth 2.0 con PKCE.

Los tokens de Spotify pertenecen a la sesión autorizada por el usuario y no corresponden a la cuenta de la desarrolladora.

**Nunca deben agregarse API Keys, Client Secrets, access tokens u otras credenciales privadas directamente al código fuente o al repositorio.**

---

# 📁 Estructura general del proyecto

```text
heartbeat-ai/
│
├── public/
│   ├── index.html
│   ├── styles_heartbeat.css
│   ├── como-funciona.html
│   ├── mis-dedicatorias.html
│   ├── spotify.js
│   └── ...
│
├── server.mjs
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

### `public/`

Contiene la interfaz, estilos y lógica ejecutada en el navegador.

### `index.html`

Contiene la interfaz principal y la lógica del flujo de Heartbeat, incluyendo el análisis, la presentación de recomendaciones, la integración activa con Spotify y las opciones para compartir.

### `styles_heartbeat.css`

Contiene los estilos visuales y el diseño responsivo de la aplicación.

### `server.mjs`

Contiene el servidor de Express, el endpoint utilizado para el análisis mediante OpenAI y el endpoint de configuración utilizado por el frontend.

### `spotify.js`

Contiene funciones auxiliares desarrolladas durante la implementación de la integración con Spotify. El flujo principal utilizado actualmente por la interfaz se encuentra integrado en `index.html`.

### `package.json`

Define la configuración, scripts y dependencias de Node.js.

### `.env.example`

Documenta las variables de entorno necesarias sin publicar las credenciales reales.

---

# ❤️ Acerca del proyecto

Heartbeat nació a partir de una motivación personal y de mi personalidad melómana hasta los huesos. En distintas ocasiones he experimentado lo difícil que puede ser encontrar una canción que represente exactamente un sentimiento, una persona o un momento, llegando incluso a dedicar horas a esa búsqueda.

Por ello, Heartbeat utiliza la tecnología para **agilizar el proceso de encontrar una canción que ayude a expresar aquello que a veces es difícil poner en palabras**. Su propósito no es sustituir la sensibilidad ni la experiencia humana detrás de la música, sino utilizar la inteligencia artificial como una herramienta de apoyo para acercar al usuario a ella.

El proyecto comenzó como un prototipo académico que podía funcionar con un número limitado de canciones precargadas. Durante su desarrollo, el alcance se amplió mediante la integración de OpenAI y Spotify, permitiendo convertir el concepto inicial en una experiencia dinámica, conectada y funcional.

Además, el proyecto pasó de ejecutarse únicamente en un entorno local a contar con una **versión pública desplegada en la web**, incorporando configuración diferenciada para desarrollo y producción.

Su desarrollo permitió aplicar conocimientos de frontend y backend, diseño responsivo, consumo de APIs, autenticación mediante PKCE, variables de entorno, seguridad de credenciales, despliegue de aplicaciones web e integración de inteligencia artificial.

---

## 👩‍💻 Autora

**Manola Sarahí Cuellar Jasso**

Estudiante de la **Escuela Bancaria y Comercial (EBC)**.

**2026**

Desarrollado en México 🇲🇽