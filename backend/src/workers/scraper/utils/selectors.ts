/**
 * Defensive CSS Selectors
 * 
 * Multiple fallback selectors for each element to handle DOM changes.
 * Returns null if element not found instead of throwing errors.
 */

import { Page, ElementHandle } from 'playwright';

/**
 * Navigation selectors
 */
export const NAVIGATION_SELECTORS = {
    // Main navigation menu
    navMenu: [
        'nav[role="navigation"]',
        '.main-navigation',
        'header nav',
        '.navigation-menu',
    ],

    // Navigation links
    navLinks: [
        'nav[role="navigation"] a',
        '.main-navigation a',
        'header nav a',
        '.navigation-menu a',
    ],
};

/**
 * Category page selectors
 */
export const CATEGORY_SELECTORS = {
    // Category title
    title: [
        'h1.collection-title',
        'h1.category-title',
        '.collection-header h1',
        'h1',
    ],

    // Category description
    description: [
        '.collection-description',
        '.category-description',
        '.collection-header p',
    ],

    // Product grid
    productGrid: [
        '.product-grid',
        '.products-grid',
        '.collection-products',
        '[data-products]',
    ],

    // Individual product cards
    productCards: [
        '.product-card',
        '.product-item',
        '.grid-product',
        '[data-product-id]',
    ],

    // Pagination
    nextPageLink: [
        'a[rel="next"]',
        '.pagination__next',
        '.pagination a:last-child',
    ],
};

/**
 * Product card selectors (within category listings)
 */
export const PRODUCT_CARD_SELECTORS = {
    link: ['a.product-link', 'a[href*="/products/"]', 'a'],
    title: ['.product-title', '.product-name', 'h3', 'h2'],
    price: ['.product-price', '.price', '[data-price]'],
    image: ['img.product-image', 'img', '[data-image]'],
    author: ['.product-author', '.author', '[data-author]'],
};

/**
 * Product detail page selectors
 */
export const PRODUCT_DETAIL_SELECTORS = {
    title: [
        'h1.product-title',
        'h1[itemprop="name"]',
        '.product-single__title',
        'h1',
    ],

    author: [
        '.product-author',
        '[itemprop="author"]',
        '.product-meta__author',
        '[data-author]',
    ],

    price: [
        '.product-price',
        '[itemprop="price"]',
        '.price',
        '[data-price]',
    ],

    currency: [
        '[itemprop="priceCurrency"]',
        '.currency',
        '[data-currency]',
    ],

    image: [
        '.product-featured-image img',
        '[itemprop="image"]',
        '.product-image img',
        'img[alt*="product"]',
    ],

    description: [
        '.product-description',
        '[itemprop="description"]',
        '.product-single__description',
        '.description',
    ],

    isbn: [
        '[data-isbn]',
        '.isbn',
        '.product-isbn',
    ],

    publisher: [
        '.publisher',
        '[data-publisher]',
        '.product-publisher',
    ],

    publicationDate: [
        '.publication-date',
        '[data-publication-date]',
        '.product-date',
    ],

    rating: [
        '.rating',
        '[itemprop="ratingValue"]',
        '.product-rating',
        '[data-rating]',
    ],

    reviewCount: [
        '.review-count',
        '[itemprop="reviewCount"]',
        '.reviews-count',
    ],

    specs: [
        '.product-specs',
        '.specifications',
        '.product-details',
    ],
};

/**
 * Safe element query with multiple fallback selectors
 */
export async function safeQuerySelector(
    page: Page,
    selectors: string[],
): Promise<ElementHandle | null> {
    for (const selector of selectors) {
        try {
            const element = await page.$(selector);
            if (element) {
                return element;
            }
        } catch (error) {
            // Continue to next selector
            continue;
        }
    }
    return null;
}

/**
 * Safe text extraction with multiple fallback selectors
 */
export async function safeGetText(
    page: Page,
    selectors: string[],
): Promise<string | null> {
    const element = await safeQuerySelector(page, selectors);
    if (!element) {
        return null;
    }

    try {
        const text = await element.textContent();
        return text?.trim() || null;
    } catch (error) {
        return null;
    }
}

/**
 * Safe attribute extraction
 */
export async function safeGetAttribute(
    page: Page,
    selectors: string[],
    attribute: string,
): Promise<string | null> {
    const element = await safeQuerySelector(page, selectors);
    if (!element) {
        return null;
    }

    try {
        const value = await element.getAttribute(attribute);
        return value?.trim() || null;
    } catch (error) {
        return null;
    }
}

/**
 * Safe query all with multiple fallback selectors
 */
export async function safeQuerySelectorAll(
    page: Page,
    selectors: string[],
): Promise<ElementHandle[]> {
    for (const selector of selectors) {
        try {
            const elements = await page.$$(selector);
            if (elements && elements.length > 0) {
                return elements;
            }
        } catch (error) {
            continue;
        }
    }
    return [];
}
