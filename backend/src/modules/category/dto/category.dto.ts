import { IsString, IsNotEmpty, IsUrl, IsOptional, IsInt, IsUUID, IsDateString } from 'class-validator';

export class CreateCategoryDto {
    @IsUUID()
    @IsNotEmpty()
    navigationId: string;

    @IsUUID()
    @IsOptional()
    parentId?: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsUrl()
    @IsNotEmpty()
    sourceUrl: string;

    @IsInt()
    @IsOptional()
    productCount?: number;
}

export class UpdateCategoryDto {
    @IsUUID()
    @IsOptional()
    navigationId?: string;

    @IsUUID()
    @IsOptional()
    parentId?: string;

    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsUrl()
    @IsOptional()
    sourceUrl?: string;

    @IsInt()
    @IsOptional()
    productCount?: number;

    @IsDateString()
    @IsOptional()
    lastScrapedAt?: string;
}

export class CategoryQueryDto {
    @IsString()
    @IsOptional()
    search?: string;

    @IsUUID()
    @IsOptional()
    navigationId?: string;

    @IsUUID()
    @IsOptional()
    parentId?: string;

    @IsString()
    @IsOptional()
    slug?: string;
}
