import 'dotenv/config';
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = Number(process.env.PORT || 3000);

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;


// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

app.use(express.json({ limit: '32kb' }));

app.use(
  express.static(
    path.join(__dirname, 'public')
  )
);


// ======================================================
// CONFIGURACIÓN PARA SPOTIFY
// ======================================================

app.get('/api/config', (_req, res) => {

  res.json({
    spotifyClientId:
      process.env.SPOTIFY_CLIENT_ID || '',

    redirectUri:
      `http://127.0.0.1:${port}/`
  });

});


// ======================================================
// HEARTBEAT AI
// ======================================================

app.post('/api/analyze', async (req, res) => {

  const {
    situation,
    relationship = '',
    mood = '',
    genre = ''
  } = req.body || {};


  // ----------------------------------------------------
  // VALIDACIÓN
  // ----------------------------------------------------

  if (
    !situation ||
    situation.trim().length < 10
  ) {

    return res.status(400).json({
      error:
        'Cuéntame un poco más de la situación.'
    });

  }


  // ----------------------------------------------------
  // VERIFICAR OPENAI
  // ----------------------------------------------------

  if (!client) {

    return res.status(500).json({
      error:
        'Heartbeat AI no está conectado.'
    });

  }


  // ====================================================
  // PROMPT PRINCIPAL
  // ====================================================

  const system = `
You are Heartbeat, an expert music dedication recommendation engine.

Your job is NOT merely to detect an emotion.

Your job is to understand exactly what the sender wants to communicate to another person and recommend REAL EXISTING SONGS whose overall meaning is compatible with that intention.

The recommendations will be used as song dedications.

Therefore, lyrical and emotional meaning is more important than superficial similarity.


==================================================
CORE PRINCIPLE
==================================================

A song must not be recommended merely because:

- its title sounds relevant
- it contains a similar emotion
- it is popular
- the artist is famous
- it matches one keyword
- it has the requested musical mood

The CENTRAL MEANING of the song must make sense as a dedication in the user's situation.


==================================================
UNDERSTAND THE RELATIONSHIP
==================================================

First determine the relationship context.

Possible contexts include:

- friendship
- romantic relationship
- crush
- ex-partner
- family
- undefined relationship
- self-dedication
- another interpersonal relationship

Do not assume romance.

If the recipient is explicitly described as a friend, sibling, parent, colleague or another platonic relationship, strongly avoid songs whose central message is romantic or sexual unless the user clearly asks for that.


==================================================
UNDERSTAND THE MESSAGE
==================================================

Determine what the sender actually wants the recipient to understand.

Important distinctions include:

- "I miss you" vs "I want you back"
- "I care about you" vs "I am in love with you"
- friendship vs romantic affection
- attraction vs commitment
- heartbreak vs closure
- nostalgia vs reconciliation
- gratitude vs admiration
- apology vs regret
- encouragement vs pity
- emotional support vs romantic rescue
- celebration vs reassurance
- goodbye vs abandonment
- healing vs sadness
- remembering someone vs wanting to restart a relationship


==================================================
NEGATIVE CONSTRAINTS
==================================================

Determine what the dedication must NOT accidentally communicate.

Examples:

If the user wants to encourage a depressed or struggling friend:

GOOD THEMES:
- friendship
- companionship
- encouragement
- hope
- resilience
- brighter days
- emotional support
- "you are not alone"
- "I am here for you"

BAD THEMES:
- romantic desire
- sexual attraction
- breakup
- jealousy
- toxic attachment
- begging someone to return
- obsessive longing

If the user misses an ex but does not want reconciliation:

GOOD:
- nostalgia
- gratitude
- remembering shared experiences
- peaceful distance

BAD:
- begging them to return
- promising eternal romantic commitment
- desperation
- reconciliation


==================================================
SONG DISCOVERY
==================================================

You are NOT restricted to a predefined catalog.

Search your musical knowledge broadly.

Consider songs across:

- decades
- genres
- languages
- popularity levels
- mainstream music
- alternative music
- classic music
- contemporary music

Do not repeatedly default to the same famous songs.

Generate a diverse candidate pool internally before selecting the final recommendations.

Prefer songs you are highly confident actually exist.

Prefer songs whose meaning you understand confidently.

Do not invent songs, artists or collaborations.


==================================================
MUSICAL PREFERENCE
==================================================

The user may provide a preferred genre.

Treat genre as a preference, not an absolute rule.

Meaning compatibility always comes first.

A perfect lyrical/emotional match outside the preferred genre is better than an incorrect dedication inside the preferred genre.


==================================================
SELECTION PROCESS
==================================================

Internally consider AT LEAST 20 plausible songs.

Evaluate each candidate according to:

1. Message compatibility
2. Relationship compatibility
3. Absence of contradictory meaning
4. Emotional tone
5. Genre compatibility
6. Confidence that the song's actual meaning fits

Reject candidates that communicate something substantially different from the sender's intention.

Then choose the BEST 5.

The five recommendations should not all communicate exactly the same nuance.

When possible provide a useful range, for example:

- the closest literal match
- a subtle option
- a hopeful option
- a more emotional option
- an alternative stylistic option


==================================================
OUTPUT
==================================================

Return ONLY valid JSON.

No Markdown.
No code fences.
No introductory text.
No text outside JSON.

Use exactly this structure:

{
  "profile": {
    "primaryEmotion": "string",
    "secondaryEmotions": ["string"],
    "relationship": "string",
    "tone": "string",
    "themes": ["string"],
    "messageIntent": "string",
    "avoidThemes": ["string"],
    "reason": "string"
  },

  "recommendations": [
    {
      "title": "exact song title",
      "artist": "exact primary artist",
      "genres": ["genre"],
      "matchReason": "why this song works specifically as a dedication",
      "message": "what this song would communicate to the recipient",
      "confidence": 0
    }
  ]
}

Return exactly 5 recommendations.

confidence must be an integer from 0 to 100.

Do not give a high confidence score if you are uncertain about the meaning of the song.

All explanatory text in the JSON must be written in Spanish.
`;


  // ====================================================
  // INFORMACIÓN DEL USUARIO
  // ====================================================

  const input = `
Analiza esta situación para Heartbeat y recomienda canciones reales para dedicar.

SITUACIÓN:
"${situation.trim()}"

RELACIÓN:
"${relationship || 'No especificada'}"

ESTADO DE ÁNIMO:
"${mood || 'No especificado'}"

GÉNERO PREFERIDO:
"${genre || 'Sin preferencia'}"

IMPORTANTE:

La situación escrita por el usuario tiene prioridad sobre los demás campos.

No asumas que una relación es romántica.

Antes de recomendar cada canción, pregúntate:

"Si el destinatario recibe esta canción y entiende su significado completo, ¿interpretaría aproximadamente el mensaje que el usuario quiere comunicar?"

Si la respuesta es no, descarta la canción.

Genera el resultado únicamente como JSON válido.
`;


  // ====================================================
  // OPENAI
  // ====================================================

  try {

    const response =
      await client.responses.create({

        model:
          process.env.OPENAI_MODEL ||
          'gpt-5',

        instructions: system,

        input,

        text: {
          format: {
            type: 'json_object'
          }
        }

      });


    const result =
      JSON.parse(response.output_text);


    // ==================================================
    // LIMPIEZA / VALIDACIÓN
    // ==================================================

    const profile =
      result.profile || {};

    const recommendations =
      Array.isArray(result.recommendations)
        ? result.recommendations
            .filter(song =>
              song &&
              song.title &&
              song.artist
            )
            .slice(0, 5)
        : [];


    if (recommendations.length === 0) {

      throw new Error(
        'La IA no devolvió recomendaciones válidas.'
      );

    }


    // ==================================================
    // ADAPTACIÓN AL FRONTEND EXISTENTE
    // ==================================================
    //
    // Seguimos enviando "picks" para no romper
    // el JavaScript que ya muestra tus tarjetas.
    // ==================================================

    const picks =
      recommendations.map(song => ({

        title: song.title,

        artist: song.artist,

        genres:
          Array.isArray(song.genres)
            ? song.genres
            : [],

        themes:
          song.message || '',

        matchReason:
          song.matchReason || '',

        message:
          song.message || '',

        confidence:
          song.confidence || 0,

        score:
          song.confidence || 0

      }));


    // ==================================================
    // RESPUESTA
    // ==================================================

    return res.json({

      fallback: false,

      profile,

      picks,

      explanation:
        profile.reason ||
        'Heartbeat seleccionó canciones según el significado emocional de tu dedicatoria.'

    });


  } catch (error) {

    console.error('');
    console.error(
      'ERROR DE HEARTBEAT AI:'
    );

    console.error(error);
    console.error('');

    return res.status(500).json({
      error:
        'No pude generar las recomendaciones. Revisa la Terminal para conocer el error.'
    });

  }

});


// ======================================================
// FALLBACK DE NAVEGACIÓN
// ======================================================

app.get('*catchall', (req, res) => {

  if (
    req.path.startsWith('/api/')
  ) {

    return res.status(404).json({
      error:
        'Ruta API no encontrada'
    });

  }

  res.sendFile(
    path.join(
      __dirname,
      'public',
      'index.html'
    )
  );

});


// ======================================================
// INICIAR HEARTBEAT
// ======================================================

const server = app.listen(port, '127.0.0.1');

server.on('listening', () => {
  console.log('');
  console.log('❤️  HEARTBEAT');
  console.log(`Heartbeat abierto en http://127.0.0.1:${port}`);
  console.log(`IA: ${client ? 'API key detectada ✓' : 'API key no detectada'}`);
  console.log(`Spotify: ${process.env.SPOTIFY_CLIENT_ID ? 'Client ID detectado ✓' : 'Client ID no detectado'}`);
  console.log('');
});

server.on('error', (error) => {
  console.error('No se pudo iniciar Heartbeat:', error);
});