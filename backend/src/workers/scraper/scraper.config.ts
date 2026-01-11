/**
 * Scraper Configuration
 * 
 * Defines rate limiting, retry logic, and other scraper settings
 * to ensure respectful and reliable web scraping.
 */

export const SCRAPER_CONFIG = {
    // Base URL for World of Books
    baseUrl: 'https://www.worldofbooks.com/en-gb',

    // Rate limiting
    maxConcurrency: 2, // Maximum concurrent requests
    minDelayMs: 3000, // Minimum delay between requests (3 seconds)
    maxDelayMs: 5000, // Maximum delay between requests (5 seconds)

    // Retry configuration
    maxRetries: 3, // Maximum number of retry attempts
    retryBaseDelayMs: 1000, // Base delay for exponential backoff (1 second)
    retryMultiplier: 2, // Exponential backoff multiplier
    maxRetryDelayMs: 10000, // Maximum retry delay (10 seconds)

    // Timeouts
    navigationTimeoutMs: 30000, // Page navigation timeout (30 seconds)
    requestTimeoutMs: 30000, // Request timeout (30 seconds)

    // Storage
    storageDir: './storage', // Directory for storing scraped data
    datasetName: 'worldofbooks-data', // Dataset name for Crawlee

    // Scraping limits (for testing/safety)
    maxNavigationPages: 1, // Max navigation pages to scrape (set to Infinity for full scrape)
    maxCategoriesPerNav: 10, // Max categories per navigation item
    maxProductsPerCategory: 50, // Max products per category
    maxProductDetails: 100, // Max product detail pages to scrape

    // User agent
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',

    // Headless mode
    headless: true, // Run browser in headless mode

    // Screenshot on error
    screenshotOnError: true,
} as const;

/**
 * Routes for different page types
 */
export const ROUTES = {
    NAVIGATION: 'NAVIGATION',
    CATEGORY: 'CATEGORY',
    PRODUCT: 'PRODUCT',
} as const;

/**
 * Robots.txt compliance - paths to avoid
 */
export const DISALLOWED_PATHS = [
    '/search',
    '/cart',
    '/checkout',
    '/checkouts',
    '/orders',
    '/admin',
    '/account',
    '/policies',
] as const;

/**
 * Check if a URL is allowed by robots.txt
 */
export function isUrlAllowed(url: string): boolean {
    const urlObj = new URL(url);
    return !DISALLOWED_PATHS.some(path => urlObj.pathname.startsWith(path));
}

/**
 * Get random delay between min and max
 */
export function getRandomDelay(): number {
    const { minDelayMs, maxDelayMs } = SCRAPER_CONFIG;
    return Math.floor(Math.random() * (maxDelayMs - minDelayMs + 1)) + minDelayMs;
}
