# VANT Streetwear — Setup & Deployment

> Deployment note (2026-03-09): Automated smoke deploy triggered by Friday for Vantonline.com.

## Quick Start

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
# → http://localhost:3000

# Build for production (static export)
npm run build
# → Output: /out directory
```

## Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Set your values:
```
NEXT_PUBLIC_META_PIXEL_ID=your_pixel_id
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
IYZICO_API_KEY=your_iyzico_api_key
IYZICO_SECRET_KEY=your_iyzico_secret_key
IYZICO_BASE_URL=https://api.iyzipay.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your_authenticated_mailbox
SMTP_PASS=your_app_password
CONTACT_NOTIFICATION_TO=you@yourdomain.com
UPSTASH_REDIS_REST_URL=https://your-upstash-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token

# J.A.R.V.I.S. control mode (owner approval required for AI write actions)
API_SECRET_KEY=your_api_secret_key
JARVIS_REQUIRE_APPROVAL=true
JARVIS_OWNER_APPROVAL_KEY=your_owner_only_approval_key
```

Notes:
- `NEXT_PUBLIC_SITE_URL` is the primary production domain variable for SEO and payment callbacks.
- `NEXT_PUBLIC_BASE_URL` and `APP_BASE_URL` are deprecated URL fallbacks kept only for migration safety.
- `NEXT_PUBLIC_FB_PIXEL_ID` remains as a legacy analytics fallback for older setups.
- Contact form email notifications use SMTP and require `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, and `CONTACT_NOTIFICATION_TO`.
- OTP and contact rate limiting use Upstash Redis REST in production via `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.

When `JARVIS_REQUIRE_APPROVAL=true`, all write endpoints under `/api/ai/*` require:
- `Authorization: Bearer <API_SECRET_KEY>`
- `x-jarvis-owner-approval: <JARVIS_OWNER_APPROVAL_KEY>`

Without the owner-approval header, write actions are blocked.

## Deploy

### Vercel (recommended)
```bash
npx vercel --prod
```
Or connect GitHub repo → Vercel auto-deploys.

### Netlify
1. Build command: `npm run build`
2. Publish directory: `out`
3. Or use `netlify deploy --prod --dir=out`

### Cloudflare Pages
1. Build command: `npm run build`
2. Build output: `out`

## Custom Domain DNS

| Type | Name | Value |
|------|------|-------|
| A | @ | Platform IP (from Vercel/Netlify/CF) |
| CNAME | www | your-project.vercel.app (or equivalent) |

Or if using Google Domains:
1. Go to DNS settings
2. Add the above records
3. Wait for propagation (~30 min)

## Product Images

Replace placeholder images in `/public/images/products/` and `/public/images/lookbook/` with your actual photos. Recommended sizes:
- Product images: 800×1067px (3:4 ratio)
- Lookbook wide: 1600×900px (16:9 ratio)
- OG image: 1200×630px

## Before Launch Checklist

- [ ] Replace placeholder product images with real photos
- [ ] Replace placeholder Shopier URLs in `src/data/products.ts`
- [ ] Set Meta Pixel ID in `.env.local`
- [ ] Set Google Analytics ID in `.env.local`
- [ ] Add real social media links in `Footer.tsx`
- [ ] Add OG image at `/public/og-image.jpg` (1200×630)
- [ ] Add favicon at `/public/favicon.ico`
- [ ] Wire newsletter form to email service (Mailchimp, ConvertKit, etc.)
- [ ] Verify contact form DB save + email notification on production
- [ ] Set `NEXT_PUBLIC_SITE_URL` in `.env.local` to your actual domain
- [ ] Configure `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
- [ ] Confirm `OTP_DEV_BYPASS=false` in production
- [ ] Review all Turkish copy for brand consistency
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit
- [ ] Set up custom domain DNS
- [ ] Enable HTTPS (auto on Vercel/Netlify/CF)
