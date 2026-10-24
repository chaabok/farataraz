import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseGuards } from '@nestjs/common';
import { SettlementMethodService } from '../../application/services/settlement-method.service';
import { CreateSettlementMethodDto, UpdateSettlementMethodDto } from '../../application/dtos/create-settlement-method.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';
import { PermissionsGuard } from '../../../../auth/permissions.guard';

@Controller('sle/settlement-methods')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SettlementMethodController {
  constructor(private readonly service: SettlementMethodService) {}

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
  async create(@Body() dto: CreateSettlementMethodDto) {
    const data = await this.service.create(dto);
    return { data, success: true, message: 'روش تسویه با موفقیت ایجاد شد' };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSettlementMethodDto) {
    const data = await this.service.update(+id, dto);
    return { data, success: true, message: 'روش تسویه با موفقیت به‌روزرسانی شد' };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findById(+id);
    return { data, success: true };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(+id);
    return { success: true, message: 'روش تسویه با موفقیت حذف شد' };
  }
}
