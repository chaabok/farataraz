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
  async getAvailable(@Query('type') type: string, @Query('excludeProformaId') excludeProformaId?: string) {
    // Task 98-b: excludeProformaId — هنگام ویرایش پیش فاکتور، مقادیر خود آن پیش فاکتور از
    // محاسبه «مانده باز» سفارش‌ها حذف می‌شود تا سند مبنا در لیست باقی بماند
    const data = await this.service.getAvailableBaseDocuments(
      Number(type) || 0,
      Number(excludeProformaId) > 0 ? Number(excludeProformaId) : undefined,
    );
    return { success: true, data };
  }

  /**
   * Task 94: جزئیات کامل سند مبنا (هدر + اقلام + عوامل + عوامل ردیابی)
   * GET sle/base-documents/detail?type=N&id=ID
   * برای انتقال اطلاعات سند مبنا به فرم پیش فاکتور فروش هنگام انتخاب شماره مبنا
   */
  @Get('detail')
  async getDetail(@Query('type') type: string, @Query('id') id: string) {
    const data = await this.service.getBaseDocumentDetail(Number(type) || 0, Number(id) || 0);
    return { success: true, data };
  }
}
