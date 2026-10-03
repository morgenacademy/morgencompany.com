const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function generateInvoiceNumber(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9999)).padStart(4, "0");
  return `MA-${year}${month}${day}-${rand}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      email,
      firstName,
      lastName,
      courseTitle,
      amount,
      molliePaymentId,
      paymentDate,
    } = await req.json();

    if (!email || !courseTitle || !amount) {
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

    const invoiceNumber = generateInvoiceNumber();
    const amountNum = parseFloat(amount);
    const btwRate = 0.21;
    const exclBtw = amountNum / (1 + btwRate);
    const btwAmount = amountNum - exclBtw;
    const name = [firstName, lastName].filter(Boolean).join(" ") || email;
    const date = paymentDate
      ? new Date(paymentDate).toLocaleDateString("nl-NL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : new Date().toLocaleDateString("nl-NL", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });

    const formatEur = (n: number) =>
      `€ ${n.toFixed(2).replace(".", ",")}`;

    const invoiceHtml = `
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
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="background-color:#18181b;padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;">
                      Morgen <span style="color:#a78bfa;">Academy</span>
                    </h1>
                  </td>
                  <td align="right">
                    <span style="color:#a1a1aa;font-size:13px;">Betaalbewijs</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Invoice details -->
          <tr>
            <td style="padding:36px 40px 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:top;width:50%;">
                    <p style="margin:0 0 4px;color:#a1a1aa;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Aan</p>
                    <p style="margin:0 0 2px;color:#18181b;font-size:14px;font-weight:500;">${name}</p>
                    <p style="margin:0;color:#71717a;font-size:13px;">${email}</p>
                  </td>
                  <td style="vertical-align:top;width:50%;text-align:right;">
                    <p style="margin:0 0 4px;color:#a1a1aa;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Factuurgegevens</p>
                    <p style="margin:0 0 2px;color:#18181b;font-size:13px;">Nr: ${invoiceNumber}</p>
                    <p style="margin:0 0 2px;color:#71717a;font-size:13px;">Datum: ${date}</p>
                    ${molliePaymentId ? `<p style="margin:0;color:#71717a;font-size:12px;">Ref: ${molliePaymentId}</p>` : ""}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Line items -->
          <tr>
            <td style="padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
                <tr style="border-bottom:2px solid #f4f4f5;">
                  <td style="padding:10px 0;color:#a1a1aa;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;">Omschrijving</td>
                  <td style="padding:10px 0;color:#a1a1aa;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;text-align:right;">Bedrag</td>
                </tr>
                <tr style="border-bottom:1px solid #f4f4f5;">
                  <td style="padding:14px 0;">
                    <p style="margin:0;color:#18181b;font-size:14px;font-weight:500;">${courseTitle}</p>
                    <p style="margin:4px 0 0;color:#a1a1aa;font-size:12px;">Online training · Onbeperkt toegang</p>
                  </td>
                  <td style="padding:14px 0;text-align:right;color:#18181b;font-size:14px;">${formatEur(exclBtw)}</td>
                </tr>
                <tr style="border-bottom:1px solid #f4f4f5;">
                  <td style="padding:10px 0;color:#71717a;font-size:13px;">BTW (21%)</td>
                  <td style="padding:10px 0;text-align:right;color:#71717a;font-size:13px;">${formatEur(btwAmount)}</td>
                </tr>
                <tr>
                  <td style="padding:14px 0;color:#18181b;font-size:15px;font-weight:600;">Totaal (incl. BTW)</td>
                  <td style="padding:14px 0;text-align:right;color:#18181b;font-size:15px;font-weight:600;">${formatEur(amountNum)}</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment status -->
          <tr>
            <td style="padding:0 40px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;border-radius:8px;border:1px solid #bbf7d0;">
                <tr>
                  <td style="padding:12px 16px;">
                    <p style="margin:0;color:#166534;font-size:13px;font-weight:500;">
                      ✓ Betaald op ${date}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f4f4f5;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="margin:0 0 2px;color:#71717a;font-size:12px;font-weight:500;">Morgen Company B.V.</p>
                    <p style="margin:0 0 2px;color:#a1a1aa;font-size:11px;">KVK: [KVK nummer]</p>
                    <p style="margin:0;color:#a1a1aa;font-size:11px;">BTW: [BTW nummer]</p>
                  </td>
                  <td align="right" style="vertical-align:top;">
                    <p style="margin:0;color:#a1a1aa;font-size:11px;">
                      <a href="mailto:totmorgen@morgenacademy.nl" style="color:#a78bfa;">totmorgen@morgenacademy.nl</a>
                    </p>
                    <p style="margin:4px 0 0;color:#a1a1aa;font-size:11px;">morgenacademy.nl</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    const textBody = `BETAALBEWIJS - Morgen Academy

Factuurnummer: ${invoiceNumber}
Datum: ${date}
${molliePaymentId ? `Referentie: ${molliePaymentId}\n` : ""}
Aan: ${name} (${email})

---
${courseTitle}
Online training · Onbeperkt toegang

Excl. BTW:  ${formatEur(exclBtw)}
BTW (21%):  ${formatEur(btwAmount)}
Totaal:     ${formatEur(amountNum)}

Status: Betaald op ${date}
---

Morgen Company B.V.
KVK: [KVK nummer]
BTW: [BTW nummer]
totmorgen@morgenacademy.nl`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Morgen Academy <totmorgen@courses.morgenacademy.nl>",
        to: [email],
        subject: `Betaalbewijs ${invoiceNumber} - Morgen Academy`,
        html: invoiceHtml,
        text: textBody,
      }),
    });

    const result = await res.json();

    if (!res.ok) {
      console.error("Resend error:", result);
      return new Response(JSON.stringify({ error: "Failed to send invoice", details: result }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Invoice email sent to ${email}: ${invoiceNumber}`);

    return new Response(
      JSON.stringify({ success: true, invoiceNumber, id: result.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Invoice email error:", error);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
