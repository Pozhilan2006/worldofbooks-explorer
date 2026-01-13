// backend/src/modules/scrape/scrape-policy.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ScrapePolicyService {
  constructor(private prisma: PrismaService) { }

  async shouldScrapeNavigation(): Promise<boolean> {
    const count = await this.prisma.navigation.count();

    if (count === 0) return true;

    const latest = await this.prisma.navigation.findFirst({
      orderBy: { lastScrapedAt: 'desc' },
    });

    if (!latest?.lastScrapedAt) return true;

    const hours =
      (Date.now() - new Date(latest.lastScrapedAt).getTime()) / 36e5;

    return hours > 24;
  }

  async shouldScrapeCategories(navigationId: string): Promise<boolean> {
    const categories = await this.prisma.category.findMany({
      where: { navigationId },
    });

    if (categories.length === 0) return true;

    const latest = categories.reduce((a, b) =>
      new Date(a.lastScrapedAt).getTime() >
        new Date(b.lastScrapedAt).getTime()
        ? a
        : b,
    );

    const hours =
      (Date.now() - new Date(latest.lastScrapedAt).getTime()) / 36e5;

    return hours > 24;
  }

  async shouldScrapeProducts(categoryId: string): Promise<boolean> {
    const products = await this.prisma.product.findMany({
      where: { categoryId },
    });

    if (products.length === 0) return true;

    const latest = products.reduce((a, b) =>
      new Date(a.lastScrapedAt).getTime() >
        new Date(b.lastScrapedAt).getTime()
        ? a
        : b,
    );

    const hours =
      (Date.now() - new Date(latest.lastScrapedAt).getTime()) / 36e5;

    return hours > 12;
  }
}
