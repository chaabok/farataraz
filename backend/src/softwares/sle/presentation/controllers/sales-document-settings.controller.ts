import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { SalesDocumentSettingsService } from '../../application/services/sales-document-settings.service';
import {
  CreateSalesDocumentSettingsDto,
  UpdateSalesDocumentSettingsDto,
} from '../../application/dtos/create-sales-document-settings.dto';
import { salesDocumentTypeLabel } from '../../domain/entities/sales-document-type.enum';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('sle/sales-document-settings')
export class SalesDocumentSettingsController {
  constructor(private readonly service: SalesDocumentSettingsService) {}

  /** Enum انواع سند فروش برای دراپ‌دان فرم (id + title) */
  @Get('document-types')
  getDocumentTypes() {
    return { success: true, data: this.service.getDocumentTypes() };
  }

  /** فهرست کامل «سند مبنا»: بدون مبنا + انواع سند فروش + رسید انبار + حواله انبار */
  @Get('base-document-types')
  getBaseDocumentTypes() {
    return { success: true, data: this.service.getBaseDocumentTypes() };
  }

  @Get('by-type/:type')
  async findByType(@Param('type') type: string) {
    const data = await this.service.findByType(Number(type));
    return { success: true, data };
  }

  @Get()
  async findAll() {
    const data = await this.service.findAll();
    const mapped = data.map((item: any) => ({
      ...item,
      SalesDocumentTypeName: salesDocumentTypeLabel(item.SalesDocumentType),
    }));
    return { success: true, data: mapped };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const data = await this.service.findById(Number(id));
    return { success: true, data };
  }

  /** ایجاد یا ویرایش بر اساس نوع سند فروش (upsert by type + tenant) */
  @Post('upsert')
  async upsert(@Body() dto: CreateSalesDocumentSettingsDto) {
    const data = await this.service.upsert(dto);
    return { success: true, data };
  }

  @Post()
  async create(@Body() dto: CreateSalesDocumentSettingsDto) {
    const data = await this.service.upsert(dto);
    return { success: true, data };
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSalesDocumentSettingsDto) {
    const data = await this.service.upsert(dto);
    return { success: true, data };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.service.remove(Number(id));
    return { success: true, message: 'Deleted successfully' };
  }
}
