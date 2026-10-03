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
    const { courseId, courseTitle, amount, email, firstName, lastName, redirectUrl } = await req.json();

    if (!courseId || !amount || !email || !redirectUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mollieApiKey = Deno.env.get("MOLLIE_API_KEY");
    if (!mollieApiKey) {
      return new Response(
        JSON.stringify({ error: "Mollie not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Determine webhook URL
    const webhookUrl = `${supabaseUrl}/functions/v1/mollie-webhook`;

    // Create Mollie payment
    const mollieRes = await fetch("https://api.mollie.com/v2/payments", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${mollieApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: {
          currency: "EUR",
          value: amount, // e.g. "49.00"
        },
        description: `Morgen Academy: ${courseTitle}`,
        redirectUrl,
        webhookUrl,
        metadata: {
          courseId,
          courseTitle: courseTitle || "",
          email,
          firstName: firstName || "",
          lastName: lastName || "",
        },
      }),
    });

    if (!mollieRes.ok) {
      const err = await mollieRes.text();
      console.error("Mollie error:", err);
      return new Response(
        JSON.stringify({ error: "Payment creation failed", mollieError: err }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const molliePayment = await mollieRes.json();

    // Store payment in database
    await supabase.from("payments").insert({
      user_email: email,
      course_id: courseId,
      mollie_payment_id: molliePayment.id,
      amount: parseFloat(amount),
      status: "pending",
    });

    return new Response(
      JSON.stringify({
        checkoutUrl: molliePayment._links.checkout.href,
        paymentId: molliePayment.id,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
