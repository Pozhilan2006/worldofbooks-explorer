import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScrapePolicyService } from './scrape-policy.service';
import { ScrapeQueueService } from './scrape-queue.service';
import { ScrapeStartupService } from './scrape-startup.service';
import { ScrapeController } from './scrape.controller';
import { ScrapeService } from './scrape.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    // Only register Bull if Redis exists
    ...(process.env.REDIS_URL_INTERNAL
      ? [
        // Configure global Bull settings with connection string
        BullModule.forRoot({
          connection: {
            url: process.env.REDIS_URL_INTERNAL,
          },
        }),
        BullModule.registerQueue({
          name: 'scrape-queue',
        }),
      ]
      : []),
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
        ...(process.env.REDIS_URL_INTERNAL
          ? [
            BullModule.forRoot({
              connection: {
                url: process.env.REDIS_URL_INTERNAL,
              },
            }),
            BullModule.registerQueue({
              name: 'scrape-queue',
            }),
          ]
          : []),
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
