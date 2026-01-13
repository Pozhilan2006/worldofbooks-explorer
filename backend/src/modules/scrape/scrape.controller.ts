import { Controller, Post, Param } from '@nestjs/common';
import { ScrapeService } from './scrape.service';

@Controller('api/scrape')
export class ScrapeController {
    constructor(private readonly scrapeService: ScrapeService) { }

    @Post('navigation')
    scrapeNavigation() {
        return this.scrapeService.scrapeNavigation();
    }

    @Post('category/:navigationId')
    scrapeCategory(@Param('navigationId') navigationId: string) {
        return this.scrapeService.scrapeCategory(navigationId);
    }

    @Post('product/:categoryId')
    scrapeProduct(@Param('categoryId') categoryId: string) {
        return this.scrapeService.scrapeProduct(categoryId);
    }
}
