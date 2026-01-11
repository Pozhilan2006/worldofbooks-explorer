const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * API client configuration
 */
export const apiClient = {
    baseURL: `${API_BASE_URL}/api`,
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
 * Health check endpoint
 */
export async function checkHealth() {
    return fetchAPI<{ status: string; timestamp: string; environment: string; version: string }>(
        '/health',
    );
}
