const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DEFAULT_SHOW_ID = "6Lws4ZDBxEQtf52YGd2UzL";

interface SpotifyImage {
  url: string;
}

interface SpotifyEpisode {
  id: string;
  name: string;
  description: string;
  release_date?: string;
  external_urls?: {
    spotify?: string;
  };
  images?: SpotifyImage[];
}

async function getVaultSecret(name: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) return null;

  const response = await fetch(`${supabaseUrl}/rest/v1/decrypted_secrets?name=eq.${name}&select=decrypted_secret`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Accept-Profile": "vault",
      "Content-Profile": "vault",
    },
  });

  if (!response.ok) return null;

  const secrets = await response.json();
  return secrets?.[0]?.decrypted_secret || null;
}

async function getSpotifyAccessToken() {
  const clientId = Deno.env.get("SPOTIFY_CLIENT_ID") || await getVaultSecret("SPOTIFY_CLIENT_ID");
  const clientSecret = Deno.env.get("SPOTIFY_CLIENT_SECRET") || await getVaultSecret("SPOTIFY_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET are required as Edge Function secrets or Vault secrets");
  }

  const credentials = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Spotify token error [${response.status}]: ${body}`);
  }

  const data = await response.json();
  return data.access_token as string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    const showId = typeof body.showId === "string" && body.showId.trim()
      ? body.showId.trim()
      : DEFAULT_SHOW_ID;
    const limit = Math.min(Math.max(Number(body.limit) || 8, 1), 20);
    const accessToken = await getSpotifyAccessToken();

    const response = await fetch(
      `https://api.spotify.com/v1/shows/${showId}/episodes?limit=${limit}&market=NL`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const responseBody = await response.text();
      throw new Error(`Spotify episodes error [${response.status}]: ${responseBody}`);
    }

    const data = await response.json();
    const episodes = (data.items || []).map((episode: SpotifyEpisode) => ({
      id: episode.id,
      title: episode.name,
      description: episode.description,
      image: episode.images?.[0]?.url || "",
      spotifyUrl: episode.external_urls?.spotify || `https://open.spotify.com/episode/${episode.id}`,
      embedUrl: `https://open.spotify.com/embed/episode/${episode.id}`,
      releaseDate: episode.release_date,
    }));

    return new Response(JSON.stringify({ episodes }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=900",
      },
    });
  } catch (error: unknown) {
    console.error("spotify-podcast-episodes error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message, episodes: [] }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
