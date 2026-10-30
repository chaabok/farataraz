import { Controller, Get, Query, ParseIntPipe, Optional } from '@nestjs/common';
import { BaseDocumentService } from '../../application/services/base-document.service';

@Controller('inv/base-documents')
export class BaseDocumentController {
  constructor(private readonly baseDocumentService: BaseDocumentService) {}

  @Get('available')
  async getAvailableBaseDocuments(
    @Query('docType') docType: string,
    @Query('targetDocType') targetDocType?: string,
  ) {
    if (!docType) return [];
    return this.baseDocumentService.getAvailableBaseDocuments(docType, targetDocType);
  }

  @Get('details')
  async getBaseDocumentDetails(
    @Query('docType') docType: string,
    @Query('id') idStr: string,
    @Query('currentDocId') currentDocIdStr?: string,
    @Query('targetDocType') targetDocTypeQuery?: string,
  ) {
    const id = Number(idStr);
    const currentDocId = currentDocIdStr ? Number(currentDocIdStr) : undefined;
    if (!docType || !id) return null;
    const targetDocType = targetDocTypeQuery || 'WarehouseReceipt';
    return this.baseDocumentService.getBaseDocumentDetails(docType, id, currentDocId, targetDocType);
  }

  /**
   * Task 132: تاریخ سند مبنا — برای کنترل «تاریخ ثبت اطلاعات نمی‌تواند قبل از
   * تاریخ سند مبنا باشد» در اسناد انبار؛ هنگام ویرایش سند ذخیره‌شده با مبنا،
   * تاریخ مبنا از این سرویس خوانده می‌شود.
   */
  @Get('date')
  async getBaseDocumentDate(@Query('docType') docType: string, @Query('id') idStr: string) {
    const id = Number(idStr);
    if (!docType || !id) return { success: true, date: '' };
    const date = await this.baseDocumentService.getBaseDocumentDate(docType, id);
    return { success: true, date };
  }
}
