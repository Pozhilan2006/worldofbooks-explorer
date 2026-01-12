/**
 * View History DTOs
 * 
 * Data transfer objects for view history tracking
 */

import { IsString, IsOptional, IsUUID, IsInt, Min, Max } from 'class-validator';

export class TrackViewDto {
    @IsString()
    path: string;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsUUID()
    productId?: string;

    @IsOptional()
    @IsUUID()
    categoryId?: string;
}

export class GetHistoryQueryDto {
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(100)
    limit?: number = 20;
}
