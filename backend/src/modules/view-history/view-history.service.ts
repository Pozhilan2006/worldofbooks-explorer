/**
 * View History Service
 * 
 * Manages navigation history tracking for anonymous users
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TrackViewDto } from './dto/view-history.dto';

@Injectable()
export class ViewHistoryService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Track a page view
     */
    async trackView(sessionId: string, data: TrackViewDto) {
        return this.prisma.viewHistory.create({
            data: {
                sessionId,
                path: data.path,
                title: data.title,
                productId: data.productId,
                categoryId: data.categoryId,
            },
        });
    }

    /**
     * Get user's navigation history
     */
    async getHistory(sessionId: string, limit: number = 20) {
        return this.prisma.viewHistory.findMany({
            where: { sessionId },
            orderBy: { viewedAt: 'desc' },
            take: limit,
            include: {
                product: {
                    select: {
                        id: true,
                        title: true,
                        author: true,
                        price: true,
                        currency: true,
                        imageUrl: true,
                    },
                },
                category: {
                    select: {
                        id: true,
                        title: true,
                        slug: true,
                    },
                },
            },
        });
    }

    /**
     * Get recently viewed products (deduplicated)
     */
    async getRecentProducts(sessionId: string, limit: number = 10) {
        const history = await this.prisma.viewHistory.findMany({
            where: {
                sessionId,
                productId: { not: null },
            },
            orderBy: { viewedAt: 'desc' },
            take: limit * 2, // Get more to account for duplicates
            include: {
                product: true,
            },
        });

        // Deduplicate by product ID
        const seen = new Set<string>();
        const uniqueProducts = [];

        for (const item of history) {
            if (item.product && !seen.has(item.product.id)) {
                seen.add(item.product.id);
                uniqueProducts.push(item.product);
                if (uniqueProducts.length >= limit) break;
            }
        }

        return uniqueProducts;
    }

    /**
     * Clear user's history
     */
    async clearHistory(sessionId: string) {
        return this.prisma.viewHistory.deleteMany({
            where: { sessionId },
        });
    }

    /**
     * Clean up old history (older than 90 days)
     */
    async cleanupOldHistory() {
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        return this.prisma.viewHistory.deleteMany({
            where: {
                viewedAt: {
                    lt: ninetyDaysAgo,
                },
            },
        });
    }
}
