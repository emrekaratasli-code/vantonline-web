'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
    address: string;
    city: string;
    district: string;
    postalCode: string;
}

interface ConsentData {
    marketingSms: boolean;
    marketingEmail: boolean;
}

type Step = 'shipping' | 'otp' | 'consent' | 'payment';

const STEPS: Step[] = ['shipping', 'otp', 'consent', 'payment'];

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

    const [currentStep, setCurrentStep] = useState<Step>('shipping');
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Shipping
    const [shipping, setShipping] = useState<ShippingData>({
        firstName: '', lastName: '', email: '', phone: '',
        address: '', city: '', district: '', postalCode: '',
    });

    // OTP
    const [otpSent, setOtpSent] = useState(false);
    const [otpCode, setOtpCode] = useState('');
    const [otpVerified, setOtpVerified] = useState(false);
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpMessage, setOtpMessage] = useState('');

    // Consent
    const [consent, setConsent] = useState<ConsentData>({ marketingSms: false, marketingEmail: false });

    /** Format kuruş → TRY */
    const formatPrice = (kuruş: number) =>
        `${t.product.currency[lang]}${(kuruş / 100).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

    /* ------- step index ------- */
    const stepIndex = STEPS.indexOf(currentStep);

    /* ------- validation ------- */
    function validateShipping(): boolean {
        const e: Record<string, string> = {};
        if (!shipping.firstName.trim()) e.firstName = t.checkout.required[lang];
        if (!shipping.lastName.trim()) e.lastName = t.checkout.required[lang];
        if (shipping.email.trim() && !isValidEmail(shipping.email)) e.email = t.checkout.invalidEmail[lang];
        if (!shipping.phone.trim()) e.phone = t.checkout.required[lang];
        else if (!isValidPhone(shipping.phone)) e.phone = t.checkout.invalidPhone[lang];
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
                body: JSON.stringify({ phone: toE164(shipping.phone) }),
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
                    phone: toE164(shipping.phone),
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
        const nextIdx = stepIndex + 1;
        if (nextIdx < STEPS.length) setCurrentStep(STEPS[nextIdx]);
    }

    function goBack() {
        const prevIdx = stepIndex - 1;
        if (prevIdx >= 0) setCurrentStep(STEPS[prevIdx]);
    }

    /* ------- Empty cart guard ------- */
    if (cartItems.length === 0) {
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
    const inputCn = 'w-full bg-transparent border border-vant-light/10 px-4 py-3 text-sm text-vant-light font-body placeholder:text-vant-muted/40 focus:outline-none focus:border-vant-purple transition-colors';
    const labelCn = 'block text-xs font-heading uppercase tracking-wider text-vant-muted mb-2';
    const errorCn = 'text-xs text-red-400 mt-1';

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

    /* ------- Step indicator ------- */
    const stepLabels: Record<Step, string> = {
        shipping: t.checkout.stepShipping[lang],
        otp: t.checkout.stepOtp[lang],
        consent: t.checkout.stepConsent[lang],
        payment: t.checkout.stepPayment[lang],
    };

    return (
        <section className="container-vant py-12 md:py-20">
            <FadeIn>
                <h1 className="font-heading text-display font-bold uppercase tracking-tight text-center mb-8">
                    {t.checkout.title[lang]}
                </h1>
            </FadeIn>

            {/* Step indicator */}
            <FadeIn delay={0.05}>
                <div className="flex items-center justify-center gap-2 mb-12 flex-wrap">
                    {STEPS.map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-heading uppercase tracking-wider transition-colors ${i <= stepIndex
                                ? 'text-vant-purple border border-vant-purple/40'
                                : 'text-vant-muted/40 border border-vant-light/5'
                                }`}>
                                <span className="font-bold">{i + 1}</span>
                                <span className="hidden sm:inline">{stepLabels[s]}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`w-6 h-[1px] ${i < stepIndex ? 'bg-vant-purple' : 'bg-vant-light/10'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </FadeIn>

            <div className="max-w-2xl mx-auto">
                {/* =================== STEP 1: SHIPPING =================== */}
                {currentStep === 'shipping' && (
                    <FadeIn>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {shippingField('firstName', t.checkout.firstName[lang])}
                                {shippingField('lastName', t.checkout.lastName[lang])}
                            </div>
                            {shippingField('email', t.checkout.email[lang], 'email')}
                            {shippingField('phone', t.checkout.phone[lang], 'tel', t.checkout.phonePlaceholder[lang])}
                            {shippingField('address', t.checkout.address[lang])}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {shippingField('city', t.checkout.city[lang])}
                                {shippingField('district', t.checkout.district[lang])}
                                {shippingField('postalCode', t.checkout.postalCode[lang])}
                            </div>
                            <div className="pt-4">
                                <button onClick={goNext} className="btn-primary w-full">
                                    {t.checkout.next[lang]}
                                </button>
                            </div>
                        </div>
                    </FadeIn>
                )}

                {/* =================== STEP 2: OTP =================== */}
                {currentStep === 'otp' && (
                    <FadeIn>
                        <div className="space-y-6 text-center">
                            <p className="text-sm text-vant-muted font-body">
                                {t.otp.enterPhone[lang]}
                            </p>
                            <p className="font-heading text-lg text-vant-light">
                                {toE164(shipping.phone)}
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
                                    <div className="flex items-center justify-center gap-4">
                                        <button
                                            onClick={handleVerifyOtp}
                                            disabled={otpLoading || otpCode.length < 6}
                                            className="btn-primary disabled:opacity-50"
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

                            <div className="flex items-center justify-between pt-4">
                                <button onClick={goBack} className="btn-secondary">
                                    {t.checkout.back[lang]}
                                </button>
                                <button
                                    onClick={goNext}
                                    disabled={!otpVerified}
                                    className="btn-primary disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    {t.checkout.next[lang]}
                                </button>
                            </div>
                        </div>
                    </FadeIn>
                )}

                {/* =================== STEP 3: CONSENT =================== */}
                {currentStep === 'consent' && (
                    <FadeIn>
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

                            <div className="flex items-center justify-between pt-4">
                                <button onClick={goBack} className="btn-secondary">
                                    {t.checkout.back[lang]}
                                </button>
                                <button onClick={goNext} className="btn-primary">
                                    {t.checkout.next[lang]}
                                </button>
                            </div>
                        </div>
                    </FadeIn>
                )}

                {/* =================== STEP 4: PAYMENT (COMING SOON) =================== */}
                {currentStep === 'payment' && (
                    <FadeIn>
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
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-vant-light/5">
                                    <span className="font-heading text-sm uppercase tracking-wider text-vant-muted">
                                        {t.cart.total[lang]}
                                    </span>
                                    <span className="font-heading text-xl text-vant-light">
                                        {formatPrice(cartTotal)}
                                    </span>
                                </div>
                            </div>

                            {/* Coming Soon */}
                            <div className="p-6 border border-vant-purple/20 bg-vant-purple/5 text-center">
                                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-vant-purple/10 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-6 h-6 text-vant-purple">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="font-heading text-lg uppercase tracking-wider text-vant-purple mb-2">
                                    {t.payment.comingSoon[lang]}
                                </h3>
                                <p className="text-sm text-vant-muted font-body leading-relaxed max-w-md mx-auto">
                                    {t.payment.comingSoonMsg[lang]}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <button onClick={goBack} className="btn-secondary">
                                    {t.checkout.back[lang]}
                                </button>
                                <Link href="/drop" className="btn-primary">
                                    {t.cart.continueShopping[lang]}
                                </Link>
                            </div>
                        </div>
                    </FadeIn>
                )}
            </div>
        </section>
    );
}
