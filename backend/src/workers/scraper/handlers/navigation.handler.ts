/**
 * Navigation Handler
 * 
 * Extracts navigation menu items from the homepage and enqueues
 * category pages for further crawling.
 */

import { PlaywrightCrawlingContext } from 'crawlee';
import { SCRAPER_CONFIG, ROUTES, isUrlAllowed } from '../scraper.config';
import { NAVIGATION_SELECTORS, safeQuerySelectorAll } from '../utils/selectors';
import { ScraperStorage, NavigationData, generateSlug } from '../utils/storage';

export async function handleNavigation(
    context: PlaywrightCrawlingContext,
    storage: ScraperStorage,
): Promise<void> {
    const { page, request, log, enqueueLinks } = context;

    log.info(`Scraping navigation from: ${request.url}`);

    try {
        // Wait for navigation menu to load
        await page.waitForLoadState('networkidle', { timeout: SCRAPER_CONFIG.navigationTimeoutMs });

        // Extract navigation links
        const navElements = await safeQuerySelectorAll(page, NAVIGATION_SELECTORS.navLinks);

        if (navElements.length === 0) {
            log.warning('No navigation links found');
            return;
        }

        log.info(`Found ${navElements.length} navigation links`);

        const navigationItems: NavigationData[] = [];
        const categoryUrls: string[] = [];

        // Extract data from each navigation link
        for (const element of navElements) {
            try {
                const href = await element.getAttribute('href');
                const text = await element.textContent();

                if (!href || !text) {
                    continue;
                }

                // Build full URL
                const fullUrl = new URL(href, SCRAPER_CONFIG.baseUrl).href;

                // Check if URL is allowed by robots.txt
                if (!isUrlAllowed(fullUrl)) {
                    log.debug(`Skipping disallowed URL: ${fullUrl}`);
                    continue;
                }

                // Only process collection/category URLs
                if (!fullUrl.includes('/collections/')) {
                    continue;
                }

                const title = text.trim();
                const slug = generateSlug(title);

                navigationItems.push({
                    title,
                    slug,
                    sourceUrl: fullUrl,
                    scrapedAt: new Date().toISOString(),
                });

                categoryUrls.push(fullUrl);

                log.info(`Found navigation item: ${title} -> ${fullUrl}`);
            } catch (error) {
                log.error(`Error extracting navigation link: ${error}`);
            }
        }

        // Save navigation data
        for (const item of navigationItems) {
            await storage.addNavigation(item);
        }

        // Enqueue category pages (limited by config)
        const limitedUrls = categoryUrls.slice(0, SCRAPER_CONFIG.maxCategoriesPerNav);

        if (limitedUrls.length > 0) {
            await enqueueLinks({
                urls: limitedUrls,
                label: ROUTES.CATEGORY,
            });

            log.info(`Enqueued ${limitedUrls.length} category pages for scraping`);
        }

    } catch (error) {
        log.error(`Error in navigation handler: ${error}`);
        throw error;
    }
}
