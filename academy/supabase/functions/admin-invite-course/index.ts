import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json({ error: "Niet ingelogd" }, 401);
    }

    const { email, course_id, redirect_to } = await req.json();

    if (!email || !course_id) {
      return json({ error: "E-mail en cursus zijn verplicht" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Caller-context client: carries the admin's JWT so the RPC's own
    // admin check (auth.uid() + has_role) still applies.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service-role client: only used to send the invite (GoTrue admin API).
    const adminClient = createClient(supabaseUrl, serviceKey);

    const grant = async () =>
      callerClient.rpc("admin_grant_course_access", {
        _email: email,
        _course_id: course_id,
      });

    // First attempt: enroll an already-existing account.
    const first = await grant();

    if (!first.error) {
      const created = first.data?.[0]?.created ?? false;
      return json({ invited: false, created });
    }

    const msg = first.error.message ?? "";

    // Any error other than "user does not exist" is a real failure
    // (e.g. not authorized). Surface it unchanged.
    if (!msg.includes("Geen gebruiker gevonden")) {
      return json({ error: msg }, 400);
    }

    // No account yet -> send a Supabase invite. This creates the auth user
    // synchronously and emails them a link to set their password.
    const { error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(
      email,
      redirect_to ? { redirectTo: redirect_to } : undefined
    );

    if (inviteError) {
      return json({ error: `Uitnodigen mislukt: ${inviteError.message}` }, 400);
    }

    // User now exists -> enroll them so the course is ready on first login.
    const second = await grant();

    if (second.error) {
      // Invite was sent but enrollment failed; report so it can be retried.
      return json(
        {
          error: `Uitnodiging verstuurd, maar cursus koppelen mislukt: ${second.error.message}`,
        },
        500
      );
    }

    return json({ invited: true, created: second.data?.[0]?.created ?? true });
  } catch (error: unknown) {
    console.error("admin-invite-course error:", error);
    const msg = error instanceof Error ? error.message : "Onbekende fout";
    return json({ error: msg }, 500);
  }
});
