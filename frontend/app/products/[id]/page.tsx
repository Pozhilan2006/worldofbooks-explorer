'use client';

import { useQuery, useMutation } from '@tanstack/react-query';
import { productsApi, viewHistoryApi } from '@/lib/api';
import Link from 'next/link';
import { Navigation } from '@/components/Navigation';
import Image from 'next/image';
import { use, useEffect } from 'react';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const productId = resolvedParams.id;

    const { data, isLoading, error } = useQuery({
        queryKey: ['product', productId],
        queryFn: () => productsApi.getById(productId),
    });

    const trackViewMutation = useMutation({
        mutationFn: () =>
            viewHistoryApi.track({
                path: `/products/${productId}`,
                title: data?.title,
                productId,
            }),
    });

    useEffect(() => {
        if (productId && data) {
            trackViewMutation.mutate();
        }
    }, [productId, data?.title]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <main className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="animate-pulse space-y-8">
                            <div className="h-8 bg-gray-200 rounded w-1/3" />
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="h-96 bg-gray-200 rounded" />
                                <div className="space-y-4">
                                    <div className="h-8 bg-gray-200 rounded" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                    <div className="h-6 bg-gray-200 rounded w-1/4" />
                                    <div className="h-32 bg-gray-200 rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <main className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="p-12 bg-red-50 text-red-800 rounded-lg text-center border border-red-200">
                            <p className="text-xl font-semibold mb-2">Failed to load product</p>
                            <p className="text-sm mb-4">Please check your backend connection</p>
                            <Link
                                href="/"
                                className="inline-block text-blue-600 hover:underline font-medium"
                            >
                                Return to Home
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navigation />
                <main className="container mx-auto px-4 py-8">
                    <div className="max-w-6xl mx-auto">
                        <div className="p-12 bg-yellow-50 text-yellow-800 rounded-lg text-center border border-yellow-200">
                            <p className="text-xl font-semibold mb-2">Product not found</p>
                            <Link
                                href="/"
                                className="inline-block text-blue-600 hover:underline font-medium"
                            >
                                Return to Home
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation />

            <main className="container mx-auto px-4 py-8">
                <div className="max-w-6xl mx-auto">
                    <div className="mb-6">
                        <Link
                            href={`/categories/${data.categoryId}`}
                            className="text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center"
                        >
                            <span className="mr-2">←</span> Back to Products
                        </Link>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        <div className="grid md:grid-cols-2 gap-8 p-8">
                            {/* Product Image */}
                            <div>
                                {data.imageUrl ? (
                                    <div className="relative h-96 bg-gray-100 rounded-lg">
                                        <Image
                                            src={data.imageUrl}
                                            alt={data.title}
                                            fill
                                            className="object-contain p-4"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            priority
                                        />
                                    </div>
                                ) : (
                                    <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                                        <span className="text-gray-400 text-lg">
                                            No Image Available
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                        {data.title}
                                    </h1>
                                    {data.author && (
                                        <p className="text-xl text-gray-600">by {data.author}</p>
                                    )}
                                </div>

                                {data.price && (
                                    <p className="text-3xl font-bold text-green-600">
                                        {data.currency || 'GBP'} {data.price}
                                    </p>
                                )}

                                {data.description && (
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                            Description
                                        </h2>
                                        <p className="text-gray-700 leading-relaxed">
                                            {data.description}
                                        </p>
                                    </div>
                                )}

                                {/* Product Details */}
                                <div className="border-t pt-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                        Product Details
                                    </h2>
                                    <dl className="space-y-2">
                                        {data.isbn && (
                                            <div className="flex">
                                                <dt className="font-medium text-gray-600 w-32">
                                                    ISBN:
                                                </dt>
                                                <dd className="text-gray-900">{data.isbn}</dd>
                                            </div>
                                        )}
                                        {data.publisher && (
                                            <div className="flex">
                                                <dt className="font-medium text-gray-600 w-32">
                                                    Publisher:
                                                </dt>
                                                <dd className="text-gray-900">{data.publisher}</dd>
                                            </div>
                                        )}
                                        {data.publicationDate && (
                                            <div className="flex">
                                                <dt className="font-medium text-gray-600 w-32">
                                                    Published:
                                                </dt>
                                                <dd className="text-gray-900">
                                                    {new Date(
                                                        data.publicationDate,
                                                    ).toLocaleDateString()}
                                                </dd>
                                            </div>
                                        )}
                                        {data.ratingsAvg !== undefined && (
                                            <div className="flex">
                                                <dt className="font-medium text-gray-600 w-32">
                                                    Rating:
                                                </dt>
                                                <dd className="text-gray-900">
                                                    {data.ratingsAvg.toFixed(1)} / 5.0
                                                </dd>
                                            </div>
                                        )}
                                    </dl>
                                </div>

                                {/* External Link */}
                                <a
                                    href={data.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                                >
                                    View on World of Books
                                </a>
                            </div>
                        </div>

                        {/* Reviews Section */}
                        {data.reviews && data.reviews.length > 0 && (
                            <div className="border-t p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Reviews</h2>
                                <div className="space-y-6">
                                    {data.reviews.map((review) => (
                                        <div key={review.id} className="bg-gray-50 rounded-lg p-6">
                                            <div className="flex items-start justify-between mb-3">
                                                <div>
                                                    {review.author && (
                                                        <p className="font-semibold text-gray-900">
                                                            {review.author}
                                                        </p>
                                                    )}
                                                    {review.rating !== undefined &&
                                                        review.rating !== null && (
                                                            <div className="flex items-center mt-1">
                                                                <span className="text-yellow-500 font-bold">
                                                                    {review.rating}
                                                                </span>
                                                                <span className="text-gray-600 ml-1">
                                                                    / 5
                                                                </span>
                                                            </div>
                                                        )}
                                                </div>
                                                {review.reviewDate && (
                                                    <p className="text-sm text-gray-500">
                                                        {new Date(
                                                            review.reviewDate,
                                                        ).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                            <p className="text-gray-700 leading-relaxed">
                                                {review.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Related Products */}
                        {data.relatedProducts && data.relatedProducts.length > 0 && (
                            <div className="border-t p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                    Related Products
                                </h2>
                                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {data.relatedProducts.map((related) => (
                                        <Link
                                            key={related.id}
                                            href={`/products/${related.relatedProductId}`}
                                            className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            {related.relatedProduct && (
                                                <>
                                                    <p className="text-sm text-gray-900 line-clamp-3 font-medium mb-2">
                                                        {related.relatedProduct.title}
                                                    </p>
                                                    <p className="text-xs text-blue-600">
                                                        View Product →
                                                    </p>
                                                </>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
