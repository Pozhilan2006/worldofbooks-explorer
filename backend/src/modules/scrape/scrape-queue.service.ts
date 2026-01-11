import { Injectable } from '@nestjs/common';

@Injectable()
export class ScrapeQueueService {
  async enqueueProduct(url: string) {
    // TEMP placeholder (queue comes in Phase 5)
    console.log('[SCRAPE QUEUE] Product scrape enqueued:', url);
  }

  async enqueueCategory(url: string) {
    console.log('[SCRAPE QUEUE] Category scrape enqueued:', url);
  }
}
