# Production Env Template

Bu dosya, `vantonline-web` production ortaminda doldurulmasi gereken environment variable'lari tek yerde toplar.

Gercek secret degerlerini bu dosyaya yazma. Bunu referans checklist olarak kullan.

## Zorunlu

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_SITE_URL=https://www.vantonline.com

IYZICO_API_KEY=
IYZICO_SECRET_KEY=
IYZICO_BASE_URL=https://api.iyzipay.com

SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=
SMTP_PASS=
CONTACT_NOTIFICATION_TO=you@yourdomain.com

UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

API_SECRET_KEY=
JARVIS_REQUIRE_APPROVAL=true
JARVIS_OWNER_APPROVAL_KEY=

CHATBOT_API_URL=

OTP_DEV_BYPASS=false
OTP_DEV_CODE=123456
```

## Opsiyonel

```env
NEXT_PUBLIC_META_PIXEL_ID=
NEXT_PUBLIC_GA_ID=
NEXT_PUBLIC_HERO_VIDEO_FALLBACK_URL=/videos/hero.mp4
```

## Legacy Fallbacks

Yeni kurulumlarda bunlari doldurmak gerekmez. Eski kod veya gecis sureci icin tutulur.

```env
# NEXT_PUBLIC_BASE_URL=https://www.vantonline.com
# APP_BASE_URL=https://www.vantonline.com
NEXT_PUBLIC_FB_PIXEL_ID=
```

## Notlar

- `NEXT_PUBLIC_SITE_URL` ana production domain degiskenidir.
- `NEXT_PUBLIC_BASE_URL` ve `APP_BASE_URL` sadece gecis sureci fallback'idir.
- `SUPABASE_SERVICE_ROLE_KEY` sadece server ortaminda olmali, client bundle'a sizmamali.
- `API_SECRET_KEY` en az 32 karakter ve rastgele olmalidir.
- `JARVIS_OWNER_APPROVAL_KEY` ayri bir secret olmali; `API_SECRET_KEY` ile ayni olmamali.
- `OTP_DEV_BYPASS=false` production'da zorunludur.
- `UPSTASH_REDIS_REST_URL` ve `UPSTASH_REDIS_REST_TOKEN` production rate limiting icin zorunludur.
- `IYZICO_BASE_URL` canli endpoint ile teyit edilmelidir.
- Contact form backend kaydi icin `docs/migration-contact-messages.sql` uygulanmalidir.
- Contact email bildirimi icin SMTP hesabinin app password/relay ayari production'da dogrulanmis olmalidir.

## Deploy Oncesi Son Kontrol

- [ ] Tum zorunlu degiskenler production paneline girildi
- [ ] `NEXT_PUBLIC_SITE_URL` gercek domain ile eslesiyor
- [ ] Upstash Redis REST degerleri girildi
- [ ] Pixel ve analytics degerleri dogrulandi
- [ ] Dev bypass kapali
- [ ] iyzico canli anahtarlari kullaniliyor
- [ ] Supabase prod projesine bagli
