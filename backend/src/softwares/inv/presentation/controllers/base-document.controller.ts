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
}
