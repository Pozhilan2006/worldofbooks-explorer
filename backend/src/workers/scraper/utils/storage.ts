/**
 * Storage Utilities
 * 
 * Handles saving scraped data to JSON files and provides
 * integration points for database storage.
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { SCRAPER_CONFIG } from '../scraper.config';
import { PrismaClient } from '@prisma/client';

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
 * Storage class for managing scraped data
 */
export class ScraperStorage {
    private navigation: NavigationData[] = [];
    private categories: CategoryData[] = [];
    private products: ProductData[] = [];
    private productDetails: ProductDetailData[] = [];
    private prisma?: PrismaClient;

    constructor(prisma?: PrismaClient) {
        this.prisma = prisma;
    }

    async addNavigation(data: NavigationData): Promise<void> {
        this.navigation.push(data);

        if (this.prisma) {
            try {
                await this.prisma.navigation.upsert({
                    where: { sourceUrl: data.sourceUrl },
                    update: {
                        lastScrapedAt: new Date(data.scrapedAt),
                        title: data.title,
                    },
                    create: {
                        title: data.title,
                        slug: data.slug,
                        sourceUrl: data.sourceUrl,
                        lastScrapedAt: new Date(data.scrapedAt),
                    },
                });
                console.log(`[DB] Saved Navigation: ${data.title}`);
            } catch (error) {
                console.error(`[DB] Failed to save Navigation ${data.title}:`, error);
            }
        }
    }

    async addCategory(data: CategoryData): Promise<void> {
        this.categories.push(data);

        if (this.prisma) {
            try {
                // Find parent Navigation
                const navigation = await this.prisma.navigation.findUnique({
                    where: { sourceUrl: data.sourceUrl },
                });

                if (!navigation) {
                    // It's possible the sourceUrl matches logic.
                    // If navigation not found, we can't link.
                    console.warn(`[DB] Parent Navigation not found for Category ${data.title}`);
                    return;
                }

                await this.prisma.category.upsert({
                    where: { sourceUrl: data.sourceUrl },
                    update: {
                        lastScrapedAt: new Date(data.scrapedAt),
                        productCount: data.productCount,
                        description: data.description,
                        navigationId: navigation.id,
                    },
                    create: {
                        navigationId: navigation.id,
                        title: data.title,
                        slug: data.slug,
                        sourceUrl: data.sourceUrl,
                        description: data.description,
                        productCount: data.productCount,
                        lastScrapedAt: new Date(data.scrapedAt),
                    },
                });
            } catch (error) {
                console.error(`[DB] Failed to save Category ${data.title}:`, error);
            }
        }
    }

    async addProduct(data: ProductData): Promise<void> {
        this.products.push(data);

        if (this.prisma) {
            try {
                let categoryId: string | undefined;

                if (data.categoryUrl) {
                    const category = await this.prisma.category.findUnique({
                        where: { sourceUrl: data.categoryUrl },
                    });
                    if (category) categoryId = category.id;
                }

                await this.prisma.product.upsert({
                    where: { sourceUrl: data.sourceUrl },
                    update: {
                        lastScrapedAt: new Date(data.scrapedAt),
                        price: data.price ? data.price : null,
                        categoryId,
                    },
                    create: {
                        sourceId: data.sourceId,
                        title: data.title,
                        author: data.author,
                        price: data.price ? data.price : null,
                        currency: data.currency,
                        imageUrl: data.imageUrl,
                        sourceUrl: data.sourceUrl,
                        categoryId,
                        lastScrapedAt: new Date(data.scrapedAt),
                    },
                });
            } catch (error) {
                console.error(`[DB] Failed to save Product ${data.title}:`, error);
            }
        }
    }

    async addProductDetail(data: ProductDetailData): Promise<void> {
        this.productDetails.push(data);

        if (this.prisma) {
            try {
                const product = await this.prisma.product.findUnique({
                    where: { sourceUrl: data.sourceUrl },
                });

                if (!product) return;

                await this.prisma.productDetail.upsert({
                    where: { productId: product.id },
                    update: {
                        description: data.description,
                        isbn: data.isbn,
                        publisher: data.publisher,
                        publicationDate: data.publicationDate ? new Date(data.publicationDate) : null,
                        ratingsAvg: data.rating,
                        reviewsCount: data.reviewCount,
                        lastScrapedAt: new Date(data.scrapedAt),
                    },
                    create: {
                        productId: product.id,
                        description: data.description,
                        isbn: data.isbn,
                        publisher: data.publisher,
                        publicationDate: data.publicationDate ? new Date(data.publicationDate) : null,
                        ratingsAvg: data.rating,
                        reviewsCount: data.reviewCount,
                        lastScrapedAt: new Date(data.scrapedAt),
                    },
                });
            } catch (error) {
                console.error(`[DB] Failed to save Product Detail ${data.title}:`, error);
            }
        }
    }

    async saveAll(): Promise<void> {
        // Save to JSON files
        await Promise.all([
            saveToJson('navigation.json', this.navigation),
            saveToJson('categories.json', this.categories),
            saveToJson('products.json', this.products),
            saveToJson('product-details.json', this.productDetails),
        ]);
        console.log('\n✅ Data saved to local files successfully');
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
