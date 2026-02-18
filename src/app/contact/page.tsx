'use client';

import { useLanguage } from '@/lib/i18n';
import ContactForm from '@/components/ContactForm';
import FadeIn from '@/components/FadeIn';

export default function ContactPage() {
    const { lang, t } = useLanguage();

    return (
        <section className="container-vant py-12 md:py-20">
            <FadeIn>
                <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="font-heading text-display font-bold uppercase tracking-tight">
                            {t.contact.title[lang]}
                        </h1>
                        <p className="mt-4 text-sm text-vant-muted">
                            {t.contact.subtitle[lang]}
                        </p>
                    </div>

                    <ContactForm />

                    {/* Integration note (dev only) */}
                    {/* 
            Integration options:
            1. Formspree: Change <form> action to "https://formspree.io/f/YOUR_FORM_ID" and method="POST"
            2. Netlify Forms: Add data-netlify="true" and name="contact" to the <form> element
            3. Custom: Wire handleSubmit to your API endpoint
          */}

                    <div className="mt-16 text-center">
                        <p className="text-xs text-vant-muted/60">
                            {lang === 'tr' ? 'veya doğrudan e-posta gönderin:' : 'or send an email directly:'}
                        </p>
                        <a
                            href="mailto:info@vant.com.tr"
                            className="mt-2 inline-block text-sm text-vant-purple hover:text-vant-purple-light transition-colors"
                        >
                            info@vant.com.tr
                        </a>
                    </div>
                </div>
            </FadeIn>
        </section>
    );
}
