export default function Home() {
    return (
        <div className="container mx-auto px-4 py-8">
            <section className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                <h2 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                    Welcome to World of Books Explorer
                </h2>
                <p className="mb-8 max-w-2xl text-lg text-muted-foreground">
                    Discover and explore books from the World of Books collection. Browse categories,
                    search for your favorite titles, and find your next great read.
                </p>
                <div className="flex gap-4">
                    <button className="rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600">
                        Get Started
                    </button>
                    <button className="rounded-lg border border-gray-300 px-6 py-3 font-semibold transition-colors hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 dark:border-gray-700 dark:hover:bg-gray-800">
                        Learn More
                    </button>
                </div>
            </section>
        </div>
    );
}
