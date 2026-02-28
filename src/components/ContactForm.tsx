'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n';

export default function ContactForm() {
    const { lang, t } = useLanguage();
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitted, setSubmitted] = useState(false);

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!form.name.trim()) newErrors.name = t.contact.errorName[lang];
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = t.contact.errorEmail[lang];
        if (!form.message.trim()) newErrors.message = t.contact.errorMessage[lang];
        return newErrors;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        // Integration note:
        // Replace the form action with Formspree: action="https://formspree.io/f/YOUR_FORM_ID" method="POST"
        // Or add Netlify: data-netlify="true" name="contact" on the form element
        setSubmitted(true);
        setForm({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
    };

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-5" noValidate>
            <div>
                <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={t.contact.name[lang]}
                    className="input-vant"
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
            </div>
            <div>
                <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={t.contact.email[lang]}
                    className="input-vant"
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>
            <div>
                <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={t.contact.message[lang]}
                    rows={5}
                    className="input-vant resize-none"
                />
                {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
            </div>
            <button type="submit" className="btn-primary w-full">
                {t.contact.send[lang]}
            </button>
            {submitted && (
                <p className="text-sm text-vant-purple">{t.contact.success[lang]}</p>
            )}
        </form>
    );
}
