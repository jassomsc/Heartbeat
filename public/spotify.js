// ==========================================
// HEARTBEAT + SPOTIFY
// Authorization Code with PKCE
// ==========================================

const SPOTIFY_SCOPES = 'user-top-read';

let spotifyClientId = '';
let spotifyRedirectUri = '';


// ==========================================
// OBTENER CONFIGURACIÓN DE HEARTBEAT
// ==========================================

async function loadSpotifyConfig() {
  try {
    const response = await fetch('/api/config');
    const config = await response.json();

    spotifyClientId = config.spotifyClientId;
    spotifyRedirectUri = config.redirectUri;

    if (!spotifyClientId) {
      console.warn('Spotify Client ID no encontrado.');
      return false;
    }

    console.log('Spotify Client ID detectado ✓');
    return true;

  } catch (error) {
    console.error(
      'No se pudo cargar la configuración de Spotify:',
      error
    );
    return false;
  }
}


// ==========================================
// GENERAR CÓDIGO PKCE
// ==========================================

function generateRandomString(length) {
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  const values = crypto.getRandomValues(
    new Uint8Array(length)
  );

  return values.reduce(
    (acc, x) => acc + possible[x % possible.length],
    ''
  );
}


async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);

  return window.crypto.subtle.digest(
    'SHA-256',
    data
  );
}


function base64encode(input) {
  return btoa(
    String.fromCharCode(...new Uint8Array(input))
  )
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}


// ==========================================
// CONECTAR CON SPOTIFY
// ==========================================

async function connectSpotify() {
  const configLoaded = await loadSpotifyConfig();

  if (!configLoaded) {
    alert(
      'Heartbeat no encontró el Client ID de Spotify.'
    );
    return;
  }

  const codeVerifier = generateRandomString(64);

  const hashed = await sha256(codeVerifier);

  const codeChallenge = base64encode(hashed);

  // Guardamos el verifier para cuando Spotify regrese
  sessionStorage.setItem(
    'spotify_code_verifier',
    codeVerifier
  );

  // Backup por si sessionStorage se pierde durante el redirect
  localStorage.setItem(
    'spotify_code_verifier_backup',
    codeVerifier
  );

  const authUrl = new URL(
    'https://accounts.spotify.com/authorize'
  );

  const params = {
    response_type: 'code',
    client_id: spotifyClientId,
    scope: SPOTIFY_SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    redirect_uri: spotifyRedirectUri
  };

  authUrl.search = new URLSearchParams(
    params
  ).toString();

  window.location.href = authUrl.toString();
}


// ==========================================
// CAMBIAR CODE POR ACCESS TOKEN
// ==========================================

async function getSpotifyToken(code) {
  await loadSpotifyConfig();

  const codeVerifier =
    sessionStorage.getItem(
      'spotify_code_verifier'
    ) ||
    localStorage.getItem(
      'spotify_code_verifier_backup'
    );

  if (!codeVerifier) {
    throw new Error(
      'No se encontró el code verifier de Spotify.'
    );
  }

  const response = await fetch(
    'https://accounts.spotify.com/api/token',
    {
      method: 'POST',

      headers: {
        'Content-Type':
          'application/x-www-form-urlencoded'
      },

      body: new URLSearchParams({
        client_id: spotifyClientId,
        grant_type: 'authorization_code',
        code,
        rredirect_uri: spotifyRedirectUri,
        code_verifier: codeVerifier
      })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error(
      'Error obteniendo token:',
      data
    );

    throw new Error(
      data.error_description ||
      'Spotify no pudo generar el access token.'
    );
  }

  localStorage.setItem(
    'spotify_access_token',
    data.access_token
  );

  if (data.refresh_token) {
    localStorage.setItem(
      'spotify_refresh_token',
      data.refresh_token
    );
  }

  localStorage.setItem(
    'spotify_token_expires',
    Date.now() + data.expires_in * 1000
  );

  sessionStorage.removeItem(
    'spotify_code_verifier'
  );

  localStorage.removeItem(
    'spotify_code_verifier_backup'
  );

  return data.access_token;
}


// ==========================================
// PETICIONES A SPOTIFY
// ==========================================

async function spotifyFetch(url) {
  const token = localStorage.getItem(
    'spotify_access_token'
  );

  const expires = Number(
    localStorage.getItem(
      'spotify_token_expires'
    )
  );

  if (
    !token ||
    !expires ||
    Date.now() >= expires
  ) {
    throw new Error(
      'Spotify no está conectado o el token expiró.'
    );
  }

  const response = await fetch(
    url,
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    const details =
      await response.text();

    throw new Error(
      `Spotify respondió ${response.status}: ${details}`
    );
  }

  return response.json();
}


// ==========================================
// OBTENER TOP ARTISTAS
// ==========================================

async function getSpotifyTopArtists(token) {
  const response = await fetch(
    'https://api.spotify.com/v1/me/top/artists?limit=10&time_range=medium_term',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      'No pude obtener tus artistas favoritos.'
    );
  }

  const data = await response.json();

  return data.items;
}


