import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ScrapeModule } from '../scrape/scrape.module';
import { DatabaseModule } from '../../database/database.module';

@Module({
  imports: [DatabaseModule, ScrapeModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
