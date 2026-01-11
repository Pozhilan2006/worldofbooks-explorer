/**
 * Category Handler
 * 
 * Extracts category information and product listings from category pages.
 * Handles pagination and enqueues product detail pages.
 */

import { PlaywrightCrawlingContext } from 'crawlee';
import { SCRAPER_CONFIG, ROUTES } from '../scraper.config';
import {
    CATEGORY_SELECTORS,
    PRODUCT_CARD_SELECTORS,
    safeGetText,
    safeGetAttribute,
    safeQuerySelectorAll,
} from '../utils/selectors';
import {
    ScraperStorage,
    CategoryData,
    ProductData,
    generateSlug,
    extractProductId,
} from '../utils/storage';

export async function handleCategory(
    context: PlaywrightCrawlingContext,
    storage: ScraperStorage,
): Promise<void> {
    const { page, request, log, enqueueLinks } = context;

    log.info(`Scraping category: ${request.url}`);

    try {
        // Wait for page to load
        await page.waitForLoadState('networkidle', { timeout: SCRAPER_CONFIG.navigationTimeoutMs });

        // Extract category title
        const title = await safeGetText(page, CATEGORY_SELECTORS.title);
        if (!title) {
            log.warning('Category title not found, skipping');
            return;
        }

        // Extract category description
        const description = await safeGetText(page, CATEGORY_SELECTORS.description);

        // Extract product cards
        const productCards = await safeQuerySelectorAll(page, CATEGORY_SELECTORS.productCards);

        log.info(`Found ${productCards.length} products in category: ${title}`);

        const products: ProductData[] = [];
        const productUrls: string[] = [];

        // Extract data from each product card
        for (const card of productCards.slice(0, SCRAPER_CONFIG.maxProductsPerCategory)) {
            try {
                // Get product link
                const linkElement = await card.$(PRODUCT_CARD_SELECTORS.link[0]);
                const productHref = linkElement ? await linkElement.getAttribute('href') : null;

                if (!productHref) {
                    continue;
                }

                const productUrl = new URL(productHref, SCRAPER_CONFIG.baseUrl).href;
                const sourceId = extractProductId(productUrl);

                // Extract basic product info from card
                const productTitle = await card.$eval(
                    PRODUCT_CARD_SELECTORS.title.join(', '),
                    el => el.textContent?.trim() || '',
                ).catch(() => '');

                const priceText = await card.$eval(
                    PRODUCT_CARD_SELECTORS.price.join(', '),
                    el => el.textContent?.trim() || '',
                ).catch(() => '');

                const imageUrl = await card.$eval(
                    PRODUCT_CARD_SELECTORS.image.join(', '),
                    el => el.getAttribute('src') || '',
                ).catch(() => '');

                const author = await card.$eval(
                    PRODUCT_CARD_SELECTORS.author.join(', '),
                    el => el.textContent?.trim() || '',
                ).catch(() => null);

                // Parse price
                const priceMatch = priceText.match(/[\d.]+/);
                const price = priceMatch ? parseFloat(priceMatch[0]) : undefined;
                const currency = priceText.includes('£') ? 'GBP' : 'USD';

                const productData: ProductData = {
                    sourceId,
                    categoryUrl: request.url,
                    title: productTitle || 'Unknown',
                    author: author || undefined,
                    price,
                    currency,
                    imageUrl: imageUrl || undefined,
                    sourceUrl: productUrl,
                    scrapedAt: new Date().toISOString(),
                };

                products.push(productData);
                productUrls.push(productUrl);

            } catch (error) {
                log.error(`Error extracting product card: ${error}`);
            }
        }

        // Save category data
        const categoryData: CategoryData = {
            navigationTitle: title, // We don't have parent nav title here, using category title
            title,
            slug: generateSlug(title),
            sourceUrl: request.url,
            description: description || undefined,
            productCount: productCards.length,
            scrapedAt: new Date().toISOString(),
        };

        await storage.addCategory(categoryData);

        // Save product data
        for (const product of products) {
            await storage.addProduct(product);
        }

        log.info(`Saved ${products.length} products from category: ${title}`);

        // Enqueue product detail pages (limited by config)
        const limitedProductUrls = productUrls.slice(0, SCRAPER_CONFIG.maxProductDetails);

        if (limitedProductUrls.length > 0) {
            await enqueueLinks({
                urls: limitedProductUrls,
                label: ROUTES.PRODUCT,
            });

            log.info(`Enqueued ${limitedProductUrls.length} product detail pages`);
        }

        // Handle pagination (optional - currently disabled to limit scraping)
        // const nextPageLink = await safeGetAttribute(page, CATEGORY_SELECTORS.nextPageLink, 'href');
        // if (nextPageLink) {
        //   const nextPageUrl = new URL(nextPageLink, SCRAPER_CONFIG.baseUrl).href;
        //   await enqueueLinks({ urls: [nextPageUrl], label: ROUTES.CATEGORY });
        // }

    } catch (error) {
        log.error(`Error in category handler: ${error}`);
        throw error;
    }
}
