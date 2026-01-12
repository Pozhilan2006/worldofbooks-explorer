/**
 * React Query Provider
 * 
 * Configures TanStack Query for the application with:
 * - Background refetch on window focus
 * - Stale time configuration
 * - Retry logic
 */

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

export function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Refetch on window focus
                        refetchOnWindowFocus: true,
                        // Refetch on reconnect
                        refetchOnReconnect: true,
                        // Retry failed requests
                        retry: 1,
                        // Consider data stale after 30 seconds
                        staleTime: 30 * 1000,
                    },
                },
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}
