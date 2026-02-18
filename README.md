# VANT Streetwear — Setup & Deployment

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
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

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
- [ ] Wire contact form (Formspree, Netlify Forms, or custom API)
- [ ] Update `metadataBase` URL in `layout.tsx` to your actual domain
- [ ] Update canonical URL to your actual domain
- [ ] Review all Turkish copy for brand consistency
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit
- [ ] Set up custom domain DNS
- [ ] Enable HTTPS (auto on Vercel/Netlify/CF)
