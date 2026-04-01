# VANT Go-Live Checklist

Bu liste, prod ortama guvenli ve operasyonel sekilde cikis icin hazirlanmistir.

## 1) Environment ve Secrets

- [ ] `NEXT_PUBLIC_SUPABASE_URL` prod degeri girildi
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` prod degeri girildi
- [ ] `SUPABASE_SERVICE_ROLE_KEY` sadece server ortaminda tanimlandi
- [ ] `API_SECRET_KEY` guclu bir degerle tanimlandi (en az 32 karakter)
- [ ] `IYZICO_API_KEY` canli anahtar tanimlandi
- [ ] `IYZICO_SECRET_KEY` canli anahtar tanimlandi
- [ ] `IYZICO_BASE_URL` canli endpoint olarak ayarlandi
- [x] `NEXT_PUBLIC_SITE_URL` canli domain olarak ayarlandi (https)
- [ ] `NEXT_PUBLIC_BASE_URL` ve `APP_BASE_URL` deprecated fallback olarak kaldi
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` production pixel degeri ile tanimlandi
- [x] `SMTP_HOST` tanimlandi
- [x] `SMTP_PORT` dogrulandi
- [x] `SMTP_SECURE` dogrulandi
- [x] `SMTP_USER` tanimlandi
- [x] `SMTP_PASS` tanimlandi
- [x] `CONTACT_NOTIFICATION_TO` dogru alici adresine ayarlandi
- [ ] `UPSTASH_REDIS_REST_URL` tanimlandi
- [ ] `UPSTASH_REDIS_REST_TOKEN` tanimlandi
- [ ] `OTP_DEV_BYPASS=false` production'da dogrulandi

## 2) Database / Supabase

- [ ] `docs/migration-orders.sql` calistirildi
- [ ] `docs/fix-orders-columns.sql` calistirildi
- [ ] `docs/migration-stock.sql` calistirildi
- [ ] `orders` tablosunda `payment_method`, `payment_token`, `payment_id`, `shipping_address`, `total`, `currency` kolonlari dogrulandi
- [ ] `order_items` tablosunda `product_name`, `color`, `size`, `unit_price` kolonlari dogrulandi
- [ ] `decrement_product_stock` fonksiyonunun yetersiz stokta `FALSE` dondugu test edildi
- [ ] Urunlerde `stock_quantity` degerleri gercek stoklara gore dolduruldu

## 3) Payment (iyzico)

- [ ] Merchant hesabi canlida aktif ve onayli
- [ ] 3D Secure akisi canli test edildi
- [ ] Basarili odeme sonrasi siparis `paid` oluyor
- [ ] Basarisiz odeme sonrasi siparis `cancelled` oluyor
- [ ] Callback URL dogrulandi: `https://<domain>/api/payment/callback`
- [ ] Callback token eslesme kontrolu loglarda dogrulandi
- [ ] Taksit secenekleri isletme karariyla netlestirildi

## 4) Checkout ve Siparis Akisi

- [ ] `credit_card` akisi uctan uca test edildi
- [ ] `bank_transfer` akisi uctan uca test edildi
- [ ] `NEXT_PUBLIC_SITE_URL` canonical davranisi layout, robots ve sitemap icin dogrulandi
- [ ] `order-success` sayfasina dogru siparis numarasi ile yonlendirme test edildi
- [ ] Siparis olusurken toplam tutarin DB fiyatlariyla hesaplandigi dogrulandi
- [ ] Sepet manipulasyonuna karsi fiyat guvenligi test edildi
- [ ] Yetersiz stokta siparisin engellendigi test edildi
- [ ] Payment callback URL production domain ile dogrulandi

## 5) Guvenlik

- [ ] `/api/ai/*` endpointleri sadece `Bearer API_SECRET_KEY` ile erisilebilir
- [ ] `/api/orders/[id]` endpointi auth korumali calisiyor
- [ ] Service Role key hicbir client bundle icine sizmiyor
- [ ] Prod'da hata detaylari son kullaniciya dondurulmuyor
- [ ] Rate limiting (CDN/WAF veya middleware) aktif
- [ ] OTP send limiter 4. istekte `429` donuyor
- [ ] OTP verify limiter 6. istekte `429` donuyor
- [ ] Contact form limiter 6. istekte `429` donuyor

## 6) Hukuki ve Politika Metinleri

- [ ] Mesafeli Satis Sozlesmesi guncel
- [ ] KVKK metni guncel
- [ ] Gizlilik Politikasi guncel
- [ ] Iade ve Kargo politikalari guncel
- [ ] Checkout onay metinleri hukuk metinleriyle tutarli

## 7) Operasyon

- [ ] Yeni siparis bildirimi (mail/panel) aktif
- [ ] Kargo operasyon adimlari dokumante edildi
- [ ] Havale/EFT dogrulama sureci tanimlandi
- [ ] Iade/iptal/refund sorumlulari net
- [ ] Musteri destek iletisim kanali hazir

## 8) Izleme ve Olay Yonetimi

- [ ] Prod log takibi aktif (Vercel/Sentry vb.)
- [ ] 5xx hata alarmi tanimlandi
- [ ] Odeme basarisizlik orani izleniyor
- [ ] Stok dusme hatalari izleniyor
- [ ] Kritik olaylar icin mudahale proseduru var
- [ ] Contact form submit + mail bildirimi smoke test'i kayda alindi

## 9) Son Release Kontrolu

- [ ] `npm run lint` calisti (bloklayici hata yok)
- [ ] `npm run build` basarili
- [ ] Prod deploy tamamlandi
- [ ] Deploy sonrasi smoke test tamamlandi
- [ ] Ilk 24 saat izleme plani aktif

---

## Go / No-Go

- [ ] Tum kritik maddeler tamamlandi
- [ ] Canliya cikis onayi verildi
- [ ] Cikis zamani: `____ / ____ / ______  ____:____`
- [ ] Onaylayan: `__________________`
