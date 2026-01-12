import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { QueryProvider } from '@/lib/query-provider';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'World of Books Explorer',
    description: 'Explore and discover books from World of Books',
    keywords: ['books', 'world of books', 'book explorer', 'online books'],
    authors: [{ name: 'World of Books Explorer Team' }],
    viewport: 'width=device-width, initial-scale=1',
    themeColor: [
        { media: '(prefers-color-scheme: light)', color: '#ffffff' },
        { media: '(prefers-color-scheme: dark)', color: '#0a0a0a' },
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
            <body className="antialiased">
                <QueryProvider>
                    {/* Skip to main content for keyboard navigation */}
                    <a href="#main-content" className="skip-to-main">
                        Skip to main content
                    </a>

                    {/* Main application wrapper */}
                    <div className="flex min-h-screen flex-col">
                        {/* Header/Navigation will go here */}
                        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                            <div className="container mx-auto flex h-16 items-center px-4">
                                <nav className="flex flex-1 items-center justify-between">
                                    <h1 className="text-xl font-bold">World of Books Explorer</h1>
                                    {/* Navigation items will be added here */}
                                </nav>
                            </div>
                        </header>

                        {/* Main content area */}
                        <main id="main-content" className="flex-1">
                            {children}
                        </main>

                        {/* Footer */}
                        <footer className="border-t py-6 md:py-0">
                            <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:h-16 md:flex-row">
                                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                                    Built with Next.js and NestJS. © {new Date().getFullYear()} World of Books
                                    Explorer.
                                </p>
                            </div>
                        </footer>
                    </div>
                </QueryProvider>
            </body>
        </html>
    );
}
