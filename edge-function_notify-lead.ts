// =============================================================
//  Supabase Edge Function: notify-lead
//  Sends TWO emails via Resend when a new lead is inserted:
//    (a) ALERT to you (the owner) with the lead details
//    (b) AUTO-REPLY to the person who enquired
//
//  Deploy path: supabase/functions/notify-lead/index.ts
//  Trigger: a Database Webhook on INSERT into public.leads (see README)
// =============================================================

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

// ---- Secrets (set with: supabase secrets set KEY=value) ----
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;   // from resend.com
const ALERT_EMAIL    = Deno.env.get("ALERT_EMAIL")!;      // your Gmail, e.g. you@gmail.com
const FROM_EMAIL     = Deno.env.get("FROM_EMAIL")!;       // a verified sender, e.g. hello@yourdomain.com
const BRAND_NAME     = Deno.env.get("BRAND_NAME") ?? "Souklane";

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: `${BRAND_NAME} <${FROM_EMAIL}>`, to, subject, html }),
  });
  if (!res.ok) console.error("Resend error:", await res.text());
  return res.ok;
}

serve(async (req) => {
  try {
    // Supabase DB webhook sends { type, table, record, ... }
    const payload = await req.json();
    const lead = payload.record ?? payload; // supports webhook or direct call

    const name     = lead.name || "there";
    const email    = lead.email;
    const company  = lead.company || "—";
    const product  = lead.product || "—";
    const quantity = lead.quantity || "—";
    const timeline = lead.timeline || "—";
    const message  = lead.message || "—";

    if (!email) return new Response("No email in payload", { status: 400 });

    // (a) ALERT to you
    await sendEmail(
      ALERT_EMAIL,
      `🚀 New lead: ${name}${company !== "—" ? " · " + company : ""} (${product})`,
      `<h2>New enquiry via ${BRAND_NAME}</h2>
       <table style="font-family:sans-serif;font-size:14px;border-collapse:collapse">
         <tr><td style="padding:4px 12px 4px 0"><b>Name</b></td><td>${name}</td></tr>
         <tr><td style="padding:4px 12px 4px 0"><b>Company</b></td><td>${company}</td></tr>
         <tr><td style="padding:4px 12px 4px 0"><b>Email</b></td><td>${email}</td></tr>
         <tr><td style="padding:4px 12px 4px 0"><b>Product</b></td><td>${product}</td></tr>
         <tr><td style="padding:4px 12px 4px 0"><b>Quantity</b></td><td>${quantity}</td></tr>
         <tr><td style="padding:4px 12px 4px 0"><b>Timeline</b></td><td>${timeline}</td></tr>
         <tr><td style="padding:4px 12px 4px 0"><b>Message</b></td><td>${message}</td></tr>
       </table>`
    );

    // (b) AUTO-REPLY to the enquirer
    await sendEmail(
      email,
      `Thanks for your enquiry, ${name} — ${BRAND_NAME}`,
      `<div style="font-family:sans-serif;font-size:15px;color:#17231E;line-height:1.6">
         <p>Hi ${name},</p>
         <p>Thanks for reaching out to ${BRAND_NAME}. We've captured your enquiry
            ${product !== "—" ? `about <b>${product.toLowerCase()}</b>` : ""} and we'll get back to you
            within one business day with the next steps.</p>
         <p>In the meantime, if it's easier, you can reply straight to this email.</p>
         <p>Talk soon,<br/>The ${BRAND_NAME} team</p>
       </div>`
    );

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ ok: false, error: String(err) }), { status: 500 });
  }
});
