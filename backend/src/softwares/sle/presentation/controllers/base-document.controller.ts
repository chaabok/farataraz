import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { SleBaseDocumentService } from '../../application/services/base-document.service';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

/**
 * Task 93: سند مبنا فرم‌های فروش
 * GET sle/base-documents/available?type=N
 *   N = کد نوع سند مبنا (1=سفارش فروش، 2=پیش فاکتور فروش، ...)
 * خروجی: اسناد قابل انتخاب به‌عنوان مبنا [{ id, number, date, customer }]
 */
@UseGuards(JwtAuthGuard)
@Controller('sle/base-documents')
export class SleBaseDocumentController {
  constructor(private readonly service: SleBaseDocumentService) {}

  @Get('available')
  async getAvailable(@Query('type') type: string) {
    const data = await this.service.getAvailableBaseDocuments(Number(type) || 0);
    return { success: true, data };
  }
}
