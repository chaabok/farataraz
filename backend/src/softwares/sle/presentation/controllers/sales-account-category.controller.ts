import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { SalesAccountCategoryService } from '../../application/services/sales-account-category.service';
import { CreateSalesAccountCategoryDto } from '../../application/dtos/create-sales-account-category.dto';
import { UpdateSalesAccountCategoryDto } from '../../application/dtos/update-sales-account-category.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

@Controller('sle/sales-account-categories')
@UseGuards(JwtAuthGuard)
export class SalesAccountCategoryController {
  constructor(private readonly service: SalesAccountCategoryService) {}

  @Get()
  async findAll(@Query() query: any) {
    return this.service.findAll(query);
  }

  @Get('next-number')
  async getNextNumber() {
    return this.service.getNextNumber();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findOne(Number(id));
    return { data, success: true };
  }

  @Post()
  async create(@Body() dto: CreateSalesAccountCategoryDto) {
    const data = await this.service.create(dto);
    return { data, success: true };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSalesAccountCategoryDto) {
    const data = await this.service.update(Number(id), dto);
    return { data, success: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(Number(id));
    return { success: true };
  }
}
