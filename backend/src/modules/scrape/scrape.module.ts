import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScrapePolicyService } from './scrape-policy.service';
import { ScrapeQueueService } from './scrape-queue.service';
import { ScrapeStartupService } from './scrape-startup.service';
import { ScrapeController } from './scrape.controller';
import { ScrapeService } from './scrape.service';
import { DatabaseModule } from '../../database/database.module';
import { redisConnection } from '../../redis/redis.config';

@Module({
  imports: [
    DatabaseModule,
    // Register Bull with strict connection
    BullModule.forRoot({
      connection: redisConnection as any,
    }),
    BullModule.registerQueue({
      name: 'scrape-queue',
    }),
  ],
  controllers: [ScrapeController],
  providers: [
    ScrapeService,
    ScrapePolicyService,
    ScrapeQueueService,
    ScrapeStartupService,
  ],
  exports: [ScrapePolicyService, ScrapeQueueService],
})
export class ScrapeModule {
  static forRoot() {
    return {
      module: ScrapeModule,
      imports: [
        DatabaseModule,
        BullModule.forRoot({
          connection: redisConnection as any,
        }),
        BullModule.registerQueue({
          name: 'scrape-queue',
        }),
      ],
      controllers: [ScrapeController],
      providers: [
        ScrapeService,
        ScrapePolicyService,
        ScrapeQueueService,
        ScrapeStartupService,
      ],
      exports: [ScrapePolicyService, ScrapeQueueService],
    };
  }
}
