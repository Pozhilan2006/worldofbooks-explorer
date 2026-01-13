/**
 * Scrape Worker
 * 
 * Standalone BullMQ worker for processing scrape jobs.
 * Only runs when Redis URL is available.
 */

import { Worker } from 'bullmq';

// Check for Redis URL
if (!process.env.REDIS_URL_INTERNAL) {
    console.log('[SCRAPE WORKER] Redis URL not set - exiting');
    process.exit(0);
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
