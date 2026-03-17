declare module 'iyzipay' {
    interface IyzipayConfig {
        apiKey: string;
        secretKey: string;
        uri: string;
    }

    interface CheckoutFormInitializeRequest {
        locale?: string;
        conversationId?: string;
        price: string;
        paidPrice: string;
        currency: string;
        basketId?: string;
        paymentGroup?: string;
        callbackUrl: string;
        buyer: Record<string, unknown>;
        shippingAddress: Record<string, unknown>;
        billingAddress: Record<string, unknown>;
        basketItems: Array<Record<string, unknown>>;
        enabledInstallments?: number[];
    }

    interface CheckoutFormRetrieveRequest {
        locale?: string;
        conversationId?: string;
        token: string;
    }

    class Iyzipay {
        constructor(config: IyzipayConfig);
        checkoutFormInitialize: {
            create: (
                request: CheckoutFormInitializeRequest,
                callback: (err: Error | null, result: Record<string, unknown>) => void,
            ) => void;
        };
        checkoutForm: {
            retrieve: (
                request: CheckoutFormRetrieveRequest,
                callback: (err: Error | null, result: Record<string, unknown>) => void,
            ) => void;
        };

        static LOCALE: { TR: string; EN: string };
        static CURRENCY: { TRY: string; USD: string; EUR: string; GBP: string };
        static PAYMENT_GROUP: { PRODUCT: string; LISTING: string; SUBSCRIPTION: string };
        static BASKET_ITEM_TYPE: { PHYSICAL: string; VIRTUAL: string };
    }

    export = Iyzipay;
}
