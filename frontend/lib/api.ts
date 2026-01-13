// Use NEXT_PUBLIC_API_BASE for production URL, fallback to Render URL if missing
const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE ??
    'https://worldofbooks-backend.onrender.com/api';


/**
 * Generic fetch wrapper with error handling
 * usage: fetchAPI('/view-history', ...) -> calls ${API_BASE}/view-history
 */
export async function fetchAPI<T>(
    path: string,
    options?: RequestInit,
): Promise<T> {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    const response = await fetch(`${API_BASE}${normalizedPath}`, {
        credentials: 'include', // Include cookies for session management
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
