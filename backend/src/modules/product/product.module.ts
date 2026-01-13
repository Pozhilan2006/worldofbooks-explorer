import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ScrapeModule } from '../scrape/scrape.module';

@Module({
  imports: [ScrapeModule.forRoot()], // Use forRoot() for dynamic module
  controllers: [ProductController],
  providers: [ProductService], // PrismaService comes from DatabaseModule in ScrapeModule
})
export class ProductModule { }

