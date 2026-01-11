/**
 * Storage Utilities
 * 
 * Handles saving scraped data to JSON files and provides
 * integration points for database storage.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { SCRAPER_CONFIG } from '../scraper.config';

export interface NavigationData {
    title: string;
    slug: string;
    sourceUrl: string;
    scrapedAt: string;
}

export interface CategoryData {
    navigationTitle: string;
    title: string;
    slug: string;
    sourceUrl: string;
    description?: string;
    productCount?: number;
    scrapedAt: string;
}

export interface ProductData {
    sourceId: string;
    categoryUrl?: string;
    title: string;
    author?: string;
    price?: number;
    currency?: string;
    imageUrl?: string;
    sourceUrl: string;
    scrapedAt: string;
}

export interface ProductDetailData extends ProductData {
    description?: string;
    isbn?: string;
    publisher?: string;
    publicationDate?: string;
    rating?: number;
    reviewCount?: number;
    specs?: Record<string, any>;
}

/**
 * Ensure storage directory exists
 */
export async function ensureStorageDir(): Promise<void> {
    const storageDir = path.resolve(SCRAPER_CONFIG.storageDir);

    try {
        await fs.access(storageDir);
    } catch {
        await fs.mkdir(storageDir, { recursive: true });
    }
}

/**
 * Save data to JSON file
 */
export async function saveToJson<T>(
    filename: string,
    data: T[],
): Promise<void> {
    await ensureStorageDir();

    const filePath = path.join(SCRAPER_CONFIG.storageDir, filename);
    const jsonData = JSON.stringify(data, null, 2);

    await fs.writeFile(filePath, jsonData, 'utf-8');
}

/**
 * Load data from JSON file
 */
export async function loadFromJson<T>(
    filename: string,
): Promise<T[]> {
    const filePath = path.join(SCRAPER_CONFIG.storageDir, filename);

    try {
        const jsonData = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(jsonData);
    } catch {
        return [];
    }
}

/**
 * Append data to JSON file
 */
export async function appendToJson<T>(
    filename: string,
    newData: T,
): Promise<void> {
    const existingData = await loadFromJson<T>(filename);
    existingData.push(newData);
    await saveToJson(filename, existingData);
}

/**
 * Generate slug from title
 */
export function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Extract product ID from URL
 */
export function extractProductId(url: string): string {
    const match = url.match(/\/products\/([^/?]+)/);
    return match ? match[1] : url;
}

/**
 * Deduplicate array by key
 */
export function deduplicateByKey<T>(
    array: T[],
    keyFn: (item: T) => string,
): T[] {
    const seen = new Set<string>();
    return array.filter(item => {
        const key = keyFn(item);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}

/**
 * Storage class for managing scraped data
 */
export class ScraperStorage {
    private navigation: NavigationData[] = [];
    private categories: CategoryData[] = [];
    private products: ProductData[] = [];
    private productDetails: ProductDetailData[] = [];

    async addNavigation(data: NavigationData): Promise<void> {
        this.navigation.push(data);
    }

    async addCategory(data: CategoryData): Promise<void> {
        this.categories.push(data);
    }

    async addProduct(data: ProductData): Promise<void> {
        this.products.push(data);
    }

    async addProductDetail(data: ProductDetailData): Promise<void> {
        this.productDetails.push(data);
    }

    async saveAll(): Promise<void> {
        // Deduplicate data
        const uniqueNavigation = deduplicateByKey(
            this.navigation,
            item => item.sourceUrl,
        );
        const uniqueCategories = deduplicateByKey(
            this.categories,
            item => item.sourceUrl,
        );
        const uniqueProducts = deduplicateByKey(
            this.products,
            item => item.sourceUrl,
        );
        const uniqueProductDetails = deduplicateByKey(
            this.productDetails,
            item => item.sourceUrl,
        );

        // Save to JSON files
        await Promise.all([
            saveToJson('navigation.json', uniqueNavigation),
            saveToJson('categories.json', uniqueCategories),
            saveToJson('products.json', uniqueProducts),
            saveToJson('product-details.json', uniqueProductDetails),
        ]);

        console.log('\n✅ Data saved successfully:');
        console.log(`   - Navigation items: ${uniqueNavigation.length}`);
        console.log(`   - Categories: ${uniqueCategories.length}`);
        console.log(`   - Products: ${uniqueProducts.length}`);
        console.log(`   - Product details: ${uniqueProductDetails.length}`);
    }

    getStats() {
        return {
            navigation: this.navigation.length,
            categories: this.categories.length,
            products: this.products.length,
            productDetails: this.productDetails.length,
        };
    }
}
