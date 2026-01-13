import IORedis from 'ioredis';

if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL is missing');
}

export const redisConnection = new IORedis(process.env.REDIS_URL, {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: false,
});
