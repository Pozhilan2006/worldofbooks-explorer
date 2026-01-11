import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto } from './dto/category.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@Controller('categories')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createDto: CreateCategoryDto) {
        return this.categoryService.create(createDto);
    }

    @Get()
    findAll(
        @Query() paginationDto: PaginationQueryDto,
        @Query() queryDto: CategoryQueryDto,
    ) {
        return this.categoryService.findAll(paginationDto, queryDto);
    }

    @Get('tree/:navigationId')
    getCategoryTree(@Param('navigationId') navigationId: string) {
        return this.categoryService.getCategoryTree(navigationId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.categoryService.findOne(id);
    }

    @Get(':navigationId/:slug')
    findBySlug(
        @Param('navigationId') navigationId: string,
        @Param('slug') slug: string,
    ) {
        return this.categoryService.findBySlug(navigationId, slug);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateCategoryDto) {
        return this.categoryService.update(id, updateDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.categoryService.remove(id);
    }
}
