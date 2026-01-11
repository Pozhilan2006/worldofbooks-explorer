import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './dto/category.dto';
import { PaginationQueryDto, PaginatedResponse } from '../../common/dto/pagination.dto';
import { Category } from '@prisma/client';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreateCategoryDto): Promise<Category> {
        // Verify navigation exists
        const navigation = await this.prisma.navigation.findUnique({
            where: { id: createDto.navigationId },
        });

        if (!navigation) {
            throw new BadRequestException('Navigation not found');
        }

        // Verify parent exists if provided
        if (createDto.parentId) {
            const parent = await this.prisma.category.findUnique({
                where: { id: createDto.parentId },
            });

            if (!parent) {
                throw new BadRequestException('Parent category not found');
            }

            if (parent.navigationId !== createDto.navigationId) {
                throw new BadRequestException('Parent category must belong to the same navigation');
            }
        }

        // Check for duplicate sourceUrl
        const existing = await this.prisma.category.findUnique({
            where: { sourceUrl: createDto.sourceUrl },
        });

        if (existing) {
            throw new ConflictException('Category with this sourceUrl already exists');
        }

        // Check for duplicate slug within navigation
        const duplicateSlug = await this.prisma.category.findUnique({
            where: {
                navigationId_slug: {
                    navigationId: createDto.navigationId,
                    slug: createDto.slug,
                },
            },
        });

        if (duplicateSlug) {
            throw new ConflictException('Category with this slug already exists in this navigation');
        }

        return this.prisma.category.create({
            data: createDto,
            include: {
                navigation: true,
                parent: true,
            },
        });
    }

    async findAll(
        paginationDto: PaginationQueryDto,
        queryDto: CategoryQueryDto,
    ): Promise<PaginatedResponse<Category>> {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (queryDto.search) {
            where.title = {
                contains: queryDto.search,
                mode: 'insensitive',
            };
        }

        if (queryDto.navigationId) {
            where.navigationId = queryDto.navigationId;
        }

        if (queryDto.parentId) {
            where.parentId = queryDto.parentId;
        }

        if (queryDto.slug) {
            where.slug = queryDto.slug;
        }

        const [data, total] = await Promise.all([
            this.prisma.category.findMany({
                where,
                skip,
                take: limit,
                orderBy: { title: 'asc' },
                include: {
                    navigation: {
                        select: { id: true, title: true, slug: true },
                    },
                    parent: {
                        select: { id: true, title: true, slug: true },
                    },
                    _count: {
                        select: { children: true, products: true },
                    },
                },
            }),
            this.prisma.category.count({ where }),
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

    async findOne(id: string): Promise<Category> {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                navigation: true,
                parent: true,
                children: {
                    orderBy: { title: 'asc' },
                },
                _count: {
                    select: { children: true, products: true },
                },
            },
        });

        if (!category) {
            throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return category;
    }

    async findBySlug(navigationId: string, slug: string): Promise<Category> {
        const category = await this.prisma.category.findUnique({
            where: {
                navigationId_slug: { navigationId, slug },
            },
            include: {
                navigation: true,
                parent: true,
                children: {
                    orderBy: { title: 'asc' },
                },
            },
        });

        if (!category) {
            throw new NotFoundException(`Category with slug ${slug} not found`);
        }

        return category;
    }

    async getCategoryTree(navigationId: string): Promise<Category[]> {
        return this.prisma.category.findMany({
            where: {
                navigationId,
                parentId: null,
            },
            include: {
                children: {
                    include: {
                        children: true,
                    },
                },
            },
            orderBy: { title: 'asc' },
        });
    }

    async update(id: string, updateDto: UpdateCategoryDto): Promise<Category> {
        const category = await this.findOne(id);

        // Verify parent exists if updating
        if (updateDto.parentId) {
            const parent = await this.prisma.category.findUnique({
                where: { id: updateDto.parentId },
            });

            if (!parent) {
                throw new BadRequestException('Parent category not found');
            }

            // Prevent circular references
            if (updateDto.parentId === id) {
                throw new BadRequestException('Category cannot be its own parent');
            }

            const navigationId = updateDto.navigationId || category.navigationId;
            if (parent.navigationId !== navigationId) {
                throw new BadRequestException('Parent category must belong to the same navigation');
            }
        }

        // Check for duplicate sourceUrl if updating
        if (updateDto.sourceUrl) {
            const existing = await this.prisma.category.findFirst({
                where: {
                    AND: [
                        { id: { not: id } },
                        { sourceUrl: updateDto.sourceUrl },
                    ],
                },
            });

            if (existing) {
                throw new ConflictException('Category with this sourceUrl already exists');
            }
        }

        // Check for duplicate slug if updating
        if (updateDto.slug || updateDto.navigationId) {
            const navigationId = updateDto.navigationId || category.navigationId;
            const slug = updateDto.slug || category.slug;

            const duplicateSlug = await this.prisma.category.findFirst({
                where: {
                    AND: [
                        { id: { not: id } },
                        { navigationId },
                        { slug },
                    ],
                },
            });

            if (duplicateSlug) {
                throw new ConflictException('Category with this slug already exists in this navigation');
            }
        }

        return this.prisma.category.update({
            where: { id },
            data: updateDto,
            include: {
                navigation: true,
                parent: true,
            },
        });
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id);

        await this.prisma.category.delete({
            where: { id },
        });
    }
}
