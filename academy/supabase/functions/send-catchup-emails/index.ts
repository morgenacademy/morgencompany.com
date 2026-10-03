import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const COURSE_TITLES: Record<string, string> = {
  "basistraining-ai": "Basistraining AI",
  "agentic-ai": "Automatiseren met AI",
  "vibecoden": "Bouwen met AI (vibecoding)",
  "claude-openai-training": "Claude Code / Codex: de basis",
  "haal-meer-uit-claude-code": "Haal meer uit Claude Code + Samenwerken met AI",
  "ai-voor-projectmanagers": "Projectmanagement met AI",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);
    const functionsUrl = `${supabaseUrl}/functions/v1`;

    // Haal alle betaalde betalingen op
    const { data: payments, error } = await supabase
      .from("payments")
      .select("*")
      .eq("status", "paid");

    if (error) throw error;
    if (!payments || payments.length === 0) {
      return new Response(
        JSON.stringify({ message: "Geen betaalde deelnemers gevonden.", sent: 0 }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: { email: string; success: boolean; error?: string }[] = [];

    for (const payment of payments) {
      const courseTitle = COURSE_TITLES[payment.course_id] || payment.course_id;

      try {
        // Stuur welkomstmail
        const welcomeRes = await fetch(`${functionsUrl}/send-payment-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: payment.user_email,
            firstName: "",
            courseTitle,
            siteUrl: "https://www.morgenacademy.nl",
          }),
        });

        // Stuur factuurmail
        const invoiceRes = await fetch(`${functionsUrl}/send-invoice-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: payment.user_email,
            firstName: "",
            lastName: "",
            courseTitle,
            amount: String(payment.amount),
            molliePaymentId: payment.mollie_payment_id || "",
            paymentDate: payment.updated_at || payment.created_at,
          }),
        });

        if (welcomeRes.ok && invoiceRes.ok) {
          results.push({ email: payment.user_email, success: true });
          console.log(`✓ Mails verzonden naar ${payment.user_email}`);
        } else {
          const welcomeErr = welcomeRes.ok ? null : await welcomeRes.text();
          const invoiceErr = invoiceRes.ok ? null : await invoiceRes.text();
          results.push({
            email: payment.user_email,
            success: false,
            error: [welcomeErr, invoiceErr].filter(Boolean).join(" | "),
          });
          console.error(`✗ Fout bij ${payment.user_email}:`, welcomeErr, invoiceErr);
        }
      } catch (err) {
        results.push({
          email: payment.user_email,
          success: false,
          error: String(err),
        });
        console.error(`✗ Exception bij ${payment.user_email}:`, err);
      }

      // Kort wachten tussen mails om rate limits te vermijden
      await new Promise((r) => setTimeout(r, 300));
    }

    const sent = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success);

    return new Response(
      JSON.stringify({
        sent,
        total: payments.length,
        failed: failed.length,
        errors: failed,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Catchup email error:", error);
    return new Response(JSON.stringify({ error: "Internal error", details: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
