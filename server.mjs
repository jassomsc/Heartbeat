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
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
  : null;


// ======================================================
// CONFIGURACIÓN GENERAL
// ======================================================

app.use(
  express.json({
    limit: '32kb'
  })
);

app.use(
  express.static(
    path.join(__dirname, 'public')
  )
);


// ======================================================
// CONFIGURACIÓN PARA SPOTIFY
// ======================================================

app.get('/api/config', (req, res) => {

  const isRender =
    process.env.RENDER === 'true';

  const redirectUri = isRender
    ? 'https://heartbeat-rxh0.onrender.com/'
    : `http://127.0.0.1:${port}/`;

  res.json({
    spotifyClientId:
      process.env.SPOTIFY_CLIENT_ID || '',

    redirectUri
  });

});
// ======================================================
// SPOTIFY CATALOG
// ======================================================

let spotifyAppToken = '';
let spotifyAppTokenExpires = 0;

async function getSpotifyAppToken() {

  if (
    spotifyAppToken &&
    Date.now() < spotifyAppTokenExpires
  ) {
    return spotifyAppToken;
  }

  const clientId =
    process.env.SPOTIFY_CLIENT_ID;

  const clientSecret =
    process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'Faltan las credenciales de Spotify.'
    );
  }

  const credentials =
    Buffer
      .from(`${clientId}:${clientSecret}`)
      .toString('base64');

  const response = await fetch(
    'https://accounts.spotify.com/api/token',
    {
      method: 'POST',

      headers: {
        Authorization:
          `Basic ${credentials}`,

        'Content-Type':
          'application/x-www-form-urlencoded'
      },

      body:
        'grant_type=client_credentials'
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      'Spotify token error:',
      data
    );

    throw new Error(
      'Spotify rechazó las credenciales.'
    );
  }

  spotifyAppToken =
    data.access_token;

  spotifyAppTokenExpires =
    Date.now() +
    ((data.expires_in - 60) * 1000);

  return spotifyAppToken;
}


