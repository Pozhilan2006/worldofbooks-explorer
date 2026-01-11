# World of Books Scraper

## Overview
A production-ready web scraper for World of Books (https://www.worldofbooks.com/en-gb) built with Crawlee and Playwright.

## Features

✅ **Robots.txt Compliance**
- Respects disallowed paths
- Only scrapes allowed collections and products
- Avoids search, cart, checkout, and admin pages

✅ **Rate Limiting**
- Max concurrency: 2 requests
- Random delay: 3-5 seconds between requests
- ~12 requests per minute maximum

✅ **Retry Logic**
- Exponential backoff (1s → 2s → 4s → 8s)
- Max 3 retry attempts
- Automatic retry on network errors

✅ **Defensive Selectors**
- Multiple fallback selectors for each element
- Graceful degradation if elements not found
- Continues scraping even if optional fields missing

✅ **Data Extraction**
- Navigation menu items
- Category information
- Product listings
- Product details (title, author, price, ISBN, etc.)

## Installation

```bash
cd backend
npm install
```

This will install:
- `crawlee` - Web scraping framework
- `playwright` - Browser automation

## Usage

### Run the Scraper

```bash
npm run scraper
```

### Development Mode (with auto-restart)

```bash
npm run scraper:dev
```

### Output

Scraped data is saved to `backend/storage/`:
- `navigation.json` - Navigation menu items
- `categories.json` - Category information
- `products.json` - Product listings
- `product-details.json` - Detailed product information

## Configuration

Edit `src/workers/scraper/scraper.config.ts` to adjust:

```typescript
export const SCRAPER_CONFIG = {
  maxConcurrency: 2,        // Max concurrent requests
  minDelayMs: 3000,         // Min delay (3 seconds)
  maxDelayMs: 5000,         // Max delay (5 seconds)
  maxRetries: 3,            // Retry attempts
  
  // Limits (for testing/safety)
  maxCategoriesPerNav: 10,  // Categories per navigation
  maxProductsPerCategory: 50, // Products per category
  maxProductDetails: 100,   // Product detail pages
  
  headless: true,           // Run browser in headless mode
};
```

## Architecture

```
scraper/
├── scraper.ts                    # Main entry point
├── scraper.config.ts             # Configuration
├── handlers/
│   ├── navigation.handler.ts     # Extract navigation
│   ├── category.handler.ts       # Extract categories
│   └── product.handler.ts        # Extract product details
└── utils/
    ├── selectors.ts              # Defensive CSS selectors
    ├── retry.ts                  # Retry logic
    └── storage.ts                # Data storage
```

## Data Flow

```
1. Homepage (Navigation)
   ↓
2. Extract navigation links
   ↓
3. Enqueue category pages
   ↓
4. Extract category info + product listings
   ↓
5. Enqueue product detail pages
   ↓
6. Extract detailed product information
   ↓
7. Save to JSON files
```

## Extracted Data

### Navigation
```json
{
  "title": "Fiction Books",
  "slug": "fiction-books",
  "sourceUrl": "https://www.worldofbooks.com/en-gb/collections/fiction",
  "scrapedAt": "2024-01-11T10:00:00.000Z"
}
```

### Category
```json
{
  "navigationTitle": "Fiction Books",
  "title": "Mystery & Thriller",
  "slug": "mystery-thriller",
  "sourceUrl": "https://...",
  "description": "Gripping mysteries and thrillers",
  "productCount": 150,
  "scrapedAt": "2024-01-11T10:00:00.000Z"
}
```

### Product
```json
{
  "sourceId": "the-great-mystery",
  "categoryUrl": "https://...",
  "title": "The Great Mystery",
  "author": "John Doe",
  "price": 19.99,
  "currency": "GBP",
  "imageUrl": "https://...",
  "sourceUrl": "https://...",
  "scrapedAt": "2024-01-11T10:00:00.000Z"
}
```

### Product Detail
```json
{
  "sourceId": "the-great-mystery",
  "title": "The Great Mystery",
  "author": "John Doe",
  "price": 19.99,
  "currency": "GBP",
  "imageUrl": "https://...",
  "sourceUrl": "https://...",
  "description": "A thrilling mystery novel...",
  "isbn": "978-1234567890",
  "publisher": "Mystery Press",
  "publicationDate": "2023-01-15",
  "rating": 4.5,
  "reviewCount": 120,
  "specs": { "pages": 350, "format": "Hardcover" },
  "scrapedAt": "2024-01-11T10:00:00.000Z"
}
```

## Robots.txt Compliance

Based on https://www.worldofbooks.com/robots.txt:

**Allowed:**
- `/collections/*` ✅
- `/products/*` ✅

**Disallowed (avoided):**
- `/search` ❌
- `/cart`, `/checkout`, `/orders` ❌
- `/admin`, `/account` ❌
- Filtered/sorted URLs (`*sort_by*`, `*filter*`) ❌

## Error Handling

- **Network errors**: Automatic retry with exponential backoff
- **Missing elements**: Graceful degradation, continues scraping
- **Timeouts**: 30-second timeout per page
- **Screenshots**: Saved on error (if enabled)

## Limitations

Current limits (configurable):
- 1 navigation page
- 10 categories per navigation
- 50 products per category
- 100 product detail pages

To scrape more, adjust limits in `scraper.config.ts`.

## Ethical Considerations

⚠️ **Important:**
- This scraper is for educational/personal use
- Ensure you have permission to scrape World of Books
- Consider using their API if available
- Respect their terms of service
- Use appropriate rate limiting

## Troubleshooting

### Memory Issues During Installation

If `npm install` fails with memory errors:

```bash
# Install dependencies separately
npm install crawlee
npm install playwright

# Or increase Node.js memory
set NODE_OPTIONS=--max-old-space-size=4096
npm install
```

### Playwright Browser Installation

After installing Playwright, install browsers:

```bash
npx playwright install
```

### Scraper Not Finding Elements

1. Check if website structure changed
2. Update selectors in `utils/selectors.ts`
3. Run in non-headless mode to debug:
   ```typescript
   headless: false  // in scraper.config.ts
   ```

### Rate Limiting Issues

If you get blocked:
1. Increase delays in `scraper.config.ts`
2. Reduce concurrency to 1
3. Add longer delays between requests

## Integration with Database

To save data to PostgreSQL instead of JSON:

1. Import Prisma service in handlers
2. Replace `storage.addX()` calls with Prisma queries
3. Use the existing Navigation, Category, Product modules

Example:
```typescript
// In category.handler.ts
import { PrismaService } from '../../database/prisma.service';

const prisma = new PrismaService();
await prisma.category.create({ data: categoryData });
```

## License

MIT
