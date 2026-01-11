import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import crypto from 'crypto';

@Injectable()
export class ScrapeQueueService {
  private readonly queue: Queue;

  constructor() {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[SCRAPE QUEUE] Disabled outside production');
      return;
    }

    this.queue = new Queue('scrape-queue', {
      connection: {
        url: process.env.REDIS_URL_INTERNAL,
      },
    });

    console.log('[SCRAPE QUEUE] Connected to Redis');
  }

  // 🔹 JOB ID = hash(url + type)
  private generateJobId(url: string, type: string): string {
    return crypto
      .createHash('sha256')
      .update(`${type}:${url}`)
      .digest('hex');
  }

  async enqueueProduct(url: string) {
    if (!this.queue) {
      return;
    }

    const jobId = this.generateJobId(url, 'product');

    await this.queue.add(
      'product',
      { url },
      {
        jobId, // ✅ IDEMPOTENT
        attempts: 3, // ✅ MAX RETRIES = 3
        backoff: {
          type: 'exponential', // ✅ BACKOFF
          delay: 2000, // 2s → 4s → 8s
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  async enqueueCategory(url: string) {
    if (!this.queue) {
      return;
    }

    const jobId = this.generateJobId(url, 'category');

    await this.queue.add(
      'category',
      { url },
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
  }
}
