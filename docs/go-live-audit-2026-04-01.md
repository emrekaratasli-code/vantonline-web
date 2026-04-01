# VANT Go-Live Audit

Tarih: 2026-04-01
Proje: `vantonline-web`

Bu dokuman, mevcut kod tabanina gore canliya cikis oncesi acik kalan maddeleri netlestirmek icin hazirlandi.

## 1. Bloklayici Teknik Konular

Bu maddeler tamamlanmadan production cikisi onerilmez.

- [ ] `npm install` calistirildi ve bagimliliklar kuruldu
- [ ] `npm run lint` basarili
- [ ] `npm run build` basarili
- [ ] Production environment variable isimleri tek standarda cekildi
- [ ] `NEXT_PUBLIC_BASE_URL`, `NEXT_PUBLIC_SITE_URL`, `APP_BASE_URL` kullanimlari netlestirildi
- [ ] `API_SECRET_KEY` production degeri tanimlandi
- [ ] `IYZICO_API_KEY`, `IYZICO_SECRET_KEY`, `IYZICO_BASE_URL` production degerleri tanimlandi
- [ ] `SUPABASE_SERVICE_ROLE_KEY` sadece server ortaminda tanimli
- [ ] Payment callback URL production domain ile test edildi

## 2. Kodda Tespit Edilen Aciklar

### Environment tutarsizliklari

- Checklist `NEXT_PUBLIC_SITE_URL` bekliyor
- Layout metadata `NEXT_PUBLIC_BASE_URL` kullaniyor
- Payment init route `NEXT_PUBLIC_SITE_URL` veya `APP_BASE_URL` kullaniyor

Yapilacak:

- [ ] Tek bir resmi site URL env ismi sec
- [ ] Layout, SEO ve payment callback taraflarini ayni env degiskenine bagla
- [ ] `.env.example` ve `README.md` dosyalarini buna gore guncelle

### Contact form

Contact form artik `/api/contact` uzerinden Supabase `contact_messages` tablosuna kayit atiyor ve opsiyonel olarak SMTP ile bildirim maili gonderebiliyor.

Yapilacak:

