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

