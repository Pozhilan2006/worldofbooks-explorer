export default () => ({
    port: parseInt(process.env.PORT, 10) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    database: {
        url: process.env.DATABASE_URL,
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
        logging: process.env.DATABASE_LOGGING === 'true',
    },

    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT, 10) || 6379,
        password: process.env.REDIS_PASSWORD,
        db: parseInt(process.env.REDIS_DB, 10) || 0,
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
        expiresIn: process.env.JWT_EXPIRATION || '7d',
    },

    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    },

    throttle: {
        ttl: parseInt(process.env.THROTTLE_TTL, 10) || 60,
        limit: parseInt(process.env.THROTTLE_LIMIT, 10) || 10,
    },

    scraping: {
        rateLimit: parseInt(process.env.SCRAPE_RATE_LIMIT, 10) || 10,
        timeout: parseInt(process.env.SCRAPE_TIMEOUT, 10) || 30000,
        concurrentLimit: parseInt(process.env.SCRAPE_CONCURRENT_LIMIT, 10) || 5,
        userAgent: process.env.SCRAPE_USER_AGENT || 'Mozilla/5.0',
    },

    cache: {
        ttl: parseInt(process.env.CACHE_TTL, 10) || 3600,
        maxItems: parseInt(process.env.CACHE_MAX_ITEMS, 10) || 1000,
    },

    logging: {
        level: process.env.LOG_LEVEL || 'debug',
        filePath: process.env.LOG_FILE_PATH || './logs',
    },
});
