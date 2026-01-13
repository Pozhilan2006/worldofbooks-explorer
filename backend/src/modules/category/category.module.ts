import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { ScrapeModule } from '../scrape/scrape.module';

@Module({
    imports: [ScrapeModule.forRoot()], // Use forRoot() for dynamic module
    controllers: [CategoryController],
    providers: [CategoryService], // PrismaService comes from DatabaseModule in ScrapeModule
    exports: [CategoryService],
})
export class CategoryModule { }
