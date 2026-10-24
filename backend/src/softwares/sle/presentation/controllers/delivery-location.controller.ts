import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { DeliveryLocationService } from '../../application/services/delivery-location.service';
import { CreateDeliveryLocationDto, UpdateDeliveryLocationDto } from '../../application/dtos/create-delivery-location.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('sle/delivery-locations')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DeliveryLocationController {
  constructor(private readonly service: DeliveryLocationService) {}

  @Get()
  async findAll(@Query('activeOnly') activeOnly?: string) {
    const data = await this.service.findAll(activeOnly === 'true' || activeOnly === '1');
    return { data, success: true };
  }

  @Get('next-number')
  async getNextNumber() {
    const data = await this.service.getNextNumber();
    return { data, success: true };
  }

  @Get('check-duplicate')
  async checkDuplicate(
    @Query('field') field: string,
    @Query('value') value: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const isDuplicate = await this.service.checkDuplicate(
      field,
      value,
      excludeId ? Number(excludeId) : undefined,
    );
    return { data: { isDuplicate }, success: true };
  }

  @Post()
  async create(@Body() dto: CreateDeliveryLocationDto) {
    const data = await this.service.create(dto);
    return { data, success: true, message: 'مکان تحویل با موفقیت ایجاد شد' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateDeliveryLocationDto) {
    const data = await this.service.update(+id, dto);
    return { data, success: true, message: 'مکان تحویل با موفقیت به‌روزرسانی شد' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findById(+id);
    return { data, success: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(+id);
    return { success: true, message: 'مکان تحویل با موفقیت حذف شد' };
  }
}
