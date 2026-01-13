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
  // Use a static forRoot that just returns the module itself for compatibility
  // with previous dynamic usage, or simplified.
  // The user requested standard module structure but I should keep forRoot 
  // if other modules rely on it or update them.
  // Actually, feature modules are calling ScrapeModule.forRoot(). 
  // Let's keep forRoot but simplify implementation as much as possible OR 
  // just export the class and make forRoot return the same structure.

  static forRoot() {
    return {
      module: ScrapeModule,
      imports: [
        DatabaseModule,
        ...(process.env.REDIS_URL_INTERNAL
          ? [
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
