import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check admin role
    const anonClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    );
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data: { user } } = await supabase.auth.getUser(token);
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!role) {
        return new Response(JSON.stringify({ error: "Admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    const LIBRARY_ID = "614183";
    const BASE_URL = `https://iframe.mediadelivery.net/embed/${LIBRARY_ID}`;
    const COURSE_ID = "basistraining-ai";
    const now = new Date().toISOString();

    const mappings: { course_id: string; lesson_id: string; video_url: string; updated_at: string }[] = [
      { course_id: COURSE_ID, lesson_id: "welkom-en-het-team", video_url: `${BASE_URL}/1db84c1a-b76a-4447-8cd4-91221612940d`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "onze-digitale-collegas", video_url: `${BASE_URL}/64e27a1b-250f-4e4d-983e-c6b1812d5f5a`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "dit-ga-je-leren", video_url: `${BASE_URL}/97403f28-5b52-4e1d-b753-f2ef20a2eaab`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "about-you", video_url: `${BASE_URL}/97311b07-2630-4b3e-8f9e-d0dcbc4c7a37`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "ai-in-relatie-tot-andere-ontwikkelingen", video_url: `${BASE_URL}/2e265349-c945-4892-9921-0903e6a57d04`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "hoe-lang-bestaat-ai-al", video_url: `${BASE_URL}/1186d777-dcd9-4d89-84c3-baac4f8f1436`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "hoe-slim-is-ai", video_url: `${BASE_URL}/1dbcde27-04a5-4135-8189-3af4c80f2be0`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "hoe-betrouwbaar-is-ai", video_url: `${BASE_URL}/c4b62dec-8da4-4d41-acd1-49754f2d6966`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "hoe-veilig-is-ai", video_url: `${BASE_URL}/94e9ae8d-075e-4cf1-bc83-8380922979b3`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "prompten-in-ai", video_url: `${BASE_URL}/360d514b-9817-4209-9119-d0befea55892`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "gebruik-van-tools", video_url: `${BASE_URL}/e2c48340-0ebd-45fe-8956-a27d94c2dce0`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "opdracht-waar-gaat-ai-jou-helpen", video_url: `${BASE_URL}/073e8de0-6152-4bb8-9cc5-7bed1f76ee28`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "de-ai-adoptieladder", video_url: `${BASE_URL}/c5e2ae82-f089-4d0b-92b6-f0878265a424`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "de-drie-demos-ai-in-actie", video_url: `${BASE_URL}/a3844b84-dcbf-41bd-a5b5-78c090900df1`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "demo-driek", video_url: `${BASE_URL}/61ba2031-ee8e-4b3b-95c5-1f33f5d10fa0`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "demo-jeroen", video_url: `${BASE_URL}/d5dc7c12-2f81-4252-8e3e-efe0775e4393`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "demo-bernard", video_url: `${BASE_URL}/cc7f9389-7e82-45b7-8548-b6329851dc61`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "een-ai-assistent", video_url: `${BASE_URL}/73ca6206-1c87-47f9-b6c8-cbd40a2102df`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "build-your-own", video_url: `${BASE_URL}/5a425316-ad2a-4dfd-b8a5-1f3f43f67af4`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "inloggen-op-de-tools", video_url: `${BASE_URL}/f6b4ff27-bc3c-4140-8dda-88e22d025208`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "je-assistent-bouwen-stap-voor-stap", video_url: `${BASE_URL}/a8378d64-48f3-417b-b762-ec295aca6e32`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "je-assistent-testen-en-iteratief-verbeteren", video_url: `${BASE_URL}/66eae32e-6b70-411d-9f3e-e18b184c6cee`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "tip-snel-verbeteren-van-je-assistent", video_url: `${BASE_URL}/7070d178-5d93-420e-92bd-c273f2c8af51`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "eindresultaat-jouw-werkende-assistent", video_url: `${BASE_URL}/59f3ba88-5c6d-4c95-9b95-c4c7c035c699`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "gefeliciteerd-einde-cursus", video_url: `${BASE_URL}/b1b4cbce-c1a0-4ee4-a711-ac3e80537496`, updated_at: now },
      { course_id: COURSE_ID, lesson_id: "bonus-tip-sneller-bouwen", video_url: `${BASE_URL}/e69a1039-d135-436d-9a8b-d5d56a66dd97`, updated_at: now },
    ];

    const { data, error } = await supabase
      .from("lesson_videos")
      .upsert(mappings, { onConflict: "course_id,lesson_id" });

    if (error) {
      console.error("Upsert error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ success: true, count: mappings.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
