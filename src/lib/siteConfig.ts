const DEFAULT_SITE_URL = 'https://www.vantonline.com';

const warnedMessages = new Set<string>();

function warnOnce(key: string, message: string) {
    if (warnedMessages.has(key)) return;
    warnedMessages.add(key);
    console.warn(message);
}

function normalizeUrl(value: string | undefined): string | null {
    if (typeof value !== 'string') return null;

    const trimmed = value.trim();
    if (!trimmed) return null;

    return trimmed.replace(/\/+$/, '');
}

function ensureValidUrl(value: string, source: string): string {
    try {
        return new URL(value).toString().replace(/\/+$/, '');
    } catch {
        warnOnce(`invalid:${source}`, `[site-config] Invalid ${source} value "${value}". Falling back to ${DEFAULT_SITE_URL}.`);
        return DEFAULT_SITE_URL;
    }
}

export function getCanonicalSiteUrl(): string {
    const primaryUrl = normalizeUrl(process.env.NEXT_PUBLIC_SITE_URL);
    if (primaryUrl) {
        return ensureValidUrl(primaryUrl, 'NEXT_PUBLIC_SITE_URL');
    }

    const legacyUrl = normalizeUrl(process.env.NEXT_PUBLIC_BASE_URL) ?? normalizeUrl(process.env.APP_BASE_URL);
    if (legacyUrl) {
        warnOnce(
            'legacy-site-url',
            '[site-config] Using deprecated NEXT_PUBLIC_BASE_URL / APP_BASE_URL fallback. Set NEXT_PUBLIC_SITE_URL in all environments.',
        );
        return ensureValidUrl(legacyUrl, 'legacy site URL');
    }

    return DEFAULT_SITE_URL;
}
