import { Module } from '@nestjs/common';
import { ScrapeQueueService } from './scrape-queue.service';

@Module({
  providers: [ScrapeQueueService],
  exports: [ScrapeQueueService],
})
export class ScrapeQueueModule {}