app.get('/api/spotify/search', async (req, res) => {

  try {

    const title =
      String(req.query.title || '').trim();

    const artist =
      String(req.query.artist || '').trim();

    if (!title || !artist) {
      return res.status(400).json({
        error:
          'Faltan título o artista.'
      });
    }

    const token =
      await getSpotifyAppToken();

    const query =
      `track:${title} artist:${artist}`;

    const url =
      'https://api.spotify.com/v1/search?' +
      new URLSearchParams({
        q: query,
        type: 'track',
        limit: '1',
        market: 'MX'
      });

    const response =
      await fetch(url, {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      });

    const data =
      await response.json();

    if (!response.ok) {

      console.error(
        'Spotify search error:',
        data
      );

      return res
        .status(response.status)
        .json({
          error:
            'No se pudo buscar la canción en Spotify.'
        });

    }

    const track =
      data?.tracks?.items?.[0];

    if (!track) {
      return res.json({
        track: null
      });
    }

    return res.json({
      track: {
        id:
          track.id,

        uri:
          track.uri,

        url:
          track.external_urls?.spotify || '',

        cover:
          track.album?.images?.[0]?.url || ''
      }
    });

  } catch (error) {

    console.error(
      'Spotify catalog error:',
      error
    );

    return res.status(500).json({
      error:
        'No se pudo conectar con Spotify.'
    });

  }

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

Your task is NOT simply to identify an emotion.

Your task is to deeply understand a specific interpersonal situation,
determine what the sender wants to communicate to another person,
and recommend REAL EXISTING SONGS whose actual emotional and lyrical
meaning makes sense as a dedication.

The recommendations will be sent to real people.

Therefore:

MEANING > popularity.
MEANING > genre.
MEANING > title similarity.
MEANING > superficial emotional similarity.


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
- it is generally considered romantic or sad

The CENTRAL MESSAGE of the song must make sense when sent
from this particular sender to this particular recipient.


==================================================
UNDERSTAND THE RELATIONSHIP
==================================================

First determine the actual relationship context.

Possible contexts include:

- friendship
- romantic relationship
- crush
- unrequited feelings
- ex-partner
- family
- undefined relationship
- situationship
- admiration from a distance
- self-dedication
- another interpersonal relationship

Do NOT assume romance.

If the recipient is explicitly described as a friend,
sibling, parent, colleague or another platonic relationship,
strongly avoid songs whose central meaning is romantic or sexual
unless the user clearly requests that meaning.

If the relationship is ambiguous, preserve that ambiguity instead
of automatically interpreting it as romantic commitment.


==================================================
UNDERSTAND THE SPECIFIC SITUATION
==================================================

Do not reduce the user's story to a generic emotion.

Extract the concrete circumstances that make THIS situation unique.

Pay attention when the user mentions details such as:

- age difference
- different life stages
- whether feelings are mutual
- whether feelings are uncertain
- whether feelings are unrequited
- whether the recipient knows about the feelings
- friendship becoming romantic
- emotional distance
- physical distance
- timing problems
- personal or social barriers
- fear of confessing feelings
- inability to be together
- complicated attraction
- admiration from a distance
- wanting to communicate indirectly
- wanting affection without commitment
- nostalgia without reconciliation
- reconnecting after time apart
- gratitude
- emotional support
- unresolved feelings
- boundaries
- secrecy
- hesitation
- goodbye
- closure

Only treat a circumstance as relevant when it is actually present
or strongly implied by the user's story.

DO NOT invent circumstances.


==================================================
SEPARATE FEELING FROM MESSAGE
==================================================

Determine four different things:

1. WHAT THE USER FEELS

2. WHAT THE USER WANTS THE RECIPIENT TO UNDERSTAND

3. WHAT THE USER DOES NOT WANT THE RECIPIENT TO INTERPRET

4. WHAT SPECIFIC CIRCUMSTANCES MAKE THIS SITUATION DIFFERENT
   FROM A GENERIC LOVE, FRIENDSHIP OR BREAKUP STORY


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
- liking someone vs wanting a relationship
- impossible attraction vs ordinary romance
- uncertainty vs rejection


==================================================
SPECIFICITY RULE
==================================================

A song that matches only the GENERAL EMOTION but ignores an
important circumstance of the story is NOT an excellent match.

For example:

If an age difference or different life stage is important,
do not simply recommend generic love songs.

Consider whether the song's meaning reflects relevant ideas such as:

- complication
- timing
- distance
- uncertainty
- boundaries
- admiration
- hesitation
- impossibility
- unequal circumstances

But only when those ideas genuinely match the user's story.

Apply this principle to ALL situations, not only age differences.


==================================================
NEGATIVE CONSTRAINTS
==================================================

Determine what the dedication must NOT accidentally communicate.

This is extremely important.

A song can express the correct emotion and still be a BAD dedication
if its complete meaning implies something the sender does not mean.


Example:

If the user wants to encourage a struggling friend:

GOOD THEMES:
- friendship
- companionship
- encouragement
- hope
- resilience
- emotional support
- brighter days
- "you are not alone"
- "I am here for you"

BAD THEMES:
- romantic desire
- sexual attraction
- breakup
- jealousy
- toxic attachment
- obsessive longing
- begging someone to return


Example:

If the user misses an ex but does not want reconciliation:

GOOD THEMES:
- nostalgia
- gratitude
- remembering shared experiences
- peaceful distance
- closure

BAD THEMES:
- begging them to return
- promising eternal romantic commitment
- desperation
- reconciliation


==================================================
SONG MEANING CHECK
==================================================

Before selecting a song, ask:

"If the recipient listens to this song and understands its complete
meaning, would they receive approximately the message the sender
actually wants to communicate?"

If NO:
reject the song.

If ONLY PARTIALLY:
it may be considered, but it must receive a lower match score.

If YES:
continue evaluating it.


==================================================
SONG DISCOVERY
==================================================

You are NOT restricted to a predefined catalog.

Search your musical knowledge broadly.

Internally consider AT LEAST 25 plausible songs before selecting five.

Consider music across:

- decades
- genres
- languages
- countries
- popularity levels
- mainstream music
- alternative music
- classic music
- contemporary music

Spanish-language songs must be considered normally alongside
English-language and other music.

Do NOT treat English-language music as the default.

Do not repeatedly default to the same universally famous songs.

Do not choose a famous song when a less obvious song is a substantially
better semantic match.

Prefer songs you are highly confident actually exist.

Prefer songs whose meaning you understand confidently.

Do NOT invent:

- songs
- artists
- collaborations
- alternate versions
- lyrical meanings


==================================================
MUSICAL PREFERENCE
==================================================

The user may provide a preferred genre or mood.

Treat these as preferences, not absolute requirements.

Meaning compatibility always comes first.

A highly appropriate dedication slightly outside the requested genre
is better than an emotionally incorrect song inside the genre.

However, when multiple songs have similarly strong meaning compatibility,
prefer the one closer to the user's requested musical preferences.


==================================================
EVALUATION PROCESS
==================================================

Evaluate every candidate independently using:

1. MESSAGE FIT
Does the song communicate what the sender actually wants to say?

2. SITUATION FIT
Does the song connect with the concrete circumstances described?

3. RELATIONSHIP FIT
Is its meaning appropriate for this relationship?

4. CONTRADICTION SAFETY
Could the song accidentally communicate an unwanted message?

5. EMOTIONAL TONE
Does its emotional intensity fit?

6. MUSICAL PREFERENCE
Does it reasonably respect the requested mood or genre?

7. SONG-MEANING CONFIDENCE
How certain are you that you correctly understand what the song means?


Reject songs whose central meaning substantially contradicts
the intended dedication.


==================================================
DIVERSITY
==================================================

The final five recommendations should NOT simply be five versions
of the same generic idea.

When possible, provide different useful approaches:

- the closest semantic match
- a subtle or indirect option
- a more emotionally expressive option
- a restrained or mature option
- a stylistically different option

Aim for reasonable diversity in:

- artists
- eras
- genres
- emotional approaches
- languages when appropriate

Do not force diversity if it substantially reduces relevance.


==================================================
MATCH SCORE
==================================================

matchScore measures HOW WELL THE SONG FITS THIS SPECIFIC DEDICATION.

It is NOT your confidence in knowing the song.

It is NOT a popularity score.

It is NOT a probability.

It is NOT a general similarity score.

Use this interpretation:

96-100:
Extraordinarily precise fit.
The song's central meaning and the specific circumstances align
almost perfectly. These scores should be VERY RARE.

90-95:
Excellent match with strong alignment in message, relationship
and situation.

80-89:
Strong match. The song communicates the intended idea well,
but some details are broader or more interpretive.

70-79:
Good match with noticeable limitations.

60-69:
Partial or creative match. Useful, but not especially precise.

Below 60:
Generally do not recommend unless there is a compelling reason.

Do NOT inflate scores.

Five recommendations should not automatically all receive scores
in the 90s.

Score each song independently.


==================================================
CONFIDENCE
==================================================

confidence is DIFFERENT from matchScore.

confidence measures how certain you are that:

- the song really exists
- the artist attribution is correct
- you correctly understand its central meaning

A song can have:

HIGH confidence + MODERATE matchScore

because you know exactly what the song means but it only partially
fits the user's situation.

Do not confuse these measurements.


==================================================
ANALYSIS QUALITY
==================================================

The profile explanation must be specific to the user's story.

Avoid generic statements such as:

"Buscas una canción que refleje tus sentimientos."

Instead explain the actual emotional tension or communicative goal.

For example, when relevant:

"The attraction is present, but the difference in life stage creates
hesitation, so the dedication should communicate affection and
complication without sounding like a promise of a conventional
relationship."

Do not copy this example unless it actually applies.


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
    "specificFactors": ["string"],
    "reason": "string"
  },

  "recommendations": [
    {
      "title": "exact song title",
      "artist": "exact primary artist",
      "genres": ["genre"],
      "matchReason": "specific explanation of why the actual meaning of this song works for this exact situation",
      "message": "what sending this song would communicate to the recipient",
      "matchScore": 0,
      "confidence": 0
    }
  ]
}

