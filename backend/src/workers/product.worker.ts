import { PlaywrightCrawler } from 'crawlee';

export const productCrawler = new PlaywrightCrawler({
  maxConcurrency: 2,
  requestHandlerTimeoutSecs: 120,

  async requestHandler({ page, request }) {
    await page.waitForLoadState('domcontentloaded');

    // polite delay
    await new Promise((r) => setTimeout(r, 2000));

    const title = await page.locator('h1').first().textContent();

    // TODO: extract price, description, etc

    console.log('[SCRAPED PRODUCT]', title, request.url);

    // TODO: save to DB and update lastScrapedAt
  },
});
