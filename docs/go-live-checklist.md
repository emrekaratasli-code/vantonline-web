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
- [ ] `NEXT_PUBLIC_SITE_URL` canli domain olarak ayarlandi (https)
- [ ] `NEXT_PUBLIC_META_PIXEL_ID` production pixel degeri ile tanimlandi
- [ ] `SMTP_HOST` tanimlandi
- [ ] `SMTP_PORT` dogrulandi
- [ ] `SMTP_SECURE` dogrulandi
- [ ] `SMTP_USER` tanimlandi
- [ ] `SMTP_PASS` tanimlandi
- [ ] `CONTACT_NOTIFICATION_TO` dogru alici adresine ayarlandi

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
- [ ] `order-success` sayfasina dogru siparis numarasi ile yonlendirme test edildi
- [ ] Siparis olusurken toplam tutarin DB fiyatlariyla hesaplandigi dogrulandi
- [ ] Sepet manipulasyonuna karsi fiyat guvenligi test edildi
- [ ] Yetersiz stokta siparisin engellendigi test edildi

## 5) Guvenlik

- [ ] `/api/ai/*` endpointleri sadece `Bearer API_SECRET_KEY` ile erisilebilir
- [ ] `/api/orders/[id]` endpointi auth korumali calisiyor
- [ ] Service Role key hicbir client bundle icine sizmiyor
- [ ] Prod'da hata detaylari son kullaniciya dondurulmuyor
- [ ] Rate limiting (CDN/WAF veya middleware) aktif

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
