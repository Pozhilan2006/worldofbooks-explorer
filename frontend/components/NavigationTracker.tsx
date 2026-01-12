/**
 * Navigation Tracker Component
 * 
 * Client component that tracks navigation across the app
 */

'use client';

import { useNavigationTracker } from '@/lib/use-navigation-tracker';

export function NavigationTracker() {
    useNavigationTracker();
    return null; // This component doesn't render anything
}
