'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';

export default function NewsletterForm() {
    const { lang, t } = useLanguage();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidEmail(email)) {
            setStatus('error');
            return;
        }
        // Wire to Mailchimp / ConvertKit / Formspree later
        setStatus('success');
        setEmail('');
        setTimeout(() => setStatus('idle'), 4000);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') setStatus('idle');
                    }}
                    placeholder={t.newsletter.placeholder[lang]}
                    className="input-vant flex-1"
                    aria-label="Email"
                />
                <button type="submit" className="btn-primary whitespace-nowrap">
                    {t.newsletter.button[lang]}
                </button>
            </div>
            {status === 'success' && (
                <p className="mt-3 text-xs text-vant-purple">{t.newsletter.success[lang]}</p>
            )}
            {status === 'error' && (
                <p className="mt-3 text-xs text-red-400">{t.newsletter.error[lang]}</p>
            )}
        </form>
    );
}
