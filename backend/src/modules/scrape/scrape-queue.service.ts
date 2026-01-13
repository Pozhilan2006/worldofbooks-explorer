/**
 * Scrape Queue Service
 * 
 * Manages BullMQ job queue for scraping tasks.
 * Only initializes when SCRAPE_QUEUE_ENABLED=true.
 */

import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import crypto from 'crypto';

@Injectable()
export class ScrapeQueueService implements OnModuleInit {
  private queue?: Queue;
  private readonly isEnabled: boolean;

  constructor() {
    this.isEnabled = process.env.SCRAPE_QUEUE_ENABLED === 'true';

    if (!this.isEnabled) {
      console.log('[SCRAPE QUEUE] Disabled - skipping Redis connection');
      return;
    }

    if (!process.env.REDIS_URL_INTERNAL) {
      console.warn('[SCRAPE QUEUE] REDIS_URL_INTERNAL not set - queue will not work');
      return;
    }

    this.queue = new Queue('scrape-queue', {
      connection: {
        url: process.env.REDIS_URL_INTERNAL,
      },
    });
  }

  async onModuleInit() {
    if (this.isEnabled && this.queue) {
      console.log('[SCRAPE QUEUE] Connected to Redis');
    }
  }

  // Generate unique job ID based on URL and type
  private generateJobId(url: string, type: string): string {
    return crypto
      .createHash('sha256')
      .update(`${type}:${url}`)
      .digest('hex');
  }

  async enqueueNavigation() {
    if (!this.queue) {
      console.log('[SCRAPE QUEUE] Skipping navigation enqueue (disabled)');
      return;
    }

    const url = 'https://www.worldofbooks.com/en-gb';
    const jobId = this.generateJobId(url, 'navigation');

    await this.queue.add(
      'navigation',
      { url },
      {
        jobId,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000, // 5s → 10s → 20s
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    console.log('[SCRAPE QUEUE] Navigation job enqueued');
  }

  async enqueueCategory(navigationId: string) {
    if (!this.queue) {
      console.log('[SCRAPE QUEUE] Skipping category enqueue (disabled)');
      return;
    }

    const url = `https://www.worldofbooks.com/en-gb/navigation/${navigationId}`;
    const jobId = this.generateJobId(url, 'category');

    await this.queue.add(
      'category',
      { url, navigationId },
      {
        jobId,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    console.log(`[SCRAPE QUEUE] Category job enqueued for navigation ${navigationId}`);
  }

  async enqueueProduct(categoryId: string) {
    if (!this.queue) {
      console.log('[SCRAPE QUEUE] Skipping product enqueue (disabled)');
      return;
    }

    const url = `https://www.worldofbooks.com/en-gb/category/${categoryId}`;
    const jobId = this.generateJobId(url, 'product');

    await this.queue.add(
      'product',
      { url, categoryId },
      {
        jobId,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );

    console.log(`[SCRAPE QUEUE] Product job enqueued for category ${categoryId}`);
  }
}
