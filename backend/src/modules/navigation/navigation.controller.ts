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
import { NavigationService } from './navigation.service';
import { CreateNavigationDto, UpdateNavigationDto, NavigationQueryDto } from './dto/navigation.dto';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';

@Controller('navigation')
export class NavigationController {
    constructor(private readonly navigationService: NavigationService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body() createDto: CreateNavigationDto) {
        return this.navigationService.create(createDto);
    }

    @Get()
    findAll(
        @Query() paginationDto: PaginationQueryDto,
        @Query() queryDto: NavigationQueryDto,
    ) {
        return this.navigationService.findAll(paginationDto, queryDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.navigationService.findOne(id);
    }

    @Get('slug/:slug')
    findBySlug(@Param('slug') slug: string) {
        return this.navigationService.findBySlug(slug);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateDto: UpdateNavigationDto) {
        return this.navigationService.update(id, updateDto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string) {
        await this.navigationService.remove(id);
    }
}