- [x] Contact formu ozel API route'a bagla
- [x] Contact message tablosu icin migration hazirla
- [ ] `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `CONTACT_NOTIFICATION_TO` production'da tanimla
- [ ] Contact form submit sonrasi mail bildirimi test et

### Newsletter

Newsletter formu dogrudan `customers` tablosuna insert ediyor. Bu calisabilir ancak operasyonel akisin netlestirilmesi gerekiyor.

Yapilacak:

- [ ] Newsletter icin `customers` tablosu resmi kaynak olacaksa bunu dokumante et
- [ ] Ayrica consent ve tekrarli kayit davranisini netlestir
- [ ] Gerekirse ayri `newsletter_subscribers` tablosu veya email servisi kullan

### OTP rate limiting

OTP rate limit su anda memory icinde tutuluyor. Bu yapi tek instance disinda guvenilir degil.

Yapilacak:

- [ ] Production icin Redis, Upstash veya benzeri kalici rate limiter ekle
- [ ] OTP akisini production ortaminda test et
- [ ] `OTP_DEV_BYPASS=false` oldugunu canli ortamda dogrula

### Bank transfer bilgileri

Checkout sayfasindaki banka bilgileri placeholder olabilir.

Yapilacak:

- [ ] Banka adi, IBAN ve hesap sahibi production bilgileriyle dogrulandi
- [ ] Havale aciklamasinda siparis numarasi formatini ekip onayladi

## 3. Database ve Supabase

SQL dosyalari repo icinde mevcut, ancak uygulanip uygulanmadigi bu workspace icinden dogrulanamiyor.

Yapilacak:

- [ ] `docs/migration-orders.sql` uygulandi
- [ ] `docs/fix-orders-columns.sql` uygulandi
- [ ] `docs/migration-stock.sql` uygulandi
- [ ] `docs/migration-shipping-rates.sql` uygulandi
- [ ] `orders` tablosu gerekli kolonlarla dogrulandi
- [ ] `order_items` tablosu gerekli kolonlarla dogrulandi
- [ ] `decrement_product_stock` fonksiyonu test edildi
- [ ] Gercek stok degerleri products tablosuna girildi

## 4. Odeme ve Checkout Testleri

Kod tarafinda temel kontroller mevcut, ancak production smoke test gereklidir.

Yapilacak:

- [ ] `credit_card` akisi uctan uca test edildi
- [ ] `bank_transfer` akisi uctan uca test edildi
- [ ] Basarili odemede siparis `paid` oluyor
- [ ] Basarisiz odemede siparis `cancelled` oluyor
- [ ] Stok yetersiz ise siparis engelleniyor
- [ ] Shipping total mismatch korumasi test edildi
- [ ] Grand total mismatch korumasi test edildi
- [ ] `order-success` sayfasina siparis numarasi ile yonlendirme test edildi

## 5. Guvenlik

Kodda bir kisim korumalar var, ama production seviyesinde tamamlanmasi gerekiyor.

Mevcut:

- `api/ai/*` tarafinda Bearer auth mevcut
- Owner approval mantigi mevcut
- `api/orders/[id]` auth korumali

Eksik veya dogrulanmasi gereken:

- [ ] Production WAF veya CDN rate limiting aktif
- [ ] Hata mesajlari son kullaniciya fazla detay sizdirmiyor
- [ ] Service role key client bundle icine sizmiyor
- [ ] AI write endpointleri production secretlarla dogrulandi

## 6. Icerik ve Marka Tarafi

- [ ] Hukuki metinler son kez kontrol edildi
- [ ] KVKK, gizlilik, iade ve mesafeli satis metinleri hukuk onayindan gecti
- [ ] Sosyal medya linkleri dogrulandi
- [ ] Urun fiyatlari ve stoklar gercek verilerle eslendi
- [ ] Gorseller production kalite kontrolunden gecti
- [ ] OG image, favicon ve metadata production domain ile kontrol edildi

## 7. Operasyon

Bu maddeler repo kodundan gorunmuyor; ekip karari veya panel kurulumu gerektiriyor.

- [ ] Yeni siparis bildirimi aktif
- [ ] Kargo operasyon sureci yazili
- [ ] Havale kontrol sureci tanimli
- [ ] Iade, iptal ve refund sorumlulari net
- [ ] Musteri destek kanali hazir

## 8. Izleme

- [ ] Production log takibi aktif
- [ ] 5xx alarmi aktif
- [ ] Odeme basarisizlik orani izleniyor
- [ ] Stok dusme hatalari izleniyor
- [ ] Deploy sonrasi smoke test akisi tanimli

## 9. Oncelikli Siralama

Ilk asamada bunlar yapilmali:

1. Dependencies kur ve `lint` + `build` gecir
2. Environment variable isimlerini standardize et
3. Payment ve callback production domain ayarlarini sabitle
4. Contact form ve banka bilgilerini gercek production verileriyle tamamla
5. DB migration ve stock yapisini dogrula
6. OTP ve genel rate limiting production seviyesine tasin
7. Production smoke test yap

## 10. Mevcut Durum Ozeti

Hazir gorunenler:

- [x] Checkout ve siparis akisi temel olarak kodlanmis
- [x] Shipping hesaplama mantigi mevcut
- [x] iyzico entegrasyon route'lari mevcut
- [x] Order detail auth korumasi mevcut
- [x] AI endpoint auth mantigi mevcut
- [x] Hukuki sayfalar ve temel SEO yapisi mevcut

Henuz kapanmayanlar:

- [ ] Local build dogrulamasi
- [ ] Production env standardizasyonu
- [ ] Operasyonel hazirlik
- [ ] Monitoring ve alarmlar
- [ ] Production smoke test
