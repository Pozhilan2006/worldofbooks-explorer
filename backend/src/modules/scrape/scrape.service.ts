import { Injectable, Logger, Optional, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ScrapeService implements OnModuleInit {
    private readonly logger = new Logger(ScrapeService.name);
    private readonly queueEnabled: boolean;

    constructor(
        private prisma: PrismaService,
        @Optional()
        @InjectQueue('scrape-queue') private scrapeQueue?: Queue,
    ) {
        this.queueEnabled = !!this.scrapeQueue;
    }

    /**
     * Auto-bootstrap: Trigger initial scrape on first startup if DB is empty
     */
    async onModuleInit() {
        if (!this.queueEnabled) {
            this.logger.warn('[SCRAPE BOOT] Queue disabled, skipping auto scrape');
            return;
        }

        try {
            const navCount = await this.prisma.navigation.count();

            if (navCount > 0) {
                this.logger.log('[SCRAPE BOOT] Navigation already exists, skipping');
                return;
            }

            this.logger.log('[SCRAPE BOOT] No navigation found. Triggering initial scrape');
            await this.scrapeNavigation();
        } catch (err) {
            this.logger.warn('[SCRAPE BOOT] DB not ready, skipping bootstrap');
        }
    }

    /**
     * NAVIGATION SCRAPE - Queue-based only
     * Enqueues navigation scraping job without blocking
     */
    async scrapeNavigation() {
        if (!this.queueEnabled) {
            this.logger.warn('[SCRAPE] Queue disabled');
            return { triggered: false, reason: 'queue_disabled' };
        }

        this.logger.log('[SCRAPE] Enqueuing navigation scrape job');
        await this.scrapeQueue!.add('navigation', {
            url: 'https://www.worldofbooks.com/en-gb',
        });

        return { triggered: true, reason: 'queued' };
    }

    // CATEGORY RULES
    async scrapeCategory(navigationId: string) {
        if (!this.scrapeQueue) {
            this.logger.warn('[SCRAPE] Queue disabled, skipping job enqueue');
            return { triggered: false, reason: 'queue_disabled', navigationId };
        }

        const count = await this.prisma.category.count({
            where: { navigationId },
        });

        if (count === 0) {
            this.logger.log(`Categories empty for navigation ${navigationId} → scraping`);
            await this.scrapeQueue.add('category', {
                navigationId,
                url: `https://www.worldofbooks.com/en-gb/navigation/${navigationId}`,
            });
            return { triggered: true, reason: 'empty', navigationId };
        }

        const categories = await this.prisma.category.findMany({
            where: { navigationId },
            orderBy: { lastScrapedAt: 'desc' },
            take: 1,
        });

        const last = categories[0];

        if (!last?.lastScrapedAt) {
            this.logger.log(`Categories for navigation ${navigationId} have no timestamp → scraping`);
            await this.scrapeQueue.add('category', {
                navigationId,
                url: `https://www.worldofbooks.com/en-gb/navigation/${navigationId}`,
            });
            return { triggered: true, reason: 'no_timestamp', navigationId };
        }

        const hours = (Date.now() - last.lastScrapedAt.getTime()) / 36e5;

        if (hours > 24) {
            this.logger.log(`Categories for navigation ${navigationId} stale (${hours.toFixed(1)}h) → re-scraping`);
            await this.scrapeQueue.add('category', {
                navigationId,
                url: `https://www.worldofbooks.com/en-gb/navigation/${navigationId}`,
            });
            return { triggered: true, reason: 'stale', hours: hours.toFixed(1), navigationId };
        }

        this.logger.log(`Categories for navigation ${navigationId} fresh (${hours.toFixed(1)}h) → skipping`);
        return { triggered: false, reason: 'fresh', hours: hours.toFixed(1), navigationId };
    }

    // PRODUCT RULES
    async scrapeProduct(categoryId: string) {
        if (!this.scrapeQueue) {
            this.logger.warn('[SCRAPE] Queue disabled, skipping job enqueue');
            return { triggered: false, reason: 'queue_disabled', categoryId };
        }

        const count = await this.prisma.product.count({
            where: { categoryId },
        });

        if (count === 0) {
            this.logger.log(`Products empty for category ${categoryId} → scraping`);
            await this.scrapeQueue.add('product', {
                categoryId,
                url: `https://www.worldofbooks.com/en-gb/category/${categoryId}`,
            });
            return { triggered: true, reason: 'empty', categoryId };
        }

        const products = await this.prisma.product.findMany({
            where: { categoryId },
            orderBy: { lastScrapedAt: 'desc' },
            take: 1,
        });

        const last = products[0];

        if (!last?.lastScrapedAt) {
            this.logger.log(`Products for category ${categoryId} have no timestamp → scraping`);
            await this.scrapeQueue.add('product', {
                categoryId,
                url: `https://www.worldofbooks.com/en-gb/category/${categoryId}`,
            });
            return { triggered: true, reason: 'no_timestamp', categoryId };
        }

        const hours = (Date.now() - last.lastScrapedAt.getTime()) / 36e5;

        if (hours > 12) {
            this.logger.log(`Products for category ${categoryId} stale (${hours.toFixed(1)}h) → re-scraping`);
            await this.scrapeQueue.add('product', {
                categoryId,
                url: `https://www.worldofbooks.com/en-gb/category/${categoryId}`,
            });
            return { triggered: true, reason: 'stale', hours: hours.toFixed(1), categoryId };
        }

        this.logger.log(`Products for category ${categoryId} fresh (${hours.toFixed(1)}h) → skipping`);
        return { triggered: false, reason: 'fresh', hours: hours.toFixed(1), categoryId };
    }
}

