'use client';

import { useQuery } from '@tanstack/react-query';
import { navigationApi } from '@/lib/api';
import Link from 'next/link';

export function Navigation() {
    const { data, isLoading, error } = useQuery({
        queryKey: ['navigation'],
        queryFn: navigationApi.getAll,
    });

    if (isLoading) {
        return (
            <nav className="bg-gray-900 text-white">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex flex-wrap gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="h-6 w-24 bg-gray-700 animate-pulse rounded"
                            />
                        ))}
                    </div>
                </div>
            </nav>
        );
    }

    if (error) {
        return (
            <nav className="bg-gray-900 text-white">
                <div className="container mx-auto px-4 py-4">
                    <p className="text-red-400 text-sm">Failed to load navigation</p>
                </div>
            </nav>
        );
    }

    return (
        <nav className="bg-gray-900 text-white" role="navigation" aria-label="Main navigation">
            <div className="container mx-auto px-4 py-4">
                <div className="flex flex-wrap gap-6 items-center">
                    <Link
                        href="/"
                        className="text-xl font-bold hover:text-blue-400 transition-colors"
                    >
                        World of Books
                    </Link>
                    {data && data.length > 0 && (
                        <>
                            <span className="text-gray-600">|</span>
                            {data.map((item) => (
                                <Link
                                    key={item.id}
                                    href={`/navigation/${item.id}`}
                                    className="hover:text-blue-400 transition-colors"
                                >
                                    {item.title}
                                </Link>
                            ))}
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}
