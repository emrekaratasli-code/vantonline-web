'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/lib/i18n';
import { useCart } from '@/lib/CartContext';
import FadeIn from '@/components/FadeIn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */
interface ShippingData {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country: string;
    address: string;
    city: string;
    district: string;
    postalCode: string;
}

interface ConsentData {
    marketingSms: boolean;
    marketingEmail: boolean;
}

interface ShippingRateOption {
    carrierId: string;
    carrierName: string;
    carrierLogo: string | null;
    sortOrder: number;
    price: number;
    estimatedDays: string | null;
    city: string;
}

type PaymentMethod = 'bank_transfer' | 'credit_card';

type Step = 'shipping' | 'otp' | 'consent' | 'payment' | 'iyzico_form';

const STEPS: Step[] = ['shipping', 'otp', 'consent', 'payment'];
const OTHER_CITY_VALUE = 'Diger';

type ShippingCountry = {
    code: string;
    tr: string;
    en: string;
    cities: string[];
};

const SHIPPING_COUNTRIES: ShippingCountry[] = [
    { code: 'TR', tr: 'Türkiye', en: 'Turkey', cities: ['Istanbul', 'Ankara', 'Izmir', 'Bursa', 'Antalya'] },
    { code: 'DE', tr: 'Almanya', en: 'Germany', cities: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt'] },
    { code: 'NL', tr: 'Hollanda', en: 'Netherlands', cities: ['Amsterdam', 'Rotterdam', 'Utrecht'] },
    { code: 'CH', tr: 'İsviçre', en: 'Switzerland', cities: ['Zurich', 'Geneva', 'Basel'] },
    { code: 'SE', tr: 'İsveç', en: 'Sweden', cities: ['Stockholm', 'Gothenburg', 'Malmo'] },
    { code: 'NO', tr: 'Norveç', en: 'Norway', cities: ['Oslo', 'Bergen', 'Trondheim'] },
    { code: 'DK', tr: 'Danimarka', en: 'Denmark', cities: ['Copenhagen', 'Aarhus', 'Odense'] },
    { code: 'AT', tr: 'Avusturya', en: 'Austria', cities: ['Vienna', 'Graz', 'Linz'] },
    { code: 'BE', tr: 'Belçika', en: 'Belgium', cities: ['Brussels', 'Antwerp', 'Ghent'] },
    { code: 'GB', tr: 'Birleşik Krallık', en: 'United Kingdom', cities: ['London', 'Manchester', 'Birmingham'] },
    { code: 'IE', tr: 'İrlanda', en: 'Ireland', cities: ['Dublin', 'Cork', 'Galway'] },
    { code: 'US', tr: 'Amerika Birleşik Devletleri', en: 'United States', cities: ['New York', 'Los Angeles', 'Miami'] },
    { code: 'CA', tr: 'Kanada', en: 'Canada', cities: ['Toronto', 'Vancouver', 'Montreal'] },
    { code: 'AU', tr: 'Avustralya', en: 'Australia', cities: ['Sydney', 'Melbourne', 'Brisbane'] },
    { code: 'NZ', tr: 'Yeni Zelanda', en: 'New Zealand', cities: ['Auckland', 'Wellington', 'Christchurch'] },
    { code: 'SG', tr: 'Singapur', en: 'Singapore', cities: ['Singapore'] },
    { code: 'JP', tr: 'Japonya', en: 'Japan', cities: ['Tokyo', 'Osaka', 'Yokohama'] },
    { code: 'AE', tr: 'Birleşik Arap Emirlikleri', en: 'United Arab Emirates', cities: ['Dubai', 'Abu Dhabi', 'Sharjah'] },
    { code: 'QA', tr: 'Katar', en: 'Qatar', cities: ['Doha', 'Al Rayyan'] },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Normalise local phone input to E.164 (+905XXXXXXXXX) */
function toE164(input: string): string {
    const digits = input.replace(/\D/g, '');
    if (digits.startsWith('90') && digits.length === 12) return `+${digits}`;
    if (digits.startsWith('0') && digits.length === 11) return `+9${digits}`;
    if (digits.length === 10 && digits.startsWith('5')) return `+90${digits}`;
    return `+90${digits}`;
}

function isValidPhone(phone: string): boolean {
    const e164 = toE164(phone);
    return /^\+905\d{9}$/.test(e164);
}

function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function CheckoutPage() {
    const { lang, t } = useLanguage();
    const { cartItems, cartTotal } = useCart();
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState<Step>('shipping');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Shipping
    const [shipping, setShipping] = useState<ShippingData>({
        firstName: '', lastName: '', email: '', phone: '',
        country: 'TR', address: '', city: '', district: '', postalCode: '',
    });

    // OTP
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpMessage, setOtpMessage] = useState('');
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [skipVerificationSteps, setSkipVerificationSteps] = useState(false);

    // Consent
    const [consent, setConsent] = useState<ConsentData>({ marketingSms: false, marketingEmail: false });

    // Payment
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('credit_card');
    const [agreementAccepted, setAgreementAccepted] = useState(false);
    const [orderLoading, setOrderLoading] = useState(false);
    const [orderError, setOrderError] = useState('');

    const [shippingOptions, setShippingOptions] = useState<ShippingRateOption[]>([]);
    const [shippingLoading, setShippingLoading] = useState(false);
    const [shippingError, setShippingError] = useState('');

    // iyzico checkout form
    const [iyzicoFormHtml, setIyzicoFormHtml] = useState('');
    const iyzicoFormRef = useRef<HTMLDivElement>(null);

    /** Format kuruş → TRY */
    const formatPrice = (kuruş: number) =>
        `${t.product.currency[lang]}${(kuruş / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

    const selectedShippingRate = shippingOptions[0] ?? null;
    const shippingTotal = selectedShippingRate?.price ?? 0;
    const payableTotal = cartTotal + shippingTotal;


    // Fetch user session on mount
    useEffect(() => {
        const fetchSession = async () => {
            const { createBrowserSupabaseClient } = await import('@/lib/supabase');
            const supabase = createBrowserSupabaseClient();
            if (!supabase) return;
            
            const { data } = await supabase.auth.getSession();
            if (data.session?.user) {
                const user = data.session.user;
                const provider = user.app_metadata?.provider;
                setShipping(prev => ({
                    ...prev,
                    email: user.email || prev.email,
                    firstName: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0] || prev.firstName,
                    lastName: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || prev.lastName,
                }));
                setOtpVerified(true);
                if (provider === 'google') {
                    setSkipVerificationSteps(true);
                }
            }
        };
        fetchSession();
    }, []);

    useEffect(() => {
        const city = shipping.city.trim();
        if (city.length < 2) {
            setShippingOptions([]);
            setShippingError('');
            setShippingLoading(false);
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                setShippingLoading(true);
                setShippingError('');

                const res = await fetch(`/api/shipping/rates?city=${encodeURIComponent(city)}`, {
                    signal: controller.signal,
                });
                const data = await res.json();

                if (!res.ok) {
                    setShippingOptions([]);
                    setShippingError(data?.error || 'Shipping rates could not be loaded.');
                    return;
                }

                const options = Array.isArray(data?.carriers) ? data.carriers : [];
                if (options.length === 0) {
                    setShippingOptions([]);
                    setShippingError(lang === 'tr' ? 'Bu sehir icin aktif kargo secenegi bulunamadi.' : 'No active shipping options for this city.');
                    return;
                }

                setShippingOptions(options);
            } catch (err) {
                if ((err as Error).name === 'AbortError') return;
                setShippingOptions([]);
                setShippingError(lang === 'tr' ? 'Kargo fiyatlari alinamadi.' : 'Shipping rates could not be loaded.');
            } finally {
                setShippingLoading(false);
            }
        }, 350);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [shipping.city, lang]);

    useEffect(() => {
        const selectedCountry = SHIPPING_COUNTRIES.find((item) => item.code === shipping.country);
        const allowedCities = selectedCountry?.cities ?? [];
        if (shipping.city && !allowedCities.includes(shipping.city)) {
            setShipping((prev) => ({ ...prev, city: '' }));
        }
    }, [shipping.country, shipping.city]);

async function handleGoogleLogin() {
        setIsGoogleLoading(true);
        try {
            const { createBrowserSupabaseClient } = await import('@/lib/supabase');
            const supabase = createBrowserSupabaseClient();
            if (!supabase) return;

            await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin + '/checkout'
                }
            });
        } catch (e) {
            console.error('Google login error', e);
            setIsGoogleLoading(false);
        }
    }

    /* ------- step index ------- */
    const visibleSteps = skipVerificationSteps
        ? (['shipping', 'payment'] as Step[])
        : STEPS;
    const stepIndex = currentStep === 'iyzico_form'
        ? visibleSteps.length // beyond last visible step
        : visibleSteps.indexOf(currentStep);
    const currentVisibleStepNumber = Math.max(1, Math.min(visibleSteps.length, stepIndex + 1));
    const progressPercent = Math.round((currentVisibleStepNumber / visibleSteps.length) * 100);

    /* ------- validation ------- */
    function validateShipping(): boolean {
        const e: Record<string, string> = {};
        if (!shipping.firstName.trim()) e.firstName = t.checkout.required[lang];
        if (!shipping.lastName.trim()) e.lastName = t.checkout.required[lang];
        if (!shipping.email.trim()) e.email = t.checkout.required[lang];
        else if (!isValidEmail(shipping.email)) e.email = t.checkout.invalidEmail[lang];
        if (shipping.phone.trim() && !isValidPhone(shipping.phone)) e.phone = t.checkout.invalidPhone[lang];
        if (!shipping.country.trim()) e.country = t.checkout.required[lang];
        if (!shipping.address.trim()) e.address = t.checkout.required[lang];
        if (!shipping.city.trim()) e.city = t.checkout.required[lang];
        setErrors(e);
        return Object.keys(e).length === 0;
    }

    /* ------- OTP actions ------- */
    async function handleSendOtp() {
        setOtpLoading(true);
        setOtpMessage('');
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: shipping.email }),
            });
            const data = await res.json();
            if (res.ok) {
                setOtpSent(true);
                setOtpMessage(t.otp.codeSent[lang]);
            } else {
                setOtpMessage(data.error ?? t.otp.error[lang]);
            }
        } catch {
            setOtpMessage(t.otp.error[lang]);
        } finally {
            setOtpLoading(false);
        }
    }

    async function handleVerifyOtp() {
        setOtpLoading(true);
        setOtpMessage('');
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: shipping.email,
                    phone: shipping.phone ? toE164(shipping.phone) : null,
                    code: otpCode,
                    customer: {
                        firstName: shipping.firstName,
                        lastName: shipping.lastName,
                        email: shipping.email,
                    },
                    consents: consent,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setOtpVerified(true);
                setOtpMessage(t.otp.verified[lang]);
            } else if (res.status === 429) {
                setOtpMessage(t.otp.tooManyAttempts[lang]);
            } else {
                setOtpMessage(data.error ?? t.otp.invalidCode[lang]);
            }
        } catch {
            setOtpMessage(t.otp.error[lang]);
        } finally {
            setOtpLoading(false);
        }
    }

    /* ------- navigation ------- */
    function goNext() {
        if (currentStep === 'shipping' && !validateShipping()) return;
        if (currentStep === 'otp' && !otpVerified) return;

        if (currentStep === 'shipping' && skipVerificationSteps) {
            setCurrentStep('payment');
            return;
        }

        if (currentStep === 'shipping' && otpVerified) {
            setCurrentStep('consent');
            return;
        }

        const currentIdx = visibleSteps.indexOf(currentStep);
        const nextIdx = currentIdx + 1;
        if (nextIdx < visibleSteps.length) setCurrentStep(visibleSteps[nextIdx]);
    }

    function goBack() {
        if (currentStep === 'iyzico_form') {
            setCurrentStep('payment');
            setIyzicoFormHtml('');
            return;
        }

        if (currentStep === 'consent' && otpVerified && !skipVerificationSteps) {
            setCurrentStep('shipping');
            return;
        }

        const currentIdx = visibleSteps.indexOf(currentStep);
        const prevIdx = currentIdx - 1;
        if (prevIdx >= 0) setCurrentStep(visibleSteps[prevIdx]);
    }

    /* ------- iyzico form injection ------- */
    useEffect(() => {
        if (currentStep === 'iyzico_form' && iyzicoFormHtml && iyzicoFormRef.current) {
            const container = iyzicoFormRef.current;
            container.innerHTML = iyzicoFormHtml;

            // Execute any <script> tags in the injected HTML
            const scripts = container.querySelectorAll('script');
            scripts.forEach((oldScript) => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach((attr) =>
                    newScript.setAttribute(attr.name, attr.value),
                );
                newScript.textContent = oldScript.textContent;
                oldScript.parentNode?.replaceChild(newScript, oldScript);
            });
        }
    }, [currentStep, iyzicoFormHtml]);

    /* ------- place order ------- */
    async function handlePlaceOrder() {
        if (!agreementAccepted) return;
        setOrderLoading(true);
        setOrderError('');

        if (!selectedShippingRate) {
            setOrderError(lang === 'tr' ? 'Kargo secenegi bulunamadi.' : 'No shipping option found.');
            return;
        }
        try {
            // Step 1: Create order in Supabase
            const orderRes = await fetch('/api/orders/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shipping,
                    cartItems: cartItems.map(item => ({
                        productId: item.productId,
                        name: item.name,
                        size: item.size,
                        color: item.color,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                    cartTotal,
                    shippingTotal,
                    grandTotal: payableTotal,
                    shippingRate: {
                        carrierId: selectedShippingRate.carrierId,
                        carrierName: selectedShippingRate.carrierName,
                        price: selectedShippingRate.price,
                        estimatedDays: selectedShippingRate.estimatedDays,
                        resolvedCity: selectedShippingRate.city,
                    },
                    customerPhone: toE164(shipping.phone),
                    paymentMethod,
                }),
            });
            const orderData = await orderRes.json();
            if (!orderRes.ok || !orderData.ok) {
                setOrderError(orderData.error || (lang === 'tr' ? 'Sipariş oluşturulamadı.' : 'Could not create order.'));
                return;
            }

            // Step 2: For credit card, initialize iyzico checkout form
            if (paymentMethod === 'credit_card') {
                const paymentRes = await fetch('/api/payment/init', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        orderId: orderData.orderId,
                        shipping,
                        customerPhone: toE164(shipping.phone),
                    }),
                });
                const paymentData = await paymentRes.json();

                if (!paymentRes.ok || !paymentData.ok) {
                    setOrderError(paymentData.error || (lang === 'tr'
                        ? 'Ödeme sayfası oluşturulamadı.'
                        : 'Could not create payment form.'));
                    return;
                }

                // Show iyzico checkout form
                setIyzicoFormHtml(paymentData.checkoutFormContent);
                setCurrentStep('iyzico_form');
            } else {
                // Bank transfer — go directly to success
                router.push(`/order-success?order=${encodeURIComponent(orderData.orderNumber)}`);
            }
        } catch {
            setOrderError(lang === 'tr' ? 'Bağlantı hatası. Lütfen tekrar deneyin.' : 'Connection error. Please try again.');
        } finally {
            setOrderLoading(false);
        }
    }

    /* ------- Empty cart guard ------- */
    if (cartItems.length === 0 && currentStep !== 'iyzico_form') {
        return (
            <section className="container-vant py-20 text-center">
                <FadeIn>
                    <h1 className="font-heading text-display font-bold uppercase tracking-tight">
                        {t.checkout.title[lang]}
                    </h1>
                    <p className="mt-6 text-vant-muted font-body">{t.cart.empty[lang]}</p>
                    <Link href="/drop" className="btn-primary mt-8 inline-block">
                        {t.cart.continueShopping[lang]}
                    </Link>
                </FadeIn>
            </section>
        );
    }

    /* ------- Input helper ------- */
    const inputCn = 'w-full bg-transparent border border-vant-light/10 px-4 py-3.5 text-base md:text-sm text-vant-light font-body placeholder:text-vant-muted/40 focus:outline-none focus:border-vant-purple transition-colors';
    const labelCn = 'block text-[11px] md:text-xs font-heading uppercase tracking-wider text-vant-muted mb-2';
    const errorCn = 'text-xs text-red-400 mt-1';
    const selectedCountry = SHIPPING_COUNTRIES.find((item) => item.code === shipping.country) ?? null;
    const cityOptions = selectedCountry?.cities ?? [];
    const selectPlaceholder = lang === 'tr' ? 'Seçiniz' : 'Select';
    const displayCity = shipping.city === OTHER_CITY_VALUE ? (lang === 'tr' ? 'Diğer' : 'Other') : shipping.city;

    function shippingField(key: keyof ShippingData, label: string, type = 'text', placeholder = '') {
        return (
            <div>
                <label className={labelCn}>{label}</label>
                <input
                    type={type}
                    value={shipping[key]}
                    onChange={(e) => setShipping({ ...shipping, [key]: e.target.value })}
                    placeholder={placeholder}
                    className={inputCn}
                />
                {errors[key] && <p className={errorCn}>{errors[key]}</p>}
            </div>
        );
    }

    function shippingCountryField() {
        return (
            <div>
                <label className={labelCn}>{lang === 'tr' ? 'Ülke' : 'Country'}</label>
                <select
                    value={shipping.country}
                    onChange={(e) => {
                        const nextCountry = e.target.value;
                        setShipping((prev) => ({ ...prev, country: nextCountry, city: '' }));
                    }}
                    className={inputCn}
                >
                    <option value="">{selectPlaceholder}</option>
                    {SHIPPING_COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code} className="bg-black text-white">
                            {lang === 'tr' ? country.tr : country.en}
                        </option>
                    ))}
                </select>
                {errors.country && <p className={errorCn}>{errors.country}</p>}
            </div>
        );
    }

    function shippingCityField() {
        return (
            <div>
                <label className={labelCn}>{t.checkout.city[lang]}</label>
                <select
                    value={shipping.city}
                    onChange={(e) => setShipping((prev) => ({ ...prev, city: e.target.value }))}
                    className={inputCn}
                    disabled={!shipping.country}
                >
                    <option value="">{selectPlaceholder}</option>
                    {cityOptions.map((city) => (
                        <option key={city} value={city} className="bg-black text-white">
                            {city}
                        </option>
                    ))}
                    {!cityOptions.includes(OTHER_CITY_VALUE) && (
                        <option value={OTHER_CITY_VALUE} className="bg-black text-white">
                            {lang === 'tr' ? 'Diğer' : 'Other'}
                        </option>
                    )}
                </select>
                {errors.city && <p className={errorCn}>{errors.city}</p>}
            </div>
        );
    }

    /* ------- Step indicator ------- */
    const stepLabels: Record<Step, string> = {
        shipping: t.checkout.stepShipping[lang],
        otp: t.checkout.stepOtp[lang],
        consent: t.checkout.stepConsent[lang],
        payment: t.checkout.stepPayment[lang],
        iyzico_form: lang === 'tr' ? 'Ödeme' : 'Pay',
    };

    return (
        <section className="container-vant py-8 md:py-20 pb-24 md:pb-20">
            <FadeIn>
                <h1 className="font-heading text-display font-bold uppercase tracking-tight text-center mb-6 md:mb-8">
                    {t.checkout.title[lang]}
                </h1>
            </FadeIn>

            {/* Mobile progress + total bar */}
            {currentStep !== 'iyzico_form' && (
                <div className="md:hidden sticky top-16 z-20 mb-4">
                    <div className="border border-vant-light/10 bg-vant-black/85 backdrop-blur-sm px-3 py-2.5 rounded-sm">
                        <div className="flex items-center justify-between text-[11px] font-heading uppercase tracking-wider text-vant-muted">
                            <span>
                                {lang === 'tr' ? `Adım ${currentVisibleStepNumber}/${visibleSteps.length}` : `Step ${currentVisibleStepNumber}/${visibleSteps.length}`}
                            </span>
                            <span>{progressPercent}%</span>
                        </div>
                        <div className="mt-2 h-1 w-full bg-vant-light/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-vant-purple transition-all duration-300"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-[11px] font-heading uppercase tracking-wider text-vant-muted">
                                {t.cart.total[lang]}
                            </span>
                            <span className="text-sm font-heading text-vant-light">
                                {formatPrice(payableTotal)}
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Step indicator */}
            {currentStep !== 'iyzico_form' && (
                <FadeIn delay={0.05}>
                    <div className="mb-8 md:mb-12 overflow-x-auto no-scrollbar">
                        <div className="flex items-center justify-start md:justify-center gap-2 min-w-max px-1">
                        {visibleSteps.map((s, i) => (
                            <div key={s} className="flex items-center gap-2">
                                <div className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] md:text-xs font-heading uppercase tracking-wider whitespace-nowrap transition-colors ${i <= stepIndex
                                    ? 'text-vant-purple border border-vant-purple/40'
                                    : 'text-vant-muted/40 border border-vant-light/5'
                                    }`}>
                                    <span className="font-bold">{i + 1}</span>
                                    <span>{stepLabels[s]}</span>
                                </div>
                                {i < visibleSteps.length - 1 && (
                                    <div className={`w-6 h-[1px] ${i < stepIndex ? 'bg-vant-purple' : 'bg-vant-light/10'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                    </div>
                </FadeIn>
            )}

            <div className="max-w-2xl mx-auto">
                {/* =================== STEP 1: SHIPPING =================== */}
                {currentStep === 'shipping' && (
                    <div>
                        <div className="mb-6 md:mb-8 p-4 md:p-6 border border-vant-purple/30 rounded bg-vant-dark/50 text-center">
                            <p className="text-sm text-vant-muted font-body mb-4">
                                {lang === 'tr' ? 'Vakit kaybetmeden devam etmek ister misiniz?' : 'Want to speed up checkout?'}
                            </p>
                            <button
                                onClick={handleGoogleLogin}
                                disabled={isGoogleLoading}
                                className="inline-flex w-full sm:w-auto items-center justify-center gap-3 px-4 md:px-6 py-3 border border-vant-primary/30 rounded-sm hover:border-vant-purple transition-all bg-white text-black font-medium text-sm hover:opacity-90 disabled:opacity-50"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                </svg>
                                {isGoogleLoading ? '...' : (lang === 'tr' ? 'Google ile Hızlı Devam Et' : 'Continue with Google')}
                            </button>
                        </div>
                        
                        <div className="space-y-4 md:space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {shippingField('firstName', t.checkout.firstName[lang])}
                                {shippingField('lastName', t.checkout.lastName[lang])}
                            </div>
                            {shippingField('email', t.checkout.email[lang], 'email')}
                            {shippingField('phone', lang === 'tr' ? 'Telefon (İsteğe Bağlı)' : 'Phone (Optional)', 'tel', t.checkout.phonePlaceholder[lang])}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {shippingCountryField()}
                                {shippingCityField()}
                            </div>
                            <div>
                                <label className={labelCn}>{lang === 'tr' ? 'Adres Detayı' : 'Address Detail'}</label>
                                <textarea
                                    value={shipping.address}
                                    onChange={(e) => setShipping((prev) => ({ ...prev, address: e.target.value }))}
                                    rows={4}
                                    placeholder={lang === 'tr' ? 'Mahalle, cadde/sokak, bina no, daire no vb.' : 'Neighborhood, street, building no, apartment no, etc.'}
                                    className={inputCn}
                                />
                                {errors.address && <p className={errorCn}>{errors.address}</p>}
                            </div>
                            <div className="pt-3 md:pt-4 sticky bottom-0 bg-vant-black/90 backdrop-blur-sm -mx-3 px-3 py-3 md:static md:bg-transparent md:backdrop-blur-0 md:mx-0 md:px-0 md:py-0">
                                <button onClick={goNext} className="btn-primary w-full">
                                    {t.checkout.next[lang]}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* =================== STEP 2: OTP =================== */}
                {currentStep === 'otp' && (
                    <div>
                        <div className="space-y-6 text-center">
                            <p className="text-sm text-vant-muted font-body">
                                {lang === 'tr' ? 'Lütfen e-posta adresinizi doğrulayın' : 'Please verify your email address'}
                            </p>
                            <p className="font-heading text-lg text-vant-light">
                                {shipping.email}
                            </p>

                            {!otpSent ? (
                                <button
                                    onClick={handleSendOtp}
                                    disabled={otpLoading}
                                    className="btn-primary mx-auto disabled:opacity-50"
                                >
                                    {otpLoading ? '...' : t.otp.sendCode[lang]}
                                </button>
                            ) : !otpVerified ? (
                                <div className="space-y-4">
                                    <div className="max-w-xs mx-auto">
                                        <label className={labelCn}>{t.otp.enterCode[lang]}</label>
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={6}
                                            value={otpCode}
                                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                                            className={`${inputCn} text-center text-2xl tracking-[0.5em] font-heading`}
                                            placeholder="______"
                                        />
                                    </div>
                                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                                        <button
                                            onClick={handleVerifyOtp}
                                            disabled={otpLoading || otpCode.length < 6}
                                            className="btn-primary w-full sm:w-auto disabled:opacity-50"
                                        >
                                            {otpLoading ? '...' : t.otp.verify[lang]}
                                        </button>
                                        <button
                                            onClick={handleSendOtp}
                                            disabled={otpLoading}
                                            className="text-xs font-heading uppercase tracking-wider text-vant-muted hover:text-vant-purple transition-colors disabled:opacity-50"
                                        >
                                            {t.otp.resend[lang]}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2 text-green-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-heading uppercase tracking-wider">{t.otp.verified[lang]}</span>
                                </div>
                            )}

                            {otpMessage && !otpVerified && (
                                <p className={`text-sm ${otpMessage === t.otp.codeSent[lang] ? 'text-green-400' : 'text-red-400'}`}>
                                    {otpMessage}
                                </p>
                            )}

                            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
                                <button onClick={goBack} className="btn-secondary w-full sm:w-auto">
                                    {t.checkout.back[lang]}
                                </button>
                                <button
                                    onClick={goNext}
                                    disabled={!otpVerified}
                                    className="btn-primary w-full sm:w-auto disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    {t.checkout.next[lang]}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* =================== STEP 3: CONSENT =================== */}
                {currentStep === 'consent' && (
                    <div>
                        <div className="space-y-6">
                            {/* Transactional note (NOT a checkbox) */}
                            <div className="p-4 border border-vant-light/10 bg-vant-gray/20">
                                <p className="text-sm text-vant-muted font-body leading-relaxed">
                                    {t.consent.transactionalNote[lang]}
                                </p>
                            </div>

                            {/* Marketing consents — separate checkboxes, default OFF */}
                            <div className="space-y-3">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={consent.marketingSms}
                                        onChange={(e) => setConsent({ ...consent, marketingSms: e.target.checked })}
                                        className="mt-1 w-4 h-4 accent-vant-purple cursor-pointer"
                                    />
                                    <span className="text-sm text-vant-light font-body group-hover:text-vant-purple transition-colors">
                                        {t.consent.marketingSms[lang]}
                                    </span>
                                </label>

                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={consent.marketingEmail}
                                        onChange={(e) => setConsent({ ...consent, marketingEmail: e.target.checked })}
                                        className="mt-1 w-4 h-4 accent-vant-purple cursor-pointer"
                                    />
                                    <span className="text-sm text-vant-light font-body group-hover:text-vant-purple transition-colors">
                                        {t.consent.marketingEmail[lang]}
                                    </span>
                                </label>

                                <p className="text-xs text-vant-muted/60 font-body italic pl-7">
                                    {t.consent.optOutNote[lang]}
                                </p>
                            </div>

                            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
                                <button onClick={goBack} className="btn-secondary w-full sm:w-auto">
                                    {t.checkout.back[lang]}
                                </button>
                                <button onClick={goNext} className="btn-primary w-full sm:w-auto">
                                    {t.checkout.next[lang]}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* =================== STEP 4: PAYMENT =================== */}
                {currentStep === 'payment' && (
                    <div>
                        <div className="space-y-8">
                            {/* Order summary */}
                            <div>
                                <h2 className="font-heading text-sm uppercase tracking-wider text-vant-muted mb-4">
                                    {t.payment.orderSummary[lang]}
                                </h2>
                                <div className="space-y-3">
                                    {cartItems.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3 p-3 border border-vant-light/5">
                                            <div className="relative w-12 h-14 flex-shrink-0 bg-vant-gray overflow-hidden">
                                                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-heading text-xs uppercase tracking-wider text-vant-light">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-vant-muted">
                                                    {item.size} {item.color && item.color !== 'Standart' && `| ${item.color}`} × {item.quantity}
                                                </p>
                                            </div>
                                            <span className="text-sm text-vant-light font-heading">
                                                {formatPrice(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Shipping info summary */}
                                <div className="mt-4 p-3 border border-vant-light/5 bg-vant-gray/20">
                                    <p className="text-xs font-heading uppercase tracking-wider text-vant-muted mb-2">
                                        {lang === 'tr' ? 'Teslimat Adresi' : 'Delivery Address'}
                                    </p>
                                    <p className="text-sm text-vant-light/80 font-body">
                                        {shipping.firstName} {shipping.lastName}<br />
                                        {shipping.address}<br />
                                        {displayCity}
                                        {selectedCountry ? `, ${lang === 'tr' ? selectedCountry.tr : selectedCountry.en}` : ''}
                                    </p>
                                </div>

                                <div className="mt-4 pt-4 border-t border-vant-light/5 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="font-heading text-xs uppercase tracking-wider text-vant-muted">
                                            {lang === 'tr' ? 'Ara Toplam' : 'Subtotal'}
                                        </span>
                                        <span className="text-sm text-vant-light">
                                            {formatPrice(cartTotal)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="font-heading text-xs uppercase tracking-wider text-vant-muted">
                                            {lang === 'tr' ? 'Kargo' : 'Shipping'}
                                        </span>
                                        <span className="text-sm text-vant-light">
                                            {shippingLoading
                                                ? (lang === 'tr' ? 'Hesaplaniyor...' : 'Calculating...')
                                                : formatPrice(shippingTotal)}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-vant-light/10">
                                        <span className="font-heading text-sm uppercase tracking-wider text-vant-muted">
                                            {t.cart.total[lang]}
                                        </span>
                                        <span className="font-heading text-xl text-vant-light">
                                            {formatPrice(payableTotal)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment method selection */}
                            <div>
                                <h2 className="font-heading text-sm uppercase tracking-wider text-vant-muted mb-4">
                                    {lang === 'tr' ? 'Ödeme Yöntemi' : 'Payment Method'}
                                </h2>
                                <div className="space-y-3">

                                    <label
                                        className={`flex items-start gap-3 p-4 border cursor-pointer transition-all duration-300 ${paymentMethod === 'bank_transfer'
                                            ? 'border-vant-purple bg-vant-purple/5'
                                            : 'border-vant-light/10 hover:border-vant-light/30'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="bank_transfer"
                                            checked={paymentMethod === 'bank_transfer'}
                                            onChange={() => setPaymentMethod('bank_transfer')}
                                            className="mt-1 accent-vant-purple"
                                        />
                                        <div>
                                            <p className="font-heading text-sm uppercase tracking-wider text-vant-light">
                                                {lang === 'tr' ? 'Havale / EFT' : 'Bank Transfer'}
                                            </p>
                                            <p className="text-xs text-vant-muted mt-1 font-body">
                                                {lang === 'tr'
                                                    ? 'Sipariş sonrası banka hesap bilgileri paylaşılacaktır.'
                                                    : 'Bank account details will be shared after order placement.'}
                                            </p>
                                        </div>
                                    </label>

                                    <label
                                        className={`flex items-start gap-3 p-4 border cursor-pointer transition-all duration-300 ${paymentMethod === 'credit_card'
                                            ? 'border-vant-purple bg-vant-purple/5'
                                            : 'border-vant-light/10 hover:border-vant-light/30'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="credit_card"
                                            checked={paymentMethod === 'credit_card'}
                                            onChange={() => setPaymentMethod('credit_card')}
                                            className="mt-1 accent-vant-purple"
                                        />
                                        <div>
                                            <p className="font-heading text-sm uppercase tracking-wider text-vant-light">
                                                {lang === 'tr' ? 'Kredi / Banka Kartı' : 'Credit / Debit Card'}
                                            </p>
                                            <p className="text-xs text-vant-muted mt-1 font-body">
                                                {lang === 'tr'
                                                    ? 'iyzico güvencesiyle güvenli online ödeme. Taksit imkânı.'
                                                    : 'Secure online payment via iyzico. Installment options available.'}
                                            </p>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Bank transfer info (show only when bank_transfer selected) */}
                            {paymentMethod === 'bank_transfer' && (
                                <div className="p-4 border border-vant-purple/20 bg-vant-purple/5">
                                    <p className="text-xs font-heading uppercase tracking-wider text-vant-purple mb-3">
                                        {lang === 'tr' ? 'Hesap Bilgileri' : 'Bank Details'}
                                    </p>
                                    <div className="space-y-1 text-sm text-vant-light/80 font-body">
                                        <p><strong>Banka:</strong> Ziraat Bankası</p>
                                        <p><strong>IBAN:</strong> TR00 0000 0000 0000 0000 0000 00</p>
                                        <p><strong>Hesap Sahibi:</strong> VANT Art</p>
                                    </div>
                                    <p className="mt-3 text-xs text-vant-muted font-body italic">
                                        {lang === 'tr'
                                            ? 'Açıklama kısmına sipariş numaranızı yazmayı unutmayın.'
                                            : 'Please include your order number in the transfer description.'}
                                    </p>
                                </div>
                            )}

                            {/* iyzico secure payment info */}
                            {paymentMethod === 'credit_card' && (
                                <div className="p-4 border border-vant-purple/20 bg-vant-purple/5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-vant-purple">
                                            <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-sm font-heading uppercase tracking-wider text-vant-purple">
                                            {lang === 'tr' ? 'Güvenli Ödeme' : 'Secure Payment'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-vant-muted font-body">
                                        {lang === 'tr'
                                            ? 'iyzico güvencesiyle güvenli ödeme. Taksit seçenekleri bir sonraki adımda gösterilecektir.'
                                            : 'Secure payment powered by iyzico. Installment options will be shown in the next step.'}
                                    </p>
                                </div>
                            )}

                            {/* Shipping status */}
                            <div className={`flex items-center gap-3 p-3 border ${selectedShippingRate ? 'border-green-500/20 bg-green-500/5' : 'border-yellow-500/20 bg-yellow-500/5'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 flex-shrink-0 ${selectedShippingRate ? 'text-green-400' : 'text-yellow-400'}`}>
                                    <path d="M1.5 3.75A2.25 2.25 0 013.75 1.5h9A2.25 2.25 0 0115 3.75v9A2.25 2.25 0 0112.75 15H9.258a3.75 3.75 0 11-7.016 0H1.5V3.75zM3.75 15a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM15.75 6a.75.75 0 01.75-.75h2.379a2.25 2.25 0 011.59.659l1.372 1.371c.422.422.659.995.659 1.591V15a.75.75 0 01-.75.75h-1.516a3.75 3.75 0 00-7.016 0H12a.75.75 0 01-.75-.75V6.75z" />
                                    <path fillRule="evenodd" d="M5.375 16.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm0-1.5a.75.75 0 100-1.5.75.75 0 000 1.5zM15.375 16.5a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm0-1.5a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                                </svg>
                                <div className="text-sm font-body">
                                    {shippingLoading && (lang === 'tr' ? 'Kargo hesaplanıyor...' : 'Calculating shipping...')}
                                    {!shippingLoading && selectedShippingRate && (
                                        <>
                                            <span className="text-green-400 font-heading uppercase tracking-wider">
                                                {selectedShippingRate.carrierName}
                                            </span>
                                            <span className="text-vant-light/80">
                                                {' · '}{formatPrice(shippingTotal)}
                                                {selectedShippingRate.estimatedDays ? ` · ${selectedShippingRate.estimatedDays}` : ''}
                                            </span>
                                        </>
                                    )}
                                    {!shippingLoading && !selectedShippingRate && (
                                        <span className="text-yellow-400">
                                            {shippingError || (lang === 'tr' ? 'Kargo secenegi bulunamadi.' : 'Shipping option unavailable.')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Legal agreement */}
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={agreementAccepted}
                                    onChange={(e) => setAgreementAccepted(e.target.checked)}
                                    className="mt-1 w-4 h-4 accent-vant-purple cursor-pointer"
                                />
                                <span className="text-sm text-vant-light/80 font-body group-hover:text-vant-purple transition-colors">
                                    {lang === 'tr' ? (
                                        <>
                                            <Link href="/preliminary-info" target="_blank" className="text-vant-purple underline">
                                                Ön Bilgilendirme Formu
                                            </Link>
                                            {' ve '}
                                            <Link href="/distance-sales" target="_blank" className="text-vant-purple underline">
                                                Mesafeli Satış Sözleşmesi
                                            </Link>
                                            {`'ni okudum ve kabul ediyorum.`}
                                        </>
                                    ) : (
                                        <>
                                            I have read and accept the{' '}
                                            <Link href="/preliminary-info" target="_blank" className="text-vant-purple underline">
                                                Preliminary Information Form
                                            </Link>
                                            {' and '}
                                            <Link href="/distance-sales" target="_blank" className="text-vant-purple underline">
                                                Distance Sales Agreement
                                            </Link>
                                            .
                                        </>
                                    )}
                                </span>
                            </label>

                            {/* Order error */}
                            {orderError && (
                                <div className="p-3 border border-red-400/30 bg-red-400/5">
                                    <p className="text-sm text-red-400 font-body">{orderError}</p>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
                                <button onClick={goBack} className="btn-secondary w-full sm:w-auto">
                                    {t.checkout.back[lang]}
                                </button>
                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={!agreementAccepted || orderLoading || shippingLoading || !selectedShippingRate}
                                    className="btn-primary w-full sm:w-auto disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    {orderLoading
                                        ? (lang === 'tr' ? 'İşleniyor...' : 'Processing...')
                                        : paymentMethod === 'credit_card'
                                            ? (lang === 'tr' ? 'Ödemeye Geç' : 'Proceed to Payment')
                                            : (lang === 'tr' ? 'Siparişi Tamamla' : 'Place Order')
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* =================== STEP 5: IYZICO FORM =================== */}
                {currentStep === 'iyzico_form' && (
                    <div>
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="text-center">
                                <div className="flex items-center justify-center gap-2 mb-3">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-vant-purple">
                                        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                                    </svg>
                                    <h2 className="font-heading text-lg uppercase tracking-wider text-vant-purple">
                                        {lang === 'tr' ? 'Güvenli Ödeme' : 'Secure Payment'}
                                    </h2>
                                </div>
                                <p className="text-xs text-vant-muted font-body">
                                    {lang === 'tr'
                                        ? 'Kart bilgileriniz iyzico tarafından güvenle işlenmektedir.'
                                        : 'Your card details are securely processed by iyzico.'}
                                </p>
                            </div>

                            {/* iyzico checkout form container */}
                            <div
                                ref={iyzicoFormRef}
                                id="iyzipay-checkout-form"
                                className="iyzico-form-container min-h-[400px] bg-white rounded-lg overflow-hidden"
                            />

                            {/* Back button */}
                            <div className="pt-4">
                                <button onClick={goBack} className="btn-secondary w-full sm:w-auto">
                                    {lang === 'tr' ? '← Geri Dön' : '← Go Back'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}



