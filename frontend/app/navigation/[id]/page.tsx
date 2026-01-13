'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi, scrapeApi } from '@/lib/api';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import { use } from 'react';

export default function NavigationPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const navigationId = resolvedParams.id;
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['categories', navigationId],
        queryFn: () => categoriesApi.getByNavigationId(navigationId),
    });

    const scrapeMutation = useMutation({
        mutationFn: scrapeApi.triggerCategories,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories', navigationId] });
        },
    });

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
                            <span className="mr-2">←</span> Back to Home
                        </Link>
                    </div>

                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">Categories</h1>
                            <p className="text-gray-600">Browse categories to find products</p>
                        </div>
                        <button
                            onClick={() => scrapeMutation.mutate()}
                            disabled={scrapeMutation.isPending}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
                            aria-label="Refresh categories"
                        >
                            {scrapeMutation.isPending ? 'Scraping...' : 'Refresh Categories'}
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
                        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {[...Array(12)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-32 bg-gray-200 animate-pulse rounded-lg"
                                />
                            ))}
                        </div>
                    )}

                    {error && (
                        <div className="p-12 bg-red-50 text-red-800 rounded-lg text-center border border-red-200">
                            <p className="text-xl font-semibold mb-2">Failed to load categories</p>
                            <p className="text-sm">Please check your backend connection</p>
                        </div>
                    )}

                    {data && data.length === 0 && (
                        <div className="p-12 bg-yellow-50 text-yellow-800 rounded-lg text-center border border-yellow-200">
                            <p className="text-xl font-semibold mb-2">No categories found</p>
                            <p className="text-sm mb-4">
                                Click "Refresh Categories" to scrape data
                            </p>
                        </div>
                    )}

                    {data && data.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                            {data.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/categories/${category.id}`}
                                    className="block p-5 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200 group"
                                >
                                    <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                        {category.title}
                                    </h2>
                                    {category.productCount > 0 && (
                                        <p className="text-sm text-gray-500 mb-3">
                                            {category.productCount} products
                                        </p>
                                    )}
                                    <p className="text-blue-600 text-sm font-medium flex items-center">
                                        View Products
                                        <span className="ml-2">→</span>
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
