import { Worker } from 'bullmq';

if (process.env.NODE_ENV !== 'production') {
    console.log('[SCRAPE WORKER] Not running outside production');
    process.exit(0);
}

console.log('[SCRAPE WORKER] Starting worker...');

new Worker(
    'scrape-queue',
    async (job) => {
        console.log('[SCRAPE JOB]', job.name, job.data.url);

        // TODO: Implement actual scraping logic here
        // if (job.name === 'product') { ... }
        // if (job.name === 'category') { ... }
    },
    {
        connection: {
            url: process.env.REDIS_URL_INTERNAL,
        },
        concurrency: 2,
    },
);
