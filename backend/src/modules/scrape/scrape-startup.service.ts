/**
 * Scrape Startup Service
 * 
 * Automatically triggers navigation scrape on startup if Navigation table is empty.
 * Only runs when SCRAPE_QUEUE_ENABLED=true.
 */

import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ScrapeQueueService } from './scrape-queue.service';

@Injectable()
export class ScrapeStartupService implements OnModuleInit {
    constructor(
        private readonly prisma: PrismaService,
        private readonly scrapeQueue: ScrapeQueueService,
    ) { }

    async onModuleInit() {
        const isQueueEnabled = process.env.SCRAPE_QUEUE_ENABLED === 'true';

        if (!isQueueEnabled) {
            console.log('[SCRAPE STARTUP] Queue disabled - skipping auto-scrape check');
            return;
        }

        try {
            console.log('[SCRAPE STARTUP] Checking Navigation table...');

            const navigationCount = await this.prisma.navigation.count();

            if (navigationCount === 0) {
                console.log('[SCRAPE STARTUP] Navigation table empty - triggering initial scrape');
                await this.scrapeQueue.enqueueNavigation();
                console.log('[SCRAPE STARTUP] Initial navigation scrape enqueued');
            } else {
                console.log(`[SCRAPE STARTUP] Navigation table has ${navigationCount} items - skipping auto-scrape`);
            }
        } catch (error) {
            console.error('[SCRAPE STARTUP] Error checking navigation table:', error);
        }
    }
}
