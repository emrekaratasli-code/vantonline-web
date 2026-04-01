'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';

export default function ContactForm() {
    const { lang, t } = useLanguage();
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) newErrors.name = t.contact.errorName[lang];
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = t.contact.errorEmail[lang];
        if (!form.message.trim()) newErrors.message = t.contact.errorMessage[lang];
        return newErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        setStatus('submitting');

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...form,
                    company: '',
                }),
            });
            const payload = await response.json().catch(() => null);

            if (!response.ok || payload?.ok === false) {
                setStatus('error');
                return;
            }

            if (payload?.notificationSent === false) {
                console.warn('[contact-form] Message saved, but notification email was not sent.');
            }

            setStatus('success');
            setForm({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('[contact-form] submit error:', error);
            setStatus('error');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-5" noValidate>
            <input
                type="text"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
            />
            <div>
                <input
                    type="text"
                    value={form.name}
                    onChange={(e) => {
                        setForm({ ...form, name: e.target.value });
                        if (status !== 'idle') setStatus('idle');
                    }}
                    placeholder={t.contact.name[lang]}
                    className="input-vant"
                    disabled={status === 'submitting'}
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>
            <div>
                <input
                    type="email"
                    value={form.email}
                    onChange={(e) => {
                        setForm({ ...form, email: e.target.value });
                        if (status !== 'idle') setStatus('idle');
                    }}
                    placeholder={t.contact.email[lang]}
                    className="input-vant"
                    disabled={status === 'submitting'}
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>
            <div>
                <textarea
                    value={form.message}
                    onChange={(e) => {
                        setForm({ ...form, message: e.target.value });
                        if (status !== 'idle') setStatus('idle');
                    }}
                    placeholder={t.contact.message[lang]}
                    rows={5}
                    className="input-vant resize-none"
                    disabled={status === 'submitting'}
                />
                {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
            </div>
            <button type="submit" className="btn-primary w-full" disabled={status === 'submitting'}>
                {status === 'submitting' ? t.contact.sending[lang] : t.contact.send[lang]}
            </button>
            {status === 'success' && (
                <p className="text-sm text-vant-purple">{t.contact.success[lang]}</p>
            )}
            {status === 'error' && (
                <p className="text-sm text-red-400">{t.contact.errorSubmit[lang]}</p>
            )}
        </form>
    );
}