// ==========================================
// OBTENER TOP CANCIONES
// ==========================================

async function getSpotifyTopTracks(token) {
  const response = await fetch(
    'https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=medium_term',
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(
      'No pude obtener tus canciones favoritas.'
    );
  }

  const data = await response.json();

  return data.items;
}


// ==========================================
// GUARDAR PERFIL MUSICAL
// ==========================================

async function loadSpotifyTaste(token) {
  try {
    const [artists, tracks] =
      await Promise.all([
        getSpotifyTopArtists(token),
        getSpotifyTopTracks(token)
      ]);

    const musicalProfile = {
      artists: artists.map(
        artist => ({
          name: artist.name,
          genres: artist.genres || []
        })
      ),

      tracks: tracks.map(
        track => ({
          title: track.name,
          artist: track.artists
            .map(artist => artist.name)
            .join(', ')
        })
      )
    };

    localStorage.setItem(
      'heartbeat_spotify_profile',
      JSON.stringify(musicalProfile)
    );

    console.log(
      '❤️ Perfil musical de Heartbeat:',
      musicalProfile
    );

    return musicalProfile;

  } catch (error) {
    console.error(
      'Error cargando gustos de Spotify:',
      error
    );

    throw error;
  }
}


// ==========================================
// BUSCAR CANCIÓN EN SPOTIFY
// ==========================================

async function searchSpotifyTrack(
  title,
  artist
) {
  /*
    Hacemos varias búsquedas porque los títulos
    generados por la IA pueden tener pequeñas
    diferencias respecto a Spotify.
  */

  const queries = [
    `track:${title} artist:${artist}`,
    `${title} ${artist}`,
    title
  ];

  for (const query of queries) {
    const url =
      'https://api.spotify.com/v1/search' +
      '?type=track' +
      '&limit=10' +
      `&q=${encodeURIComponent(query)}`;

    const data =
      await spotifyFetch(url);

    const tracks =
      data?.tracks?.items || [];

    if (!tracks.length) {
      continue;
    }

    const wantedTitle =
      String(title || '')
        .toLowerCase()
        .trim();

    const wantedArtist =
      String(artist || '')
        .toLowerCase()
        .trim();

    /*
      Primero intentamos encontrar una coincidencia
      de título + artista.
    */
    const bestMatch =
      tracks.find(track => {
        const foundTitle =
          String(track.name || '')
            .toLowerCase();

        const foundArtists =
          (track.artists || [])
            .map(item =>
              String(item.name || '')
                .toLowerCase()
            )
            .join(' ');

        return (
          foundTitle.includes(
            wantedTitle
          ) &&
          foundArtists.includes(
            wantedArtist
          )
        );
      }) || tracks[0];

    if (bestMatch) {
      return {
        id: bestMatch.id,

        uri: bestMatch.uri,

        url:
          bestMatch.external_urls
            ?.spotify ||
          `https://open.spotify.com/track/${bestMatch.id}`,

        cover:
          bestMatch.album
            ?.images?.[0]?.url ||
          bestMatch.album
            ?.images?.[1]?.url ||
          '',

        title:
          bestMatch.name,

        artist:
          (bestMatch.artists || [])
            .map(item => item.name)
            .join(', ')
      };
    }
  }

  return null;
}


