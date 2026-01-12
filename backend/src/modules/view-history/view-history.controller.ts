/**
 * View History Controller
 * 
 * REST API endpoints for navigation history
 */

import {
    Controller,
    Post,
    Get,
    Delete,
    Body,
    Query,
    Req,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { ViewHistoryService } from './view-history.service';
import { TrackViewDto, GetHistoryQueryDto } from './dto/view-history.dto';

@Controller('view-history')
export class ViewHistoryController {
    constructor(private readonly viewHistoryService: ViewHistoryService) { }

    /**
     * Track a page view
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async trackView(@Req() req: Request, @Body() trackViewDto: TrackViewDto) {
        const sessionId = req['sessionId'];
        return this.viewHistoryService.trackView(sessionId, trackViewDto);
    }

    /**
     * Get user's navigation history
     */
    @Get()
    async getHistory(@Req() req: Request, @Query() query: GetHistoryQueryDto) {
        const sessionId = req['sessionId'];
        return this.viewHistoryService.getHistory(sessionId, query.limit);
    }

    /**
     * Get recently viewed products
     */
    @Get('products')
    async getRecentProducts(@Req() req: Request, @Query() query: GetHistoryQueryDto) {
        const sessionId = req['sessionId'];
        return this.viewHistoryService.getRecentProducts(sessionId, query.limit || 10);
    }

    /**
     * Clear user's history
     */
    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT)
    async clearHistory(@Req() req: Request) {
        const sessionId = req['sessionId'];
        await this.viewHistoryService.clearHistory(sessionId);
    }
}
