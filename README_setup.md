# Souklane landing page — setup guide

Four files:

| File | What it is |
|---|---|
| `index.html` | The whole website (HTML + CSS + JS). Deploy this. |
| `supabase_leads.sql` | Creates the leads table + security policy. |
| `edge-function_notify-lead.ts` | Sends the two emails on each new lead. |
| `README_setup.md` | This guide. |

> **The form won't work in the chat preview** — there are no live keys yet. It runs in "preview mode" and tells you so. Once you paste real keys and deploy, it saves leads and emails you.

---

## 1. Fill in the placeholders (in `index.html`)

Open `index.html` and search for each of these:

| Placeholder | Where | What to paste |
|---|---|---|
| `PASTE_SUPABASE_URL` | `<script>` config block | Your Supabase project URL |
| `PASTE_SUPABASE_ANON_KEY` | `<script>` config block | Your Supabase **anon/public** key |
| `PASTE_WHATSAPP_NUMBER` | `<script>` config block | Your WhatsApp Business number, digits only w/ country code (e.g. `61400000000`) |
| `PASTE_YOUR_EMAIL` | footer | Your contact email |
| `Souklane` | throughout | Your final brand name (once decided) |
| Meta Pixel slot | `<head>` comment | Your Meta Pixel script (later) |
| GA4 / Google Tag slot | `<head>` comment | Your GA4 script (later) |
| Brand logo slots | trust bar | Client/brand logos — **only** ones you're permitted to display |
| Pilot testimonials | proof section | Real quotes from your first clients |
| Category cards | "What we source" | Add/remove as your factory network firms up |
| Trust stat numbers | trust bar | Confirm/replace the placeholder figures |

---

## 2. Set up Supabase (the database)

1. Create a free project at **supabase.com**.
2. Go to **SQL Editor → New query**, paste all of `supabase_leads.sql`, click **Run**.
3. Go to **Project Settings → API** and copy:
   - **Project URL** → paste into `PASTE_SUPABASE_URL`
   - **anon public** key → paste into `PASTE_SUPABASE_ANON_KEY`

That's the form saving leads. You can read them anytime in **Table Editor → leads**.

---

## 3. Set up the emails (Resend + Edge Function)

**a. Resend**
1. Sign up at **resend.com** (free tier).
2. Add & verify a sending domain (or use their onboarding sender to test).
3. Create an **API key** → copy it.

**b. Deploy the function** (needs the Supabase CLI — `npm i -g supabase`)
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
# put the file at: supabase/functions/notify-lead/index.ts
supabase functions deploy notify-lead --no-verify-jwt

# set the secrets:
supabase secrets set RESEND_API_KEY=your_resend_key
supabase secrets set ALERT_EMAIL=you@gmail.com
supabase secrets set FROM_EMAIL=hello@yourdomain.com
supabase secrets set BRAND_NAME="Souklane"
```

**c. Trigger it on every new lead** (Database Webhook)
1. Supabase Dashboard → **Database → Webhooks → Create a new hook**.
2. Table: `leads`, Events: **Insert**.
3. Type: **Supabase Edge Functions** → select `notify-lead`.
4. Save. Now every new lead emails you *and* auto-replies to the enquirer.

> Prefer no CLI? You can also paste the function into **Edge Functions** in the dashboard and create the webhook there.

---

## 4. Deploy the site

Any static host works — **Netlify, Vercel, Cloudflare Pages, GitHub Pages**. Drag-and-drop `index.html`, or connect a repo. Point your domain at it once you've picked a name.

---

## 5. Later upgrades (optional)

- **Live chat instead of the built-in bot:** paste a Tawk.to or Crisp embed before `</body>` — you'll get real-time messages on your phone. Trade-off: the built-in bot is zero-dependency and instant but only answers set questions; live chat needs you (or someone) to reply.
- **Real AI chatbot:** proxy an LLM through a Supabase Edge Function so your API key stays server-side (never in the browser).
- **Analytics:** paste Meta Pixel + GA4 into the `<head>` slots when you're ready to track.

---

## Full placeholder checklist

- [ ] `PASTE_SUPABASE_URL`
- [ ] `PASTE_SUPABASE_ANON_KEY`
- [ ] `PASTE_WHATSAPP_NUMBER`
- [ ] `PASTE_YOUR_EMAIL` (footer)
- [ ] Final brand name (replace `Souklane`)
- [ ] `RESEND_API_KEY`, `ALERT_EMAIL`, `FROM_EMAIL` (function secrets)
- [ ] Meta Pixel + GA4 tags (head)
- [ ] Brand/client logos (only if permitted)
- [ ] Pilot testimonials
- [ ] Category cards + trust stat numbers confirmed

---

### One honest flag
The related-party setup (your investor also supplying), GST, import duties, product-safety (AS/NZS ISO 8124), and insurance all need a quick check with an **Australian accountant, commercial lawyer and customs broker**. The site copy is written to stay accurate and not over-claim, but I'm not a substitute for those professionals.
