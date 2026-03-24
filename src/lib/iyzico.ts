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
    // Default to Live if keys are present, unless IYZICO_BASE_URL explicitly points to sandbox
    const uri = process.env.IYZICO_BASE_URL || 'https://api.iyzipay.com';

    if (!apiKey || !secretKey) {
        // Fallback to sandbox only if keys are missing (for dev)
        return new Iyzipay({
            apiKey: 'sandbox-key',
            secretKey: 'sandbox-secret',
            uri: 'https://sandbox-api.iyzipay.com'
        });
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
