import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SalesTrackingFactorSettingService } from '../../application/services/sales-tracking-factor-setting.service';
import { UpsertSalesTrackingFactorSettingsDto } from '../../application/dtos/create-sales-tracking-factor-setting.dto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

/**
 * تنظیمات «نمایش عامل ردیابی در فرم های فروش» (تنظیمات پایه → تب فروش)
 */
@UseGuards(JwtAuthGuard)
@Controller('sle/sales-tracking-factor-settings')
export class SalesTrackingFactorSettingController {
  constructor(private readonly service: SalesTrackingFactorSettingService) {}

  /** لیست تمام انواع سند فروش + وضعیت ذخیره‌شده */
  @Get()
  async getSettings() {
    const data = await this.service.getSettings();
    return { success: true, data };
  }

  /** ذخیره گروهی وضعیت چک‌باکس‌ها: { settings: [{ SalesDocumentType, ShowTrackingFactor }] } */
  @Post('upsert')
  async upsert(@Body() dto: UpsertSalesTrackingFactorSettingsDto) {
    const data = await this.service.upsertMany(dto?.settings || []);
    return { success: true, data };
  }
}
