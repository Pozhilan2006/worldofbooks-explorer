// Use NEXT_PUBLIC_API_BASE for production URL, fallback to local for development
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000/api';

/**
 * Generic fetch wrapper with error handling
 */
export async function fetchAPI<T>(
    path: string,
    options?: RequestInit,
): Promise<T> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    const response = await fetch(`${API_BASE}${normalizedPath}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options?.headers || {}),
        },
        ...options,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error ${response.status}`);
    }

    return response.json();
}

/**
 * Type Definitions
 */

export interface Navigation {
    id: string;
    title: string;
    slug: string;
    sourceUrl: string;
    lastScrapedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Category {
    id: string;
    navigationId: string;
    title: string;
    slug: string;
    sourceUrl: string;
    productCount: number;
    lastScrapedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: string;
    categoryId: string;
    sourceId: string;
    title: string;
    author?: string;
    price?: string;
    currency?: string;
    imageUrl?: string;
    sourceUrl: string;
    lastScrapedAt: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Review {
    id: string;
    productId: string;
    author?: string;
    rating?: number;
    text: string;
    reviewDate?: string;
    createdAt: string;
}

export interface RelatedProduct {
    id: string;
    productId: string;
    relatedProductId: string;
    relatedProduct?: Product;
}

export interface ProductDetail extends Product {
    description?: string;
    publisher?: string;
    publicationDate?: string;
    isbn?: string;
    ratingsAvg?: number;
    reviewsCount?: number;
    reviews: Review[];
    relatedProducts: RelatedProduct[];
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

export interface ProductsQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    sortBy?: 'title' | 'price' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
}

export interface TrackViewDto {
    path: string;
    title?: string;
    productId?: string;
    categoryId?: string;
}

/**
 * API Functions
 */

// Navigation API
export const navigationApi = {
    getAll: () => fetchAPI<Navigation[]>('/navigation'),
    getById: (id: string) => fetchAPI<Navigation>(`/navigation/${id}`),
};

// Categories API
export const categoriesApi = {
    getAll: () => fetchAPI<Category[]>('/categories'),
    getByNavigationId: (navigationId: string) =>
        fetchAPI<Category[]>(`/categories?navigationId=${navigationId}`),
    getById: (id: string) => fetchAPI<Category>(`/categories/${id}`),
};

// Products API
export const productsApi = {
    getAll: (params: ProductsQueryParams = {}) => {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, String(value));
            }
        });
        return fetchAPI<PaginatedResponse<Product>>(`/products?${queryParams.toString()}`);
    },
    getById: (id: string) => fetchAPI<ProductDetail>(`/products/${id}`),
};

// Scrape API
export const scrapeApi = {
    triggerNavigation: () => fetchAPI('/scrape/navigation', { method: 'POST' }),
    triggerCategories: () => fetchAPI('/scrape/categories', { method: 'POST' }),
    triggerProducts: () => fetchAPI('/scrape/products', { method: 'POST' }),
};

// View History API
export const viewHistoryApi = {
    track: (data: TrackViewDto) =>
        fetchAPI('/view-history', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

/**
 * Helper function for navigation tracking
 * Silently fails to not block user experience
 */
export async function trackPageView(data: TrackViewDto): Promise<void> {
    try {
        await viewHistoryApi.track(data);
    } catch (error) {
        // Silently fail - don't block user experience
        console.error('Failed to track page view:', error);
    }
}
