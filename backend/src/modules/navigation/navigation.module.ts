import { Module } from '@nestjs/common';
import { NavigationController } from './navigation.controller';
import { NavigationService } from './navigation.service';
import { PrismaService } from '../../database/prisma.service';

@Module({
    controllers: [NavigationController],
    providers: [NavigationService, PrismaService],
    exports: [NavigationService],
})
export class NavigationModule { }
