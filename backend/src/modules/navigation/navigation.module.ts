import { Module } from '@nestjs/common';
import { NavigationController } from './navigation.controller';
import { NavigationService } from './navigation.service';
import { PrismaService } from '../../database/prisma.service';
import { ScrapeModule } from '../scrape/scrape.module';

@Module({
    imports: [ScrapeModule],
    controllers: [NavigationController],
    providers: [NavigationService, PrismaService],
    exports: [NavigationService],
})
export class NavigationModule { }
