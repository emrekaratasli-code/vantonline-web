# VANT Go-Live Checklist

Bu liste, prod ortama güvenli ve operasyonel şekilde çıkış için hazırlanmıştır.

## 1) Environment ve Secrets

- [ ] `NEXT_PUBLIC_SUPABASE_URL` prod değeri girildi
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` prod değeri girildi
- [ ] `SUPABASE_SERVICE_ROLE_KEY` sadece server ortamında tanımlandı
- [ ] `API_SECRET_KEY` güçlü bir değerle tanımlandı (en az 32 karakter)
- [ ] `IYZICO_API_KEY` canlı anahtar tanımlandı
- [ ] `IYZICO_SECRET_KEY` canlı anahtar tanımlandı
- [ ] `IYZICO_BASE_URL` canlı endpoint olarak ayarlandı
- [ ] `NEXT_PUBLIC_SITE_URL` canlı domain olarak ayarlandı (https)

## 2) Database / Supabase

- [ ] `docs/migration-orders.sql` çalıştırıldı
- [ ] `docs/fix-orders-columns.sql` çalıştırıldı
- [ ] `docs/migration-stock.sql` çalıştırıldı
- [ ] `orders` tablosunda `payment_method`, `payment_token`, `payment_id`, `shipping_address`, `total`, `currency` kolonları doğrulandı
- [ ] `order_items` tablosunda `product_name`, `color`, `size`, `unit_price` kolonları doğrulandı
- [ ] `decrement_product_stock` fonksiyonunun yetersiz stokta `FALSE` döndüğü test edildi
- [ ] Ürünlerde `stock_quantity` değerleri gerçek stoklara göre dolduruldu

## 3) Payment (iyzico)

- [ ] Merchant hesabı canlıda aktif ve onaylı
- [ ] 3D Secure akışı canlı test edildi
- [ ] Başarılı ödeme sonrası sipariş `paid` oluyor
- [ ] Başarısız ödeme sonrası sipariş `cancelled` oluyor
- [ ] Callback URL doğrulandı: `https://<domain>/api/payment/callback`
- [ ] Callback token eşleşme kontrolü loglarda doğrulandı
- [ ] Taksit seçenekleri işletme kararıyla netleştirildi

## 4) Checkout ve Sipariş Akışı

- [ ] `credit_card` akışı uçtan uca test edildi
- [ ] `bank_transfer` akışı uçtan uca test edildi
- [ ] `order-success` sayfasına doğru sipariş numarası ile yönlendirme test edildi
- [ ] Sipariş oluşurken toplam tutarın DB fiyatlarıyla hesaplandığı doğrulandı
- [ ] Sepet manipülasyonuna karşı fiyat güvenliği test edildi
- [ ] Yetersiz stokta siparişin engellendiği test edildi

## 5) Güvenlik

- [ ] `/api/ai/*` endpointleri sadece `Bearer API_SECRET_KEY` ile erişilebilir
- [ ] `/api/orders/[id]` endpointi auth korumalı çalışıyor
- [ ] Service Role key hiçbir client bundle içine sızmıyor
- [ ] Prod’da hata detayları son kullanıcıya döndürülmüyor
- [ ] Rate limiting (CDN/WAF veya middleware) aktif

## 6) Hukuki ve Politika Metinleri

- [ ] Mesafeli Satış Sözleşmesi güncel
- [ ] KVKK metni güncel
- [ ] Gizlilik Politikası güncel
- [ ] İade ve Kargo politikaları güncel
- [ ] Checkout onay metinleri hukuk metinleriyle tutarlı

## 7) Operasyon

- [ ] Yeni sipariş bildirimi (mail/panel) aktif
- [ ] Kargo operasyon adımları dokümante edildi
- [ ] Havale/EFT doğrulama süreci tanımlandı
- [ ] İade/iptal/refund sorumluları net
- [ ] Müşteri destek iletişim kanalı hazır

## 8) İzleme ve Olay Yönetimi

- [ ] Prod log takibi aktif (Vercel/Sentry vb.)
- [ ] 5xx hata alarmı tanımlandı
- [ ] Ödeme başarısızlık oranı izleniyor
- [ ] Stok düşme hataları izleniyor
- [ ] Kritik olaylar için müdahale prosedürü var

## 9) Son Release Kontrolü

- [ ] `npm run lint` çalıştı (bloklayıcı hata yok)
- [ ] `npm run build` başarılı
- [ ] Prod deploy tamamlandı
- [ ] Deploy sonrası smoke test tamamlandı
- [ ] İlk 24 saat izleme planı aktif

---

## Go / No-Go

- [ ] Tüm kritik maddeler tamamlandı
- [ ] Canlıya çıkış onayı verildi
- [ ] Çıkış zamanı: `____ / ____ / ______  ____:____`
- [ ] Onaylayan: `__________________`

