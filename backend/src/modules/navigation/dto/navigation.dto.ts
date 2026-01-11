import { IsString, IsNotEmpty, IsUrl, IsOptional, IsDateString } from 'class-validator';

export class CreateNavigationDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    slug: string;

    @IsUrl()
    @IsNotEmpty()
    sourceUrl: string;
}

export class UpdateNavigationDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    slug?: string;

    @IsUrl()
    @IsOptional()
    sourceUrl?: string;

    @IsDateString()
    @IsOptional()
    lastScrapedAt?: string;
}

export class NavigationQueryDto {
    @IsString()
    @IsOptional()
    search?: string;

    @IsString()
    @IsOptional()
    slug?: string;
}
