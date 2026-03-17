import Iyzipay from 'iyzipay';

/* ------------------------------------------------------------------ */
/*  iyzico client — singleton for server-side use                      */
/*  Uses sandbox credentials by default for testing                    */
/* ------------------------------------------------------------------ */

let iyzipayInstance: Iyzipay | null = null;

export function getIyzipay(): Iyzipay {
    if (iyzipayInstance) return iyzipayInstance;

    const apiKey = process.env.IYZICO_API_KEY;
    const secretKey = process.env.IYZICO_SECRET_KEY;
    const uri = process.env.IYZICO_BASE_URL || 'https://sandbox-api.iyzipay.com';

    if (!apiKey || !secretKey) {
        throw new Error('[iyzico] API key or secret key missing. Check IYZICO_API_KEY and IYZICO_SECRET_KEY env vars.');
    }

    iyzipayInstance = new Iyzipay({
        apiKey,
        secretKey,
        uri,
    });

    return iyzipayInstance;
}

/* ------------------------------------------------------------------ */
/*  Type helpers                                                       */
/* ------------------------------------------------------------------ */
export interface IyzicoResult {
    status: string;
    errorCode?: string;
    errorMessage?: string;
    errorGroup?: string;
    locale?: string;
    systemTime?: number;
    conversationId?: string;
    [key: string]: unknown;
}
