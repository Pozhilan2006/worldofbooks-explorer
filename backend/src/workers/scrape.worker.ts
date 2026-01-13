/**
 * Scrape Worker
 * 
 * Standalone BullMQ worker for processing scrape jobs.
 * Only runs when SCRAPE_QUEUE_ENABLED=true.
 */

import { Worker } from 'bullmq';

// Check if queue is enabled
if (process.env.SCRAPE_QUEUE_ENABLED !== 'true') {
    console.log('[SCRAPE WORKER] Queue disabled (SCRAPE_QUEUE_ENABLED != true) - exiting');
    process.exit(0);
}

// Check for Redis URL
if (!process.env.REDIS_URL_INTERNAL) {
    console.error('[SCRAPE WORKER] REDIS_URL_INTERNAL not set - cannot connect to Redis');
    process.exit(1);
}

console.log('[SCRAPE WORKER] Starting worker...');

// Create worker
new Worker(
    'scrape-queue',
    async (job) => {
        console.log(`[SCRAPE JOB] Processing: ${job.name}`, job.data);

        try {
            // TODO: Implement actual scraping logic here
            // Import and call Crawlee handlers based on job.name
            // if (job.name === 'navigation') { await handleNavigation(job.data.url); }
            // if (job.name === 'category') { await handleCategory(job.data.url); }
            // if (job.name === 'product') { await handleProduct(job.data.url); }

            console.log(`[SCRAPE JOB] Completed: ${job.name}`);
        } catch (error) {
            console.error(`[SCRAPE JOB] Failed: ${job.name}`, error);
            throw error; // Re-throw to trigger BullMQ retry logic
        }
    },
    {
        connection: {
            url: process.env.REDIS_URL_INTERNAL,
        },
        concurrency: 1, // IMPORTANT: Keep at 1 to prevent memory spikes with Crawlee
    },
);

console.log('[SCRAPE WORKER] Worker initialized and listening for jobs');
