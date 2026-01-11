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
import { ProductService } from './product.service';
import {
    CreateProductDto,
    UpdateProductDto,
    CreateProductDetailDto,
    UpdateProductDetailDto,
    ProductQueryDto,
} from './dto/product.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createDto: CreateProductDto) {
        return this.productService.create(createDto);
    }

    @Get()
    findAll(
        @Query() paginationDto: PaginationQueryDto,
        @Query() queryDto: ProductQueryDto,
    ) {
        return this.productService.findAll(paginationDto, queryDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productService.findOne(id);
    }

    @Get('source/:sourceId')
    findBySourceId(@Param('sourceId') sourceId: string) {
        return this.productService.findBySourceId(sourceId);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateProductDto) {
        return this.productService.update(id, updateDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.productService.remove(id);
    }

    // Product Detail endpoints
    @Post(':id/detail')
    @HttpCode(HttpStatus.CREATED)
    createDetail(
        @Param('id') productId: string,
        @Body() createDto: CreateProductDetailDto,
    ) {
        return this.productService.createDetail(productId, createDto);
    }

    @Put(':id/detail')
    updateDetail(
        @Param('id') productId: string,
        @Body() updateDto: UpdateProductDetailDto,
    ) {
        return this.productService.updateDetail(productId, updateDto);
    }

    @Get(':id/detail')
    getDetail(@Param('id') productId: string) {
        return this.productService.getDetail(productId);
    }
}
