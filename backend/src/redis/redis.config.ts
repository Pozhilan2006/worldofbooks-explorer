import { URL } from 'node:url';

export function getRedisConnection() {
    const redisUrl = process.env.REDIS_URL;

    if (!redisUrl) {
        throw new Error('REDIS_URL is missing');
    }

    const url = new URL(redisUrl);

    return {
        host: url.hostname,
        port: Number(url.port),
        username: url.username || undefined,
        password: url.password || undefined,
        // 🔥 THIS IS THE CRITICAL PART
        tls: {
            rejectUnauthorized: false,
        },
    };
}