Return exactly 5 recommendations.

matchScore must be an integer from 0 to 100.

confidence must be an integer from 0 to 100.

matchScore and confidence MUST be evaluated independently.

All explanatory text inside the JSON must be written in Spanish.
`;


  // ====================================================
  // INFORMACIÓN DEL USUARIO
  // ====================================================

  const input = `
Analiza cuidadosamente esta situación para Heartbeat.

SITUACIÓN:
"${situation.trim()}"

RELACIÓN:
"${relationship || 'No especificada'}"

ESTADO DE ÁNIMO:
"${mood || 'No especificado'}"

GÉNERO PREFERIDO:
"${genre || 'Sin preferencia'}"


INSTRUCCIONES IMPORTANTES:

La historia escrita en SITUACIÓN tiene prioridad sobre los demás campos.

No reduzcas la historia a una sola emoción.

Identifica primero los detalles específicos que cambian el significado
de esta dedicatoria.

No asumas que la relación es romántica.

No inventes detalles que el usuario no haya mencionado.

Distingue entre:

- lo que siente el usuario
- lo que quiere comunicar
- lo que NO quiere comunicar
- las circunstancias específicas de la historia

Antes de recomendar CADA canción, pregúntate:

"Si el destinatario recibe esta canción, escucha la letra y comprende
su significado completo, ¿entendería aproximadamente el mensaje que
esta persona realmente quiere comunicar?"

