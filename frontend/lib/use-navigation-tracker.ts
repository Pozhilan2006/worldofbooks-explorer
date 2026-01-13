import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/api';

export function useNavigationTracker() {
    const pathname = usePathname();
    const lastTrackedPath = useRef<string | null>(null);

    useEffect(() => {
        // Prevent duplicate tracking for the same path
        if (lastTrackedPath.current === pathname) return;

        lastTrackedPath.current = pathname;

        // Extract IDs nicely
        const productId = pathname.match(/\/products\/([^/]+)/)?.[1];
        const categoryId = pathname.match(/\/categories\/([^/]+)/)?.[1];

        trackPageView({
            path: pathname,
            title: document.title,
            productId,
            categoryId,
        });

        // We only want to run this effect when pathname changes.
        // We intentionally exclude other dependencies to prevent infinite loops.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);
}

