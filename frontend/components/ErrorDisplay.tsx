/**
 * Error Display Component
 * 
 * Accessible error display with retry functionality
 */

interface ErrorDisplayProps {
    error: Error;
    onRetry?: () => void;
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
    return (
        <div
            className="bg-red-50 border border-red-200 rounded-lg p-6 text-center"
            role="alert"
            aria-live="assertive"
        >
            <div className="flex flex-col items-center gap-4">
                {/* Error icon */}
                <svg
                    className="w-12 h-12 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>

                {/* Error message */}
                <div>
                    <h2 className="text-lg font-semibold text-red-900 mb-2">
                        Failed to Load Products
                    </h2>
                    <p className="text-red-700 text-sm">
                        {error.message || 'An unexpected error occurred'}
                    </p>
                </div>

                {/* Retry button */}
                {onRetry && (
                    <button
                        onClick={onRetry}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                        aria-label="Retry loading products"
                    >
                        Try Again
                    </button>
                )}
            </div>
        </div>
    );
}
