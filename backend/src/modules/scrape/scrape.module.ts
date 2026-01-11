import { Module } from '@nestjs/common';
import { ScrapePolicyService } from './scrape-policy.service';
import { ScrapeQueueService } from './scrape-queue.service';

@Module({
  providers: [ScrapePolicyService, ScrapeQueueService],
  exports: [ScrapePolicyService, ScrapeQueueService],
})
export class ScrapeModule {}
