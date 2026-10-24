import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { ItemAccountCategoryService } from '../../application/services/item-account-category.service';
import { CreateItemAccountCategoryDto } from '../../application/dtos/create-item-account-category.dto';
import { UpdateItemAccountCategoryDto } from '../../application/dtos/update-item-account-category.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('inv/item-account-categories')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ItemAccountCategoryController {
  constructor(private readonly service: ItemAccountCategoryService) {}

  @Post()
  create(@Body() createDto: CreateItemAccountCategoryDto) {
    return this.service.create(createDto);
  }

  @Get()
  findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('next-number')
  async getNextNumber() {
    return this.service.getNextNumber();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateItemAccountCategoryDto) {
    return this.service.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
