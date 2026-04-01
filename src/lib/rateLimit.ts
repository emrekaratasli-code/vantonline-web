type UpstashConfig = {
    restUrl: string;
    restToken: string;
};

type RateLimitResult = {
    limited: boolean;
    remaining: number;
    resetAt: number;
    source: 'upstash' | 'memory';
};

const fallbackStore = new Map<string, { count: number; resetAt: number }>();
const warnedMessages = new Set<string>();

function warnOnce(key: string, message: string) {
    if (warnedMessages.has(key)) return;
    warnedMessages.add(key);
    console.warn(message);
}

function getUpstashConfig(): UpstashConfig | null {
    const restUrl = process.env.UPSTASH_REDIS_REST_URL?.trim();
    const restToken = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();

    if (!restUrl || !restToken) {
        if (process.env.NODE_ENV === 'production') {
            warnOnce(
                'upstash-missing',
                '[rate-limit] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is missing in production. Falling back to in-memory limits.',
            );
        }
        return null;
    }

    return {
        restUrl: restUrl.replace(/\/+$/, ''),
        restToken,
    };
}

async function runUpstashCommand(config: UpstashConfig, command: Array<string | number>): Promise<number | null> {
    try {
        const response = await fetch(config.restUrl, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${config.restToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(command),
            cache: 'no-store',
        });

        const payload = (await response.json()) as { result?: unknown; error?: string };
        if (!response.ok || payload.error) {
            throw new Error(payload.error || `Upstash request failed with status ${response.status}.`);
        }

        return typeof payload.result === 'number' ? payload.result : null;
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown Upstash error.';
        warnOnce('upstash-error', `[rate-limit] Upstash request failed, falling back to in-memory limits. ${message}`);
        return null;
    }
}

function consumeMemoryRateLimit(storageKey: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    const entry = fallbackStore.get(storageKey);

    if (!entry || now > entry.resetAt) {
        const resetAt = now + windowMs;
        fallbackStore.set(storageKey, { count: 1, resetAt });
        return {
            limited: false,
            remaining: Math.max(limit - 1, 0),
            resetAt,
            source: 'memory',
        };
    }

    entry.count += 1;
    return {
        limited: entry.count > limit,
        remaining: Math.max(limit - entry.count, 0),
        resetAt: entry.resetAt,
        source: 'memory',
    };
}

async function consumeUpstashRateLimit(
    config: UpstashConfig,
    storageKey: string,
    limit: number,
    windowMs: number,
): Promise<RateLimitResult | null> {
    const current = await runUpstashCommand(config, ['INCR', storageKey]);
    if (typeof current !== 'number') {
        return null;
    }

    let ttlMs = await runUpstashCommand(config, ['PTTL', storageKey]);
    if (typeof ttlMs !== 'number') {
        return null;
    }

    if (ttlMs < 0) {
        await runUpstashCommand(config, ['PEXPIRE', storageKey, windowMs]);
        ttlMs = windowMs;
    }

    return {
        limited: current > limit,
        remaining: Math.max(limit - current, 0),
        resetAt: Date.now() + Math.max(ttlMs, 0),
        source: 'upstash',
    };
}

export async function consumeRateLimit(options: {
    namespace: string;
    key: string;
    limit: number;
    windowMs: number;
}): Promise<RateLimitResult> {
    const normalizedKey = options.key.trim().toLowerCase();
    const storageKey = `ratelimit:${options.namespace}:${normalizedKey}`;
    const config = getUpstashConfig();

    if (config) {
        const upstashResult = await consumeUpstashRateLimit(
            config,
            storageKey,
            options.limit,
            options.windowMs,
        );

        if (upstashResult) {
            return upstashResult;
        }
    }

    return consumeMemoryRateLimit(storageKey, options.limit, options.windowMs);
}
