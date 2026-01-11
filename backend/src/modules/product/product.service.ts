import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import {
    CreateProductDto,
    UpdateProductDto,
    CreateProductDetailDto,
    UpdateProductDetailDto,
    ProductQueryDto,
} from './dto/product.dto';
import { PaginationQueryDto, PaginatedResponse } from '../../common/dto/pagination.dto';
import { Product, ProductDetail } from '@prisma/client';

@Injectable()
export class ProductService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreateProductDto): Promise<Product> {
        // Verify category exists if provided
        if (createDto.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: createDto.categoryId },
            });

            if (!category) {
                throw new BadRequestException('Category not found');
            }
        }

        // Check for duplicate sourceId or sourceUrl
        const existing = await this.prisma.product.findFirst({
            where: {
                OR: [
                    { sourceId: createDto.sourceId },
                    { sourceUrl: createDto.sourceUrl },
                ],
            },
        });

        if (existing) {
            throw new ConflictException('Product with this sourceId or sourceUrl already exists');
        }

        return this.prisma.product.create({
            data: createDto,
            include: {
                category: {
                    select: { id: true, title: true, slug: true },
                },
            },
        });
    }

    async findAll(
        paginationDto: PaginationQueryDto,
        queryDto: ProductQueryDto,
    ): Promise<PaginatedResponse<Product>> {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (queryDto.search) {
            where.OR = [
                { title: { contains: queryDto.search, mode: 'insensitive' } },
                { author: { contains: queryDto.search, mode: 'insensitive' } },
            ];
        }

        if (queryDto.categoryId) {
            where.categoryId = queryDto.categoryId;
        }

        if (queryDto.author) {
            where.author = { contains: queryDto.author, mode: 'insensitive' };
        }

        if (queryDto.minPrice !== undefined || queryDto.maxPrice !== undefined) {
            where.price = {};
            if (queryDto.minPrice !== undefined) {
                where.price.gte = queryDto.minPrice;
            }
            if (queryDto.maxPrice !== undefined) {
                where.price.lte = queryDto.maxPrice;
            }
        }

        const sortBy = queryDto.sortBy || 'createdAt';
        const sortOrder = queryDto.sortOrder || 'desc';

        const [data, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sortBy]: sortOrder },
                include: {
                    category: {
                        select: { id: true, title: true, slug: true },
                    },
                    detail: true,
                },
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string): Promise<Product> {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: {
                category: {
                    include: {
                        navigation: {
                            select: { id: true, title: true, slug: true },
                        },
                    },
                },
                detail: true,
                reviews: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        });

        if (!product) {
            throw new NotFoundException(`Product with ID ${id} not found`);
        }

        return product;
    }

    async findBySourceId(sourceId: string): Promise<Product> {
        const product = await this.prisma.product.findUnique({
            where: { sourceId },
            include: {
                category: true,
                detail: true,
            },
        });

        if (!product) {
            throw new NotFoundException(`Product with sourceId ${sourceId} not found`);
        }

        return product;
    }

    async update(id: string, updateDto: UpdateProductDto): Promise<Product> {
        await this.findOne(id);

        // Verify category exists if updating
        if (updateDto.categoryId) {
            const category = await this.prisma.category.findUnique({
                where: { id: updateDto.categoryId },
            });

            if (!category) {
                throw new BadRequestException('Category not found');
            }
        }

        // Check for duplicate sourceUrl if updating
        if (updateDto.sourceUrl) {
            const existing = await this.prisma.product.findFirst({
                where: {
                    AND: [
                        { id: { not: id } },
                        { sourceUrl: updateDto.sourceUrl },
                    ],
                },
            });

            if (existing) {
                throw new ConflictException('Product with this sourceUrl already exists');
            }
        }

        return this.prisma.product.update({
            where: { id },
            data: updateDto,
            include: {
                category: true,
                detail: true,
            },
        });
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);

        await this.prisma.product.delete({
            where: { id },
        });
    }

    // Product Detail methods
    async createDetail(productId: string, createDto: CreateProductDetailDto): Promise<ProductDetail> {
        // Verify product exists
        await this.findOne(productId);

        // Check if detail already exists
        const existing = await this.prisma.productDetail.findUnique({
            where: { productId },
        });

        if (existing) {
            throw new ConflictException('Product detail already exists for this product');
        }

        return this.prisma.productDetail.create({
            data: {
                productId,
                ...createDto,
            },
        });
    }

    async updateDetail(productId: string, updateDto: UpdateProductDetailDto): Promise<ProductDetail> {
        // Verify product exists
        await this.findOne(productId);

        // Check if detail exists
        const existing = await this.prisma.productDetail.findUnique({
            where: { productId },
        });

        if (!existing) {
            throw new NotFoundException('Product detail not found');
        }

        return this.prisma.productDetail.update({
            where: { productId },
            data: updateDto,
        });
    }

    async getDetail(productId: string): Promise<ProductDetail> {
        const detail = await this.prisma.productDetail.findUnique({
            where: { productId },
            include: {
                product: {
                    select: { id: true, title: true, author: true },
                },
            },
        });

        if (!detail) {
            throw new NotFoundException('Product detail not found');
        }

        return detail;
    }
}
