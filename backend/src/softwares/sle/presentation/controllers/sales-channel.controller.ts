import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { SalesChannelService } from '../../application/services/sales-channel.service';
import { CreateSalesChannelDto, UpdateSalesChannelDto } from '../../application/dtos/create-sales-channel.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('sle/sales-channels')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SalesChannelController {
  constructor(private readonly service: SalesChannelService) {}

  @Get()
  async findAll() {
    const data = await this.service.findAll();
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
  async create(@Body() dto: CreateSalesChannelDto) {
    const data = await this.service.create(dto);
    return { data, success: true, message: 'کانال فروش با موفقیت ایجاد شد' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSalesChannelDto) {
    const data = await this.service.update(+id, dto);
    return { data, success: true, message: 'کانال فروش با موفقیت به‌روزرسانی شد' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findById(+id);
    return { data, success: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(+id);
    return { success: true, message: 'کانال فروش با موفقیت حذف شد' };
  }
}
