import { Module } from '@nestjs/common';
import { NavigationController } from './navigation.controller';
import { NavigationService } from './navigation.service';
import { ScrapeModule } from '../scrape/scrape.module';

@Module({
    imports: [ScrapeModule.forRoot()], // Use forRoot() for dynamic module
    controllers: [NavigationController],
    providers: [NavigationService], // PrismaService comes from DatabaseModule in ScrapeModule
    exports: [NavigationService],
})
export class NavigationModule { }
