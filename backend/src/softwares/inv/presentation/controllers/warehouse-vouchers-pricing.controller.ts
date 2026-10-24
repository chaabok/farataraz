import { Controller, Get, Post, Put, Delete, Body, Param, Query, ParseIntPipe } from '@nestjs/common';
import { WarehouseVouchersPricingService } from '../../application/services/warehouse-vouchers-pricing.service';
import { CreateWarehouseVouchersPricingDto, UpdateWarehouseVouchersPricingDto, CalculateWarehousePricingDto } from '../../application/dtos/warehouse-vouchers-pricing.dto';

@Controller('inv/warehouse-vouchers-pricing')
export class WarehouseVouchersPricingController {
  constructor(private readonly service: WarehouseVouchersPricingService) {}

  @Post('calculate')
  async calculatePricing(@Body() dto: CalculateWarehousePricingDto) {
    const data = await this.service.calculatePricing(dto);
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: CreateWarehouseVouchersPricingDto) {
    const data = await this.service.create(dto);
    return { success: true, data };
  }

  @Post('batch')
  async createBatch(@Body() dtos: CreateWarehouseVouchersPricingDto[]) {
    const data = await this.service.createBatch(dtos);
    return { success: true, data };
  }

  @Get()
  async findAll(@Query() query: any) {
    const data = await this.service.findAll(query);
    return { success: true, data };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.service.findOne(id);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateWarehouseVouchersPricingDto) {
    const data = await this.service.update(id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.service.remove(id);
    return { success: true, message: 'رکورد قیمت‌گذاری اسناد انبار با موفقیت حذف شد' };
  }
}
