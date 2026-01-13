/**
 * Scrape Module
 * 
 * Conditionally loads BullMQ based on SCRAPE_QUEUE_ENABLED environment variable.
 * This allows local development without Redis.
 */

import { Module, DynamicModule } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScrapePolicyService } from './scrape-policy.service';
import { ScrapeQueueService } from './scrape-queue.service';
import { ScrapeStartupService } from './scrape-startup.service';
import { ScrapeController } from './scrape.controller';
import { ScrapeService } from './scrape.service';
import { DatabaseModule } from '../../database/database.module';

@Module({})
export class ScrapeModule {
  static forRoot(): DynamicModule {
    // Check if Redis is available (not a boolean flag)
    // This allows Render to start without Redis initially
    const redisEnabled = !!process.env.REDIS_URL_INTERNAL;

    if (!redisEnabled) {
      console.log('[SCRAPE MODULE] Redis not available - queue disabled');
      return {
        module: ScrapeModule,
        imports: [DatabaseModule],
        controllers: [ScrapeController],
        providers: [ScrapePolicyService, ScrapeService],
        exports: [ScrapePolicyService],
      };
    }

    console.log('[SCRAPE MODULE] Redis available - initializing BullMQ');
    return {
      module: ScrapeModule,
      imports: [
        DatabaseModule,
        BullModule.registerQueue({
          name: 'scrape-queue',
        }),
      ],
      controllers: [ScrapeController],
      providers: [
        ScrapePolicyService,
        ScrapeQueueService,
        ScrapeStartupService,
        ScrapeService,
      ],
      exports: [ScrapePolicyService, ScrapeQueueService],
    };
  }
}
