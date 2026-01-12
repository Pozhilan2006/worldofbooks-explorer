/**
 * View History Module
 * 
 * Manages navigation history tracking
 */

import { Module } from '@nestjs/common';
import { ViewHistoryController } from './view-history.controller';
import { ViewHistoryService } from './view-history.service';
import { DatabaseModule } from '../../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [ViewHistoryController],
    providers: [ViewHistoryService],
    exports: [ViewHistoryService],
})
export class ViewHistoryModule { }