// ==========================================
// ENRIQUECER RECOMENDACIONES CON SPOTIFY
// ==========================================

async function enrichWithSpotify(
  picks = []
) {
  if (!Array.isArray(picks)) {
    return [];
  }

  if (!isSpotifyConnected()) {
    console.warn(
      'Spotify no está conectado; las recomendaciones se mostrarán sin portada ni reproductor.'
    );

    return picks;
  }

  const enriched =
    await Promise.all(
      picks.map(
        async pick => {
          try {
            const spotify =
              await searchSpotifyTrack(
                pick.title,
                pick.artist
              );

            if (!spotify) {
              console.warn(
                `Spotify no encontró: ${pick.title} — ${pick.artist}`
              );

              return pick;
            }

            console.log(
              `Spotify encontró: ${pick.title} — ${pick.artist}`,
              spotify
            );

            return {
              ...pick,
              spotify
            };

          } catch (error) {
            console.error(
              `Error buscando ${pick.title} — ${pick.artist}:`,
              error
            );

            return pick;
          }
        }
      )
    );

  return enriched;
}


// ==========================================
// PROCESAR REGRESO DE SPOTIFY
// ==========================================

async function handleSpotifyCallback() {
  const params =
    new URLSearchParams(
      window.location.search
    );

  const code =
    params.get('code');

  const error =
    params.get('error');

  if (error) {
    console.error(
      'Spotify authorization error:',
      error
    );

    alert(
      'No se pudo conectar Spotify.'
    );

    return;
  }

  if (!code) {
    return;
  }

  try {
    const token =
      await getSpotifyToken(code);

    await loadSpotifyTaste(token);

    // Quitamos ?code=... de la URL
    window.history.replaceState(
      {},
      document.title,
      '/'
    );

    console.log(
      'Spotify conectado correctamente ✓'
    );

    alert(
      'Spotify conectado con Heartbeat 🎧'
    );

  } catch (error) {
    console.error(
      'Error conectando Spotify:',
      error
    );

    alert(
      'ERROR SPOTIFY:\n\n' +
      (error?.message || String(error))
    );
  } 
}


// ==========================================
// ESTADO DE CONEXIÓN
// ==========================================

function isSpotifyConnected() {
  const token =
    localStorage.getItem(
      'spotify_access_token'
    );

  const expires =
    Number(
      localStorage.getItem(
        'spotify_token_expires'
      )
    );

  return Boolean(
    token &&
    expires &&
    Date.now() < expires
  );
}


// ==========================================
// INICIALIZAR
// ==========================================

document.addEventListener(
  'DOMContentLoaded',
  async () => {
    await loadSpotifyConfig();

    const spotifyButton =
      document.getElementById(
        'spotify-connect'
      );

    const spotifyStatus =
      document.getElementById(
        'spotify-status'
      );


    // BOTÓN CONECTAR SPOTIFY
    if (spotifyButton) {
      spotifyButton.addEventListener(
        'click',
        connectSpotify
      );
    }


// PROCESAR REGRESO DE SPOTIFY
// El callback principal se procesa desde index.html
// await handleSpotifyCallback();


    // ACTUALIZAR INTERFAZ
    if (isSpotifyConnected()) {
      if (spotifyButton) {
        spotifyButton.textContent =
          'Spotify conectado ✓';

        spotifyButton.disabled =
          true;
      }

      if (spotifyStatus) {
        spotifyStatus.textContent =
          'Tus gustos musicales están conectados con Heartbeat.';
      }

      console.log(
        'Spotify conectado ✓'
      );

    } else {
      if (spotifyButton) {
        spotifyButton.textContent =
          'Conectar Spotify';
      }

      console.log(
        'Spotify no conectado'
      );
    }
  }
);


// ==========================================
// FUNCIONES DISPONIBLES PARA HEARTBEAT
// ==========================================

window.connectSpotify =
  connectSpotify;

window.isSpotifyConnected =
  isSpotifyConnected;

window.spotifyFetch =
  spotifyFetch;

window.searchSpotifyTrack =
  searchSpotifyTrack;

window.enrichWithSpotify =
  enrichWithSpotify;