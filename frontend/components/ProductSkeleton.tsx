/**
 * Product Card Skeleton
 * 
 * Loading skeleton for product cards
 */

export function ProductCardSkeleton() {
    return (
        <div
            className="border border-gray-200 rounded-lg p-4 animate-pulse"
            role="status"
            aria-label="Loading product"
        >
            {/* Image skeleton */}
            <div className="w-full h-48 bg-gray-200 rounded-md mb-4" />

            {/* Title skeleton */}
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />

            {/* Author skeleton */}
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />

            {/* Price skeleton */}
            <div className="h-6 bg-gray-200 rounded w-1/4" />

            <span className="sr-only">Loading...</span>
        </div>
    );
}

/**
 * Products Grid Skeleton
 */
export function ProductsGridSkeleton({ count = 12 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    );
}
