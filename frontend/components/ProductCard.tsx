/**
 * Product Card Component
 * 
 * Displays a single product with accessible markup
 */

import { Product } from '@/lib/api';
import Link from 'next/link';

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { id, title, author, price, currency, imageUrl, category } = product;

    return (
        <article className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
            <Link
                href={`/products/${id}`}
                className="block focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
            >
                {/* Product image */}
                <div className="w-full h-48 bg-gray-100 rounded-md mb-4 overflow-hidden">
                    {imageUrl ? (
                        <img
                            src={imageUrl}
                            alt={author ? `${title} by ${author}` : title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <svg
                                className="w-16 h-16"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Product info */}
                <div>
                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                        {title}
                    </h3>

                    {author && (
                        <p className="text-sm text-gray-600 mb-2">by {author}</p>
                    )}

                    {category && (
                        <p className="text-xs text-gray-500 mb-2">{category.title}</p>
                    )}

                    {price && (
                        <p className="text-lg font-bold text-blue-600">
                            {currency === 'GBP' ? '£' : '$'}
                            {price}
                        </p>
                    )}
                </div>
            </Link>
        </article>
    );
}
