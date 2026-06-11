# DealDesk — Deployment Guide
### Real estate underwriting SaaS with 4 tools: SFH · Multifamily · MHP · Wholesale

---

## What you need (all free to start)

| Service | What it does | Link |
|---|---|---|
| Supabase | User login & database | supabase.com |
| Stripe | Payments | stripe.com |
| Anthropic | AI underwriting | console.anthropic.com |
| Vercel | Hosting | vercel.com |

---

## Step 1 — Supabase (10 min)

1. Go to **supabase.com** → New Project → name it "dealdesk"
2. Once created, go to **SQL Editor** → paste and run the entire contents of `supabase-schema.sql`
3. Go to **Settings → API** and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - service_role key → `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2 — Stripe (10 min)

1. Go to **stripe.com** → create and activate your account
2. Go to **Products → Add Product**
   - Name: "DealDesk Pro"
   - Price: **$67.00 / month** (recurring)
   - Save → copy the **Price ID** (starts with `price_`) → `STRIPE_PRICE_ID`
3. Go to **Developers → API Keys** → copy:
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Go to **Developers → Webhooks → Add endpoint**
   - URL: `https://YOUR-VERCEL-URL.vercel.app/api/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy signing secret → `STRIPE_WEBHOOK_SECRET`

---

## Step 3 — Anthropic (2 min)

1. Go to **console.anthropic.com** → API Keys → Create key
2. Copy it → `ANTHROPIC_API_KEY`
3. Add a payment method (pay-as-you-go, ~$0.03 per analysis)

---

## Step 4 — Deploy to Vercel (5 min)

1. Go to **github.com** → New repository → upload this entire folder
2. Go to **vercel.com** → New Project → Import your GitHub repo
3. In Vercel → your project → **Settings → Environment Variables**, add all 9 variables:

```
NEXT_PUBLIC_SUPABASE_URL        = https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJ...
SUPABASE_SERVICE_ROLE_KEY       = eyJ...
STRIPE_SECRET_KEY               = sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_live_...
STRIPE_WEBHOOK_SECRET           = whsec_...
STRIPE_PRICE_ID                 = price_...
ANTHROPIC_API_KEY               = sk-ant-...
NEXT_PUBLIC_APP_URL             = https://your-project.vercel.app
```

4. Click **Deploy**
5. Copy your Vercel URL and update `NEXT_PUBLIC_APP_URL` + the Stripe webhook URL

---

## Step 5 — Custom Domain (optional, $12/yr)

1. Buy a domain on Namecheap (e.g. `getdealdesk.com`)
2. Vercel → your project → **Settings → Domains** → add your domain
3. Follow the DNS instructions
4. Update `NEXT_PUBLIC_APP_URL` + Stripe webhook URL to your domain

---

## You're live!

Users can now:
- Sign up and get a 7-day free trial (5 analyses)
- Subscribe for $67/month via Stripe
- Underwrite SFH, multifamily, MHP, and wholesale deals
- Paste deal info and get AI analysis instantly
- Track their deal history

---

## Local Development

```bash
npm install
cp .env.example .env.local
# fill in .env.local with your keys
npm run dev
# open http://localhost:3000
```

---

## Customizing

| What | Where |
|---|---|
| Change price | Stripe dashboard → update product price |
| Change trial length | `supabase-schema.sql` line: `interval '7 days'` |
| Change trial analysis limit | `app/api/underwrite/route.ts` line: `>= 5` |
| Edit landing page | `app/page.tsx` |
| Add more tools | `components/underwriter/Underwriter.jsx` |
