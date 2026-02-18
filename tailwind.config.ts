import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                vant: {
                    black: '#0A0A0A',
                    dark: '#111111',
                    gray: '#1A1A1A',
                    muted: '#888888',
                    light: '#F5F5F0',
                    white: '#FAFAFA',
                    purple: '#8B5CF6',
                    'purple-dark': '#7C3AED',
                    'purple-light': '#A78BFA',
                },
            },
            fontFamily: {
                heading: ['Oswald', 'sans-serif'],
                body: ['Inter', 'sans-serif'],
            },
            fontSize: {
                'hero': ['clamp(3rem, 8vw, 7rem)', { lineHeight: '0.95', letterSpacing: '-0.02em' }],
                'display': ['clamp(2rem, 5vw, 4rem)', { lineHeight: '1.05', letterSpacing: '-0.01em' }],
                'title': ['clamp(1.5rem, 3vw, 2.5rem)', { lineHeight: '1.1' }],
            },
            spacing: {
                '18': '4.5rem',
                '22': '5.5rem',
                '26': '6.5rem',
                '30': '7.5rem',
            },
            animation: {
                'gradient': 'gradient 8s ease infinite',
                'grain': 'grain 0.5s steps(1) infinite',
            },
            keyframes: {
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
                grain: {
                    '0%': { transform: 'translate(0, 0)' },
                    '10%': { transform: 'translate(-5%, -10%)' },
                    '20%': { transform: 'translate(-15%, 5%)' },
                    '30%': { transform: 'translate(7%, -25%)' },
                    '40%': { transform: 'translate(-5%, 25%)' },
                    '50%': { transform: 'translate(-15%, 10%)' },
                    '60%': { transform: 'translate(15%, 0%)' },
                    '70%': { transform: 'translate(0%, 15%)' },
                    '80%': { transform: 'translate(3%, 35%)' },
                    '90%': { transform: 'translate(-10%, 10%)' },
                    '100%': { transform: 'translate(0, 0)' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
