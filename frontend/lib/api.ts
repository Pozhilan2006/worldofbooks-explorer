const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * API client configuration
 */
export const apiClient = {
    baseURL: `${API_BASE_URL}`,
    timeout: 10000,
};

/**
 * Generic fetch wrapper with error handling
 */
export async function fetchAPI<T>(
    endpoint: string,
    options?: RequestInit,
): Promise<T> {
    const url = `${apiClient.baseURL}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({
                message: 'An error occurred',
            }));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

/**
 * Product Types
 */
export interface Product {
    id: string;
    categoryId?: string;
    sourceId: string;
    title: string;
    author?: string;
    price?: string;
    currency?: string;
    imageUrl?: string;
    sourceUrl: string;
    category?: {
        id: string;
        title: string;
        slug: string;
    };
    detail?: {
        description?: string;
        ratingsAvg?: string;
        reviewsCount?: number;
    };
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

/**
 * Fetch products from the API
 */
export async function fetchProducts(
    params: ProductsQueryParams = {},
): Promise<PaginatedResponse<Product>> {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            queryParams.append(key, String(value));
        }
    });

    const endpoint = `/products?${queryParams.toString()}`;
    return fetchAPI<PaginatedResponse<Product>>(endpoint);
}

/**
 * View History Types
 */
export interface ViewHistory {
    id: string;
    sessionId: string;
    productId?: string;
    categoryId?: string;
    path: string;
    title?: string;
    viewedAt: string;
    product?: Product;
    category?: {
        id: string;
        title: string;
        slug: string;
    };
}

export interface TrackViewDto {
    path: string;
    title?: string;
    productId?: string;
    categoryId?: string;
}

/**
 * Track a page view
 */
export async function trackPageView(data: TrackViewDto): Promise<void> {
    try {
        await fetchAPI('/view-history', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    } catch (error) {
        // Silently fail - don't block user experience
        console.error('Failed to track page view:', error);
    }
}

/**
 * Get user's navigation history
 */
export async function getViewHistory(limit = 20): Promise<ViewHistory[]> {
    return fetchAPI<ViewHistory[]>(`/view-history?limit=${limit}`);
}

/**
 * Get recently viewed products
 */
export async function getRecentProducts(limit = 10): Promise<Product[]> {
    return fetchAPI<Product[]>(`/view-history/products?limit=${limit}`);
}

/**
 * Clear user's history
 */
export async function clearViewHistory(): Promise<void> {
    await fetchAPI('/view-history', {
        method: 'DELETE',
    });
}
