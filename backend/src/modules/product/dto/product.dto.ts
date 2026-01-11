import {
    IsString,
    IsNotEmpty,
    IsUrl,
    IsOptional,
    IsUUID,
    IsDecimal,
    IsDateString,
    ValidateNested,
    IsInt,
    IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Decimal } from '@prisma/client/runtime/library';

export class CreateProductDto {
    @IsUUID()
    @IsOptional()
    categoryId?: string;

    @IsString()
    @IsNotEmpty()
    sourceId: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsOptional()
    author?: string;

    @IsDecimal()
    @IsOptional()
    @Type(() => Number)
    price?: number;

    @IsString()
    @IsOptional()
    currency?: string;

    @IsUrl()
    @IsOptional()
    imageUrl?: string;

    @IsUrl()
    @IsNotEmpty()
    sourceUrl: string;
}

export class UpdateProductDto {
    @IsUUID()
    @IsOptional()
    categoryId?: string;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    author?: string;

    @IsDecimal()
    @IsOptional()
    @Type(() => Number)
    price?: number;

    @IsString()
    @IsOptional()
    currency?: string;

    @IsUrl()
    @IsOptional()
    imageUrl?: string;

    @IsUrl()
    @IsOptional()
    sourceUrl?: string;

    @IsDateString()
    @IsOptional()
    lastScrapedAt?: string;
}

export class CreateProductDetailDto {
    @IsString()
    @IsOptional()
    description?: string;

    @IsObject()
    @IsOptional()
    specs?: any;

    @IsDecimal()
    @IsOptional()
    @Type(() => Number)
    ratingsAvg?: number;

    @IsInt()
    @IsOptional()
    reviewsCount?: number;

    @IsString()
    @IsOptional()
    publisher?: string;

    @IsDateString()
    @IsOptional()
    publicationDate?: string;

    @IsString()
    @IsOptional()
    isbn?: string;
}

export class UpdateProductDetailDto {
    @IsString()
    @IsOptional()
    description?: string;

    @IsObject()
    @IsOptional()
    specs?: any;

    @IsDecimal()
    @IsOptional()
    @Type(() => Number)
    ratingsAvg?: number;

    @IsInt()
    @IsOptional()
    reviewsCount?: number;

    @IsString()
    @IsOptional()
    publisher?: string;

    @IsDateString()
    @IsOptional()
    publicationDate?: string;

    @IsString()
    @IsOptional()
    isbn?: string;

    @IsDateString()
    @IsOptional()
    lastScrapedAt?: string;
}

export class ProductQueryDto {
    @IsString()
    @IsOptional()
    search?: string;

    @IsUUID()
    @IsOptional()
    categoryId?: string;

    @IsString()
    @IsOptional()
    author?: string;

    @IsDecimal()
    @IsOptional()
    @Type(() => Number)
    minPrice?: number;

    @IsDecimal()
    @IsOptional()
    @Type(() => Number)
    maxPrice?: number;

    @IsString()
    @IsOptional()
    sortBy?: 'title' | 'price' | 'createdAt' | 'updatedAt';

    @IsString()
    @IsOptional()
    sortOrder?: 'asc' | 'desc';
}
