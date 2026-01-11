import { Injectable } from '@nestjs/common';

@Injectable()
export class ScrapePolicyService {
  isStale(lastScrapedAt?: Date, ttlHours = 12): boolean {
    if (!lastScrapedAt) {
      return true;
    }

    const ageMs = Date.now() - new Date(lastScrapedAt).getTime();
    const ttlMs = ttlHours * 60 * 60 * 1000;

    return ageMs > ttlMs;
  }
}
