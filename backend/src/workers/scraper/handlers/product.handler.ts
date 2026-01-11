/**
 * Product Handler
 * 
 * Extracts detailed product information from product detail pages.
 */

import { PlaywrightCrawlingContext } from 'crawlee';
import { SCRAPER_CONFIG } from '../scraper.config';
import { PRODUCT_DETAIL_SELECTORS, safeGetText, safeGetAttribute } from '../utils/selectors';
import { ScraperStorage, ProductDetailData, extractProductId } from '../utils/storage';

export async function handleProduct(
    context: PlaywrightCrawlingContext,
    storage: ScraperStorage,
): Promise<void> {
    const { page, request, log } = context;

    log.info(`Scraping product: ${request.url}`);

    try {
        // Wait for page to load
        await page.waitForLoadState('networkidle', { timeout: SCRAPER_CONFIG.navigationTimeoutMs });

        // Extract product ID
        const sourceId = extractProductId(request.url);

        // Extract title (required)
        const title = await safeGetText(page, PRODUCT_DETAIL_SELECTORS.title);
        if (!title) {
            log.warning('Product title not found, skipping');
            return;
        }

        // Extract author
        const author = await safeGetText(page, PRODUCT_DETAIL_SELECTORS.author);

        // Extract price
        const priceText = await safeGetText(page, PRODUCT_DETAIL_SELECTORS.price);
        const priceMatch = priceText?.match(/[\d.]+/);
        const price = priceMatch ? parseFloat(priceMatch[0]) : undefined;

        // Extract currency
        let currency = await safeGetText(page, PRODUCT_DETAIL_SELECTORS.currency);
        if (!currency && priceText) {
            currency = priceText.includes('£') ? 'GBP' : 'USD';
        }

        // Extract image
        const imageUrl = await safeGetAttribute(page, PRODUCT_DETAIL_SELECTORS.image, 'src');

        // Extract description
        const description = await safeGetText(page, PRODUCT_DETAIL_SELECTORS.description);

        // Extract ISBN
        const isbn = await safeGetText(page, PRODUCT_DETAIL_SELECTORS.isbn);

        // Extract publisher
        const publisher = await safeGetText(page, PRODUCT_DETAIL_SELECTORS.publisher);

        // Extract publication date
        const publicationDate = await safeGetText(page, PRODUCT_DETAIL_SELECTORS.publicationDate);

        // Extract rating
        const ratingText = await safeGetText(page, PRODUCT_DETAIL_SELECTORS.rating);
        const rating = ratingText ? parseFloat(ratingText) : undefined;

        // Extract review count
        const reviewCountText = await safeGetText(page, PRODUCT_DETAIL_SELECTORS.reviewCount);
        const reviewCount = reviewCountText ? parseInt(reviewCountText.replace(/\D/g, '')) : undefined;

        // Extract specifications (if available)
        let specs: Record<string, any> | undefined;
        try {
            const specsElement = await page.$(PRODUCT_DETAIL_SELECTORS.specs[0]);
            if (specsElement) {
                const specsText = await specsElement.textContent();
                // Parse specs text into key-value pairs (basic implementation)
                if (specsText) {
                    specs = { raw: specsText.trim() };
                }
            }
        } catch (error) {
            // Specs are optional
        }

        // Build product detail data
        const productDetail: ProductDetailData = {
            sourceId,
            title,
            author: author || undefined,
            price,
            currency: currency || undefined,
            imageUrl: imageUrl || undefined,
            sourceUrl: request.url,
            description: description || undefined,
            isbn: isbn || undefined,
            publisher: publisher || undefined,
            publicationDate: publicationDate || undefined,
            rating,
            reviewCount,
            specs,
            scrapedAt: new Date().toISOString(),
        };

        // Save product detail
        await storage.addProductDetail(productDetail);

        log.info(`Saved product detail: ${title}`);

    } catch (error) {
        log.error(`Error in product handler: ${error}`);
        throw error;
    }
}
