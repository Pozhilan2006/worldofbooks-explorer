import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { PrismaService } from '../../database/prisma.service';
import { ScrapeModule } from '../scrape/scrape.module';

@Module({
    imports: [ScrapeModule],
    controllers: [CategoryController],
    providers: [CategoryService, PrismaService],
    exports: [CategoryService],
})
export class CategoryModule { }
