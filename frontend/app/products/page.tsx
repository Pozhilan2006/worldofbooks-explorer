/**
 * Products Page
 * 
 * Displays a paginated list of products using React Query with:
 * - Skeleton loading states
 * - Error handling with retry
 * - Background refetch on window focus
 * - Accessible markup
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';
import { ProductsGridSkeleton } from '@/components/ProductSkeleton';
import { ErrorDisplay } from '@/components/ErrorDisplay';
import { useState } from 'react';

export default function ProductsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');

    // React Query hook with background refetch
    const {
        data,
        isLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useQuery({
        queryKey: ['products', { page, search }],
        queryFn: () => fetchProducts({ page, limit: 12, search: search || undefined }),
        // Background refetch enabled by default in provider
        staleTime: 30 * 1000, // 30 seconds
    });

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const searchValue = formData.get('search') as string;
        setSearch(searchValue);
        setPage(1); // Reset to first page on new search
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        World of Books Explorer
                    </h1>

                    {/* Search form */}
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <label htmlFor="search" className="sr-only">
                            Search products
                        </label>
                        <input
                            type="search"
                            id="search"
                            name="search"
                            placeholder="Search books..."
                            defaultValue={search}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            aria-label="Search for books by title or author"
                        />
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Search
                        </button>
                    </form>

                    {/* Background refetch indicator */}
                    {isFetching && !isLoading && (
                        <div
                            className="mt-2 text-sm text-blue-600"
                            role="status"
                            aria-live="polite"
                        >
                            Updating...
                        </div>
                    )}
                </header>

                {/* Loading state */}
                {isLoading && (
                    <ProductsGridSkeleton count={12} />
                )}

                {/* Error state */}
                {isError && (
                    <ErrorDisplay
                        error={error as Error}
                        onRetry={() => refetch()}
                    />
                )}

                {/* Success state */}
                {data && !isLoading && (
                    <>
                        {/* Results count */}
                        <div className="mb-4" role="status" aria-live="polite">
                            <p className="text-sm text-gray-600">
                                Showing {data.data.length} of {data.meta.total} products
                                {search && ` for "${search}"`}
                            </p>
                        </div>

                        {/* Products grid */}
                        {data.data.length > 0 ? (
                            <div
                                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8"
                                role="list"
                            >
                                {data.data.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-500 text-lg">
                                    No products found
                                    {search && ` for "${search}"`}
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {data.meta.totalPages > 1 && (
                            <nav
                                className="flex justify-center items-center gap-2"
                                aria-label="Pagination"
                            >
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Go to previous page"
                                >
                                    Previous
                                </button>

                                <span className="text-sm text-gray-700" aria-current="page">
                                    Page {page} of {data.meta.totalPages}
                                </span>

                                <button
                                    onClick={() => setPage((p) => Math.min(data.meta.totalPages, p + 1))}
                                    disabled={page === data.meta.totalPages}
                                    className="px-4 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    aria-label="Go to next page"
                                >
                                    Next
                                </button>
                            </nav>
                        )}
                    </>
                )}
            </div>
        </main>
    );
}