Si la respuesta es no, descártala.

No elijas canciones únicamente porque tengan la misma emoción general.

Considera canciones en español, inglés y otros idiomas cuando sean
apropiadas.

No favorezcas automáticamente canciones en inglés.

Busca variedad de artistas y enfoques sin sacrificar relevancia.

Usa matchScore para medir qué tan específicamente encaja la canción
con ESTA situación.

Usa confidence solamente para medir qué tan seguro estás de conocer
correctamente la canción y su significado.

Genera únicamente JSON válido.
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
      JSON.parse(
        response.output_text
      );


    // ==================================================
    // LIMPIEZA / VALIDACIÓN
    // ==================================================

    const profile =
      result.profile || {};


    const recommendations =
      Array.isArray(
        result.recommendations
      )
        ? result.recommendations
            .filter(song =>
              song &&
              song.title &&
              song.artist
            )
            .slice(0, 5)
        : [];


    if (
      recommendations.length === 0
    ) {

      throw new Error(
        'La IA no devolvió recomendaciones válidas.'
      );

    }


    // ==================================================
    // ADAPTACIÓN AL FRONTEND
    // ==================================================

    const picks =
      recommendations.map(song => {

        const matchScore =
          Math.max(
            0,
            Math.min(
              100,
              Number(song.matchScore) || 0
            )
          );

        const confidence =
          Math.max(
            0,
            Math.min(
              100,
              Number(song.confidence) || 0
            )
          );


        return {

          title:
            song.title,

          artist:
            song.artist,

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

          // Qué tan bien encaja con ESTA historia
          score:
            matchScore,

          matchScore,

          // Qué tan segura está la IA de conocer
          // correctamente la canción
          confidence

        };

      });


    // ==================================================
    // RESPUESTA
    // ==================================================

    return res.json({

      fallback:
        false,

      profile,

      picks,

      explanation:
        profile.reason ||
        'Heartbeat seleccionó canciones según el significado emocional y las circunstancias específicas de tu dedicatoria.'

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

app.get(
  '*catchall',
  (req, res) => {

    if (
      req.path.startsWith('/api/')
    ) {

      return res
        .status(404)
        .json({
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

  }
);


// ======================================================
// INICIAR HEARTBEAT
// ======================================================

const server =
  app.listen(
    port,
    '0.0.0.0'
  );

server.on(
  'listening',
  () => {

    console.log('');
    console.log('❤️  HEARTBEAT');

    console.log(
      `Heartbeat abierto en http://127.0.0.1:${port}`
    );

    console.log(
      `IA: ${
        client
          ? 'API key detectada ✓'
          : 'API key no detectada'
      }`
    );

    console.log(
      `Spotify: ${
        process.env.SPOTIFY_CLIENT_ID
          ? 'Client ID detectado ✓'
          : 'Client ID no detectado'
      }`
    );

    console.log('');

  }
);


server.on(
  'error',
  error => {

    console.error(
      'No se pudo iniciar Heartbeat:',
      error
    );

  }
);