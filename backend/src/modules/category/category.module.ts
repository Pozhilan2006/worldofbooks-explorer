import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { ScrapeModule } from '../scrape/scrape.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [
        DatabaseModule,
        ScrapeModule.forRoot(),
    ],
    controllers: [CategoryController],
    providers: [CategoryService],
    exports: [CategoryService],
})
export class CategoryModule { }
