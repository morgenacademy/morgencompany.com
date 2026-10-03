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
    const { email, firstName, courseTitle, siteUrl } = await req.json();

    if (!email || !courseTitle) {
      return new Response(JSON.stringify({ error: "Missing fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(JSON.stringify({ error: "Email not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const name = firstName || "daar";
    const registerUrl = `${siteUrl || "https://www.morgenacademy.nl"}/registreren`;
    const loginUrl = `${siteUrl || "https://www.morgenacademy.nl"}/login`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f8f9fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8f9fa;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color:#18181b;padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;letter-spacing:-0.3px;">
                Morgen <span style="color:#a78bfa;">Academy</span>
              </h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#18181b;font-size:24px;font-weight:600;">
                Hoi ${name}! 🎉
              </h2>
              <p style="margin:0 0 20px;color:#52525b;font-size:15px;line-height:1.6;">
                Wat leuk dat je de <strong style="color:#18181b;">${courseTitle}</strong> gaat volgen!
                Je betaling is ontvangen en je kunt direct aan de slag.
              </p>

              <!-- Steps box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;border-radius:8px;margin:24px 0;">
                <tr>
                  <td style="padding:24px;">
                    <p style="margin:0 0 16px;color:#18181b;font-size:15px;font-weight:600;">
                      Zo begin je:
                    </p>
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding:0 0 12px;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:28px;vertical-align:top;">
                                <div style="width:24px;height:24px;border-radius:12px;background-color:#a78bfa;color:#ffffff;text-align:center;line-height:24px;font-size:13px;font-weight:600;">1</div>
                              </td>
                              <td style="padding-left:12px;">
                                <p style="margin:0;color:#18181b;font-size:14px;line-height:1.5;">
                                  <strong>Maak een account aan</strong> op de academy met dit e-mailadres (${email})
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:0 0 12px;">
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:28px;vertical-align:top;">
                                <div style="width:24px;height:24px;border-radius:12px;background-color:#a78bfa;color:#ffffff;text-align:center;line-height:24px;font-size:13px;font-weight:600;">2</div>
                              </td>
                              <td style="padding-left:12px;">
                                <p style="margin:0;color:#18181b;font-size:14px;line-height:1.5;">
                                  <strong>Bevestig je e-mail</strong> via de link die je ontvangt
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <table cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="width:28px;vertical-align:top;">
                                <div style="width:24px;height:24px;border-radius:12px;background-color:#a78bfa;color:#ffffff;text-align:center;line-height:24px;font-size:13px;font-weight:600;">3</div>
                              </td>
                              <td style="padding-left:12px;">
                                <p style="margin:0;color:#18181b;font-size:14px;line-height:1.5;">
                                  <strong>Log in en start!</strong> Alle lessen staan voor je klaar
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px;color:#71717a;font-size:13px;">
                ⚠️ <strong style="color:#52525b;">Belangrijk:</strong> Gebruik bij het registreren hetzelfde e-mailadres als waarmee je hebt betaald (${email}). Zo koppelen we je betaling automatisch.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
                <tr>
                  <td align="center">
                    <a href="${registerUrl}" style="display:inline-block;background-color:#a78bfa;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                      Account aanmaken →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:20px 0 0;color:#a1a1aa;font-size:12px;text-align:center;">
                Al een account? <a href="${loginUrl}" style="color:#a78bfa;text-decoration:underline;">Log hier in</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f4f4f5;">
              <p style="margin:0 0 4px;color:#a1a1aa;font-size:12px;text-align:center;">
                Vragen? Mail ons op <a href="mailto:totmorgen@morgenacademy.nl" style="color:#a78bfa;">totmorgen@morgenacademy.nl</a>
              </p>
              <p style="margin:0;color:#d4d4d8;font-size:11px;text-align:center;">
                Morgen Academy · Een initiatief van Morgen Company
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const textBody = `Hoi ${name}!

Wat leuk dat je de ${courseTitle} gaat volgen! Je betaling is ontvangen en je kunt direct aan de slag.

Zo begin je:
1. Maak een account aan op ${registerUrl} met dit e-mailadres (${email})
2. Bevestig je e-mail via de link die je ontvangt
3. Log in en start! Alle lessen staan voor je klaar

Belangrijk: Gebruik bij het registreren hetzelfde e-mailadres als waarmee je hebt betaald (${email}).

Al een account? Log in op ${loginUrl}

Vragen? Mail ons op totmorgen@morgenacademy.nl

Morgen Academy - Een initiatief van Morgen Company`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Morgen Academy <totmorgen@courses.morgenacademy.nl>",
        to: [email],
        subject: `Welkom bij de ${courseTitle}!`,
        html: htmlBody,
        text: textBody,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend error:", result);
      return new Response(JSON.stringify({ error: "Failed to send email", details: result }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Payment email sent to ${email} for course ${courseTitle}`);

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Email error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
