'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { createBrowserSupabaseClient } from '@/lib/supabase';

export default function NewsletterForm() {
    const { lang, t } = useLanguage();
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'duplicate' | 'loading'>('idle');

    const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValidEmail(email)) {
            setStatus('error');
            return;
        }

        setStatus('loading');

        try {
            const supabase = createBrowserSupabaseClient();
            if (!supabase) {
                setStatus('error');
                return;
            }

            const { error } = await supabase
                .from('customers')
                .insert({ email: email.toLowerCase().trim() });

            if (error) {
                // Unique constraint violation = already subscribed
                if (error.code === '23505') {
                    setStatus('duplicate');
                } else {
                    console.error('[newsletter] Supabase error:', error.message);
                    setStatus('error');
                }
            } else {
                setStatus('success');
                setEmail('');
            }
        } catch (err) {
            console.error('[newsletter] unexpected error:', err);
            setStatus('error');
        }

        setTimeout(() => setStatus('idle'), 5000);
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
                    disabled={status === 'loading'}
                />
                <button
                    type="submit"
                    className="btn-primary whitespace-nowrap"
                    disabled={status === 'loading'}
                >
                    {status === 'loading'
                        ? (lang === 'tr' ? 'Kaydediliyor...' : 'Saving...')
                        : t.newsletter.button[lang]
                    }
                </button>
            </div>
            {status === 'success' && (
                <p className="mt-3 text-xs text-vant-purple">{t.newsletter.success[lang]}</p>
            )}
            {status === 'duplicate' && (
                <p className="mt-3 text-xs text-vant-purple">
                    {lang === 'tr' ? '✓ Bu e-posta zaten kayıtlı.' : '✓ This email is already subscribed.'}
                </p>
            )}
            {status === 'error' && (
                <p className="mt-3 text-xs text-red-400">{t.newsletter.error[lang]}</p>
            )}
        </form>
    );
}
