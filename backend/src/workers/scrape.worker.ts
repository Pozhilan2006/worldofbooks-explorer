/**
 * Scrape Worker
 * 
 * Standalone BullMQ worker for processing scrape jobs.
 * Only runs when Redis URL is available.
 */

import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import { PlaywrightCrawler } from 'crawlee';
import { SCRAPER_CONFIG, ROUTES, getRandomDelay } from './scraper/scraper.config';
import { handleNavigation } from './scraper/handlers/navigation.handler';
import { handleCategory } from './scraper/handlers/category.handler';
import { handleProduct } from './scraper/handlers/product.handler';
import { ScraperStorage } from './scraper/utils/storage';
import { retryWithBackoff, isRetryableError, sleep } from './scraper/utils/retry';

// Check for Redis URL
// Debug log (temporary)
console.log('[DEBUG] REDIS_URL_INTERNAL:', process.env.REDIS_URL_INTERNAL);

// Check for Redis URL
if (!process.env.REDIS_URL_INTERNAL) {
    console.error('[SCRAPE WORKER] REDIS_URL_INTERNAL missing');
    // Prevent immediate crash loop on Render
    setTimeout(() => process.exit(1), 5000);
}

console.log('[SCRAPE WORKER] Starting worker...');

// Initialize Prisma
const prisma = new PrismaClient();

// Create worker
new Worker(
    'scrape-queue',
    async (job) => {
        console.log(`[SCRAPE JOB] Processing: ${job.name}`, job.data);

        // Initialize storage with Prisma
        const storage = new ScraperStorage(prisma);

        try {
            // Run crawler for this specific job
            const crawler = new PlaywrightCrawler({
                // Minimal crawler config for single job
                launchContext: {
                    launchOptions: {
                        headless: SCRAPER_CONFIG.headless,
                    },
                },
                requestHandler: async (context) => {
                    const { request, log } = context;
                    log.info(`Processing: ${request.url} [${job.name}]`);

                    // Delay
                    const delay = getRandomDelay();
                    await sleep(delay);

                    // Route to handler
                    if (job.name === 'navigation') {
                        await handleNavigation(context, storage);
                    } else if (job.name === 'category') {
                        await handleCategory(context, storage);
                    } else if (job.name === 'product') {
                        await handleProduct(context, storage);
                    }
                },
            });

            // Run the crawler with the job URL
            await crawler.run([
                {
                    url: job.data.url,
                    label: job.name.toUpperCase(), // e.g. NAVIGATION, CATEGORY
                },
            ]);

            // Save any file-based data (DB is saved during handling)
            await storage.saveAll();

            console.log(`[SCRAPE JOB] Completed: ${job.name}`);
        } catch (error) {
            console.error(`[SCRAPE JOB] Failed: ${job.name}`, error);
            throw error;
        }
    },
    {
        connection: {
            url: process.env.REDIS_URL_INTERNAL,
        },
        concurrency: 1, // Keep at 1 for safety
    },
);

console.log('[SCRAPE WORKER] Worker initialized and listening for jobs');
