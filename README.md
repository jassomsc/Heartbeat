# Heartbeat AI

Versión funcional de Heartbeat con:
- análisis de la situación mediante OpenAI Responses API;
- recomendaciones a partir de un catálogo curado de temas musicales;
- conexión opcional con Spotify mediante OAuth 2.0 + PKCE;
- personalización con los artistas más escuchados de Spotify;
- búsqueda de las canciones recomendadas en Spotify;
- apertura directa de la canción en Spotify;
- modo demo si no hay OPENAI_API_KEY;
- diseño responsive.

## 1. Requisitos

Instala Node.js 20+.

## 2. Instalar

```bash
npm install
```

## 3. Variables de entorno

Copia `.env.example` a `.env` y completa:

```env
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5
SPOTIFY_CLIENT_ID=...
PORT=3000
```

No pongas el Client Secret de Spotify en el frontend. Esta versión usa PKCE, por lo que el flujo del navegador no necesita exponer un secret.

## 4. Crear la app de Spotify

1. Entra a Spotify for Developers.
2. Crea una app.
3. Copia el Client ID.
4. Agrega exactamente este Redirect URI:

```text
http://127.0.0.1:3000/
```

5. Pon el Client ID en `.env`.

La app pide `user-top-read` para conocer artistas más escuchados y permisos de reproducción/control solo si se utilizan esas funciones.

## 5. Ejecutar

```bash
npm start
```

Abre:

```text
http://127.0.0.1:3000/
```

## 6. Qué hace la IA

La IA recibe la situación escrita por la persona y devuelve un perfil estructurado: emoción, tono, relación, palabras clave, temas e intensidad. Después Heartbeat cruza ese perfil con un catálogo de canciones que contiene descripciones temáticas redactadas para el prototipo.

Importante: esta versión NO descarga ni manda letras completas de canciones a la IA. Para analizar letras reales habría que integrar una fuente de letras con licencia y revisar sus condiciones de uso.

## 7. Cómo se personaliza con Spotify

Heartbeat pide a Spotify los artistas más escuchados del usuario y usa esos nombres como señal de afinidad en el ranking local. No envía el historial de Spotify a OpenAI.

Después busca las canciones finalistas en el catálogo de Spotify y, si encuentra una coincidencia, muestra su portada y un botón para abrirla en Spotify.

## 8. Reproducción

La opción "Abrir en Spotify" funciona sin necesidad de que Heartbeat reproduzca el audio dentro de la página.

El control de reproducción directo de Spotify requiere permisos adicionales y, para el Web Playback SDK, una cuenta Premium. Además, Spotify impone restricciones específicas sobre streaming y uso comercial.

## 9. Para una versión final

Para que Heartbeat pueda decir literalmente "analicé la letra de esta canción", sustituye el catálogo temático por una fuente de letras licenciada y procesa únicamente el contenido permitido por esa licencia. No conviene copiar letras completas en la base de datos ni enviarlas indiscriminadamente a un modelo.
