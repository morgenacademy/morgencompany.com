import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate caller
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get library ID from query params
    const url = new URL(req.url);
    const libraryId = url.searchParams.get("libraryId");
    if (!libraryId) {
      return new Response(JSON.stringify({ error: "libraryId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const BUNNY_API_KEY = Deno.env.get("BUNNY_API_KEY");
    if (!BUNNY_API_KEY) {
      return new Response(JSON.stringify({ error: "BUNNY_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch videos from Bunny Stream API (paginated, up to 500)
    const page = parseInt(url.searchParams.get("page") || "1");
    const perPage = 100;
    const bunnyUrl = `https://video.bunnycdn.com/library/${libraryId}/videos?page=${page}&itemsPerPage=${perPage}&orderBy=date`;

    const bunnyRes = await fetch(bunnyUrl, {
      headers: {
        AccessKey: BUNNY_API_KEY,
        Accept: "application/json",
      },
    });

    if (!bunnyRes.ok) {
      const body = await bunnyRes.text();
      throw new Error(`Bunny API error [${bunnyRes.status}]: ${body}`);
    }

    const bunnyData = await bunnyRes.json();

    // Map to simple format
    const videos = (bunnyData.items || []).map((v: Record<string, unknown>) => ({
      guid: v.guid,
      title: v.title,
      length: v.length, // seconds
      status: v.status, // 4 = finished encoding
      dateUploaded: v.dateUploaded,
      thumbnailUrl: v.thumbnailFileName
        ? `https://${libraryId}.b-cdn.net/${v.guid}/${v.thumbnailFileName}`
        : null,
    }));

    return new Response(
      JSON.stringify({
        videos,
        totalItems: bunnyData.totalItems,
        currentPage: bunnyData.currentPage,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: unknown) {
    console.error("Error fetching Bunny videos:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
