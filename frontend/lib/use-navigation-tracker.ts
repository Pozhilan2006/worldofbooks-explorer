/**
 * Navigation Tracker Hook
 * 
 * Automatically tracks page views on route changes
 */

'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/api';

export function useNavigationTracker() {
    const pathname = usePathname();

    useEffect(() => {
        // Track page view on route change
        const trackView = async () => {
            // Extract product ID from path if present
            const productMatch = pathname.match(/\/products\/([^/]+)/);
            const productId = productMatch ? productMatch[1] : undefined;

            // Extract category ID from path if present
            const categoryMatch = pathname.match(/\/categories\/([^/]+)/);
            const categoryId = categoryMatch ? categoryMatch[1] : undefined;

            await trackPageView({
                path: pathname,
                title: document.title,
                productId,
                categoryId,
            });
        };

        // Debounce to avoid tracking rapid navigation
        const timeoutId = setTimeout(trackView, 500);

        return () => clearTimeout(timeoutId);
    }, [pathname]);
}
