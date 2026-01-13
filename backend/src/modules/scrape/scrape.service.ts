import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class ScrapeService {
    private readonly logger = new Logger(ScrapeService.name);

    constructor(
        private prisma: PrismaService,
        @InjectQueue('scrape-queue') private scrapeQueue: Queue,
    ) { }

    // NAVIGATION RULES
    async scrapeNavigation() {
        const count = await this.prisma.navigation.count();

        if (count === 0) {
            this.logger.log('Navigation empty → scraping');
            await this.scrapeQueue.add('navigation', {
                url: 'https://www.worldofbooks.com/en-gb',
            });
            return { triggered: true, reason: 'empty' };
        }

        const last = await this.prisma.navigation.findFirst({
            orderBy: { lastScrapedAt: 'desc' },
        });

        if (!last?.lastScrapedAt) {
            this.logger.log('Navigation has no lastScrapedAt → scraping');
            await this.scrapeQueue.add('navigation', {
                url: 'https://www.worldofbooks.com/en-gb',
            });
            return { triggered: true, reason: 'no_timestamp' };
        }

        const hours = (Date.now() - last.lastScrapedAt.getTime()) / 36e5;

        if (hours > 24) {
            this.logger.log(`Navigation stale (${hours.toFixed(1)}h) → re-scraping`);
            await this.scrapeQueue.add('navigation', {
                url: 'https://www.worldofbooks.com/en-gb',
            });
            return { triggered: true, reason: 'stale', hours: hours.toFixed(1) };
        }

        this.logger.log(`Navigation fresh (${hours.toFixed(1)}h) → skipping`);
        return { triggered: false, reason: 'fresh', hours: hours.toFixed(1) };
    }

    // CATEGORY RULES
    async scrapeCategory(navigationId: string) {
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
