import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNavigationDto, UpdateNavigationDto, NavigationQueryDto } from './dto/navigation.dto';
import { PaginationQueryDto, PaginatedResponse } from '../../common/dto/pagination.dto';
import { Navigation } from '@prisma/client';
import { ScrapePolicyService } from '../scrape/scrape-policy.service';
import { ScrapeQueueService } from '../scrape/scrape-queue.service';

@Injectable()
export class NavigationService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly scrapePolicy: ScrapePolicyService,
        private readonly scrapeQueue: ScrapeQueueService,
    ) { }

    async create(createDto: CreateNavigationDto): Promise<Navigation> {
        // Check for duplicate slug or sourceUrl
        const existing = await this.prisma.navigation.findFirst({
            where: {
                OR: [
                    { slug: createDto.slug },
                    { sourceUrl: createDto.sourceUrl },
                ],
            },
        });

        if (existing) {
            throw new ConflictException('Navigation with this slug or sourceUrl already exists');
        }

        return this.prisma.navigation.create({
            data: createDto,
        });
    }

    async findAll(
        paginationDto: PaginationQueryDto,
        queryDto: NavigationQueryDto,
    ): Promise<PaginatedResponse<Navigation>> {
        // 🔹 CHECK IF SCRAPE IS NEEDED (EMPTY OR >24H)
        if (await this.scrapePolicy.shouldScrapeNavigation()) {
            console.log('[NAVIGATION] Triggering scrape - table empty or data stale (>24h)');
            await this.scrapeQueue.enqueueNavigation();
        } else {
            console.log('[NAVIGATION] Using cached data - fresh (<24h)');
        }

        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (queryDto.search) {
            where.title = {
                contains: queryDto.search,
                mode: 'insensitive',
            };
        }

        if (queryDto.slug) {
            where.slug = queryDto.slug;
        }

        const [data, total] = await Promise.all([
            this.prisma.navigation.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    _count: {
                        select: { categories: true },
                    },
                },
            }),
            this.prisma.navigation.count({ where }),
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

    async findOne(id: string): Promise<Navigation> {
        const navigation = await this.prisma.navigation.findUnique({
            where: { id },
            include: {
                categories: {
                    where: { parentId: null }, // Only root categories
                    orderBy: { title: 'asc' },
                },
                _count: {
                    select: { categories: true },
                },
            },
        });

        if (!navigation) {
            throw new NotFoundException(`Navigation with ID ${id} not found`);
        }

        return navigation;
    }

    async findBySlug(slug: string): Promise<Navigation> {
        const navigation = await this.prisma.navigation.findUnique({
            where: { slug },
            include: {
                categories: {
                    where: { parentId: null },
                    orderBy: { title: 'asc' },
                },
            },
        });

        if (!navigation) {
            throw new NotFoundException(`Navigation with slug ${slug} not found`);
        }

        return navigation;
    }

    async update(id: string, updateDto: UpdateNavigationDto): Promise<Navigation> {
        await this.findOne(id); // Check if exists

        // Check for duplicate slug or sourceUrl if updating
        if (updateDto.slug || updateDto.sourceUrl) {
            const existing = await this.prisma.navigation.findFirst({
                where: {
                    AND: [
                        { id: { not: id } },
                        {
                            OR: [
                                updateDto.slug ? { slug: updateDto.slug } : {},
                                updateDto.sourceUrl ? { sourceUrl: updateDto.sourceUrl } : {},
                            ],
                        },
                    ],
                },
            });

            if (existing) {
                throw new ConflictException('Navigation with this slug or sourceUrl already exists');
            }
        }

        return this.prisma.navigation.update({
            where: { id },
            data: updateDto,
        });
    }

    async remove(id: string): Promise<void> {
        await this.findOne(id); // Check if exists

        await this.prisma.navigation.delete({
            where: { id },
        });
    }
}
