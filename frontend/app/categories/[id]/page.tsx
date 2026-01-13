'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, scrapeApi } from '@/lib/api';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import Image from 'next/image';
import { use, useState } from 'react';

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const categoryId = resolvedParams.id;
    const [page, setPage] = useState(1);
    const limit = 24;
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['products', categoryId, page],
        queryFn: () => productsApi.getAll({ categoryId, page, limit }),
    });

    const scrapeMutation = useMutation({
        mutationFn: scrapeApi.triggerProducts,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', categoryId] });
        },
    });

    const totalPages = data ? data.meta.totalPages : 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-6">
                        <Link
                            href="/"
                            className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center"
                        >
                            <span className="mr-2">←</span> Back to Categories
                        </Link>
                    </div>

                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Products</h1>
                            {data && (
                                <p className="text-gray-600">
                                    Showing {data.data.length} of {data.meta.total} products
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => scrapeMutation.mutate()}
                            disabled={scrapeMutation.isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                            aria-label="Refresh products"
                        >
                            {scrapeMutation.isPending ? 'Scraping...' : 'Refresh Products'}
                        </button>
                    </div>

                    {scrapeMutation.isSuccess && (
                        <div className="mb-6 p-4 bg-green-50 text-green-800 rounded-lg border border-green-200">
                            ✓ Scrape triggered successfully! Data will refresh shortly.
                        </div>
                    )}

                    {scrapeMutation.isError && (
                        <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg border border-red-200">
                            ✗ Failed to trigger scrape. Please try again.
                        </div>
                    )}

                    {isLoading && (
                        <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                            {[...Array(12)].map((_, i) => (
                                <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
                                    <div className="h-64 bg-gray-200 animate-pulse" />
                                    <div className="p-4 space-y-3">
                                        <div className="h-4 bg-gray-200 animate-pulse rounded" />
                                        <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3" />
                                        <div className="h-6 bg-gray-200 animate-pulse rounded w-1/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="p-12 bg-red-50 text-red-800 rounded-lg text-center border border-red-200">
                            <p className="text-xl font-semibold mb-2">Failed to load products</p>
                            <p className="text-sm">Please check your backend connection</p>
                        </div>
                    )}

                    {data && data.data.length === 0 && (
                        <div className="p-12 bg-yellow-50 text-yellow-800 rounded-lg text-center border border-yellow-200">
                            <p className="text-xl font-semibold mb-2">
                                No products found in this category
                            </p>
                            <p className="text-sm mb-4">Click "Refresh Products" to scrape data</p>
                        </div>
                    )}

                    {data && data.data.length > 0 && (
                        <>
                            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
                                {data.data.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.id}`}
                                        className="block bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
                                    >
                                        {product.imageUrl ? (
                                            <div className="relative h-64 bg-gray-100">
                                                <Image
                                                    src={product.imageUrl}
                                                    alt={product.title}
                                                    fill
                                                    className="object-contain p-4"
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-64 bg-gray-200 flex items-center justify-center">
                                                <span className="text-gray-400">No Image</span>
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h2 className="text-lg font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                                                {product.title}
                                            </h2>
                                            {product.author && (
                                                <p className="text-sm text-gray-600 mb-2 line-clamp-1">
                                                    {product.author}
                                                </p>
                                            )}
                                            {product.price && (
                                                <p className="text-xl font-bold text-green-600">
                                                    {product.price}
                                                </p>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-8 flex justify-center gap-2">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Previous page"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 bg-gray-100 rounded-lg font-medium">
                                        Page {page} of {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Next page"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
