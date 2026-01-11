/**
 * World of Books Scraper
 * 
 * Main entry point for the Crawlee + Playwright scraper.
 * Scrapes navigation, categories, products, and product details
 * from World of Books (https://www.worldofbooks.com/en-gb).
 * 
 * Features:
 * - Respects robots.txt
 * - Rate limiting (max concurrency: 2, delays: 3-5s)
 * - Exponential backoff retry logic
 * - Defensive selectors with fallbacks
 * - Data deduplication and storage
 */

import { PlaywrightCrawler, ProxyConfiguration } from 'crawlee';
import { SCRAPER_CONFIG, ROUTES, getRandomDelay } from './scraper.config';
import { handleNavigation } from './handlers/navigation.handler';
import { handleCategory } from './handlers/category.handler';
import { handleProduct } from './handlers/product.handler';
import { ScraperStorage } from './utils/storage';
import { retryWithBackoff, isRetryableError, sleep } from './utils/retry';

/**
 * Main scraper function
 */
export async function runScraper() {
    console.log('🚀 Starting World of Books Scraper...\n');
    console.log('Configuration:');
    console.log(`  - Base URL: ${SCRAPER_CONFIG.baseUrl}`);
    console.log(`  - Max Concurrency: ${SCRAPER_CONFIG.maxConcurrency}`);
    console.log(`  - Request Delay: ${SCRAPER_CONFIG.minDelayMs}-${SCRAPER_CONFIG.maxDelayMs}ms`);
    console.log(`  - Max Retries: ${SCRAPER_CONFIG.maxRetries}`);
    console.log(`  - Headless: ${SCRAPER_CONFIG.headless}`);
    console.log('');

    // Initialize storage
    const storage = new ScraperStorage();

    // Create crawler
    const crawler = new PlaywrightCrawler({
        // Rate limiting
        maxConcurrency: SCRAPER_CONFIG.maxConcurrency,
        maxRequestsPerMinute: 12, // ~5 seconds between requests on average

        // Timeouts
        navigationTimeoutSecs: SCRAPER_CONFIG.navigationTimeoutMs / 1000,
        requestHandlerTimeoutSecs: SCRAPER_CONFIG.requestTimeoutMs / 1000,

        // Browser options
        launchContext: {
            launchOptions: {
                headless: SCRAPER_CONFIG.headless,
            },
        },

        // Request handler with routing
        requestHandler: async (context) => {
            const { request, log } = context;

            log.info(`Processing: ${request.url} [${request.label || 'NAVIGATION'}]`);

            try {
                // Add random delay before processing
                const delay = getRandomDelay();
                log.debug(`Waiting ${delay}ms before processing...`);
                await sleep(delay);

                // Route to appropriate handler with retry logic
                await retryWithBackoff(
                    async () => {
                        switch (request.label) {
                            case ROUTES.CATEGORY:
                                await handleCategory(context, storage);
                                break;
                            case ROUTES.PRODUCT:
                                await handleProduct(context, storage);
                                break;
                            default:
                                await handleNavigation(context, storage);
                                break;
                        }
                    },
                    {
                        maxRetries: SCRAPER_CONFIG.maxRetries,
                        shouldRetry: isRetryableError,
                        onRetry: (error, attempt) => {
                            log.warning(`Retry attempt ${attempt}/${SCRAPER_CONFIG.maxRetries} for ${request.url}: ${error.message}`);
                        },
                    },
                );

                // Log progress
                const stats = storage.getStats();
                log.info(`Progress: ${stats.navigation} nav, ${stats.categories} cats, ${stats.products} products, ${stats.productDetails} details`);

            } catch (error) {
                log.error(`Failed to process ${request.url}: ${error}`);

                // Take screenshot on error if enabled
                if (SCRAPER_CONFIG.screenshotOnError) {
                    try {
                        const screenshot = await context.page.screenshot();
                        log.error(`Screenshot saved for failed request: ${request.url}`);
                    } catch (screenshotError) {
                        log.error(`Failed to take screenshot: ${screenshotError}`);
                    }
                }

                throw error;
            }
        },

        // Error handler
        failedRequestHandler: async ({ request, log }, error) => {
            log.error(`Request ${request.url} failed after ${SCRAPER_CONFIG.maxRetries} retries: ${error}`);
        },
    });

    // Run the crawler
    try {
        await crawler.run([
            {
                url: SCRAPER_CONFIG.baseUrl,
                label: ROUTES.NAVIGATION,
            },
        ]);

        console.log('\n✅ Scraping completed successfully!');

        // Save all data
        await storage.saveAll();

        // Print final stats
        const stats = storage.getStats();
        console.log('\n📊 Final Statistics:');
        console.log(`  - Navigation items: ${stats.navigation}`);
        console.log(`  - Categories: ${stats.categories}`);
        console.log(`  - Products: ${stats.products}`);
        console.log(`  - Product details: ${stats.productDetails}`);
        console.log(`\n💾 Data saved to: ${SCRAPER_CONFIG.storageDir}/`);

    } catch (error) {
        console.error('\n❌ Scraping failed:', error);
        throw error;
    }
}

// Run scraper if executed directly
if (require.main === module) {
    runScraper()
        .then(() => {
            console.log('\n✨ Scraper finished!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Scraper crashed:', error);
            process.exit(1);
        });
}
