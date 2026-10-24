import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { DocumentAccountingInfoService } from '../../application/services/document-accounting-info.service';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

@Controller('rap/document-accounting-info')
@UseGuards(JwtAuthGuard)

export class DocumentAccountingInfoController {
  constructor(private readonly service: DocumentAccountingInfoService) {
    console.log('DocumentAccountingInfoController instantiated!');
  }

  @Get()
  async getByDocument(
    @Query('documentType') documentType: string,
    @Query('documentRef') documentRef: number
  ) {
    if (!documentType || !documentRef) {
      return { success: false, message: 'Parameters required' };
    }
    const result = await this.service.getByDocumentWithAccounts(documentType, Number(documentRef));
    return { success: true, ...result };
  }

  @Post()
  async save(@Body() body: any) {
    if (Array.isArray(body)) {
      if (body.length === 0) {
        return { success: true, data: [] };
      }
      const documentType = body[0].documentType;
      const documentRef = body[0].documentRef;
      if (!documentType || !documentRef) {
        return { success: false, message: 'Parameters required in payload items' };
      }
      const saved = await this.service.save(documentType, Number(documentRef), body);
      return { success: true, data: saved };
    } else {
      const { documentType, documentRef, ...data } = body;
      if (!documentType || !documentRef) {
        return { success: false, message: 'Parameters required' };
      }
      const saved = await this.service.save(documentType, Number(documentRef), data);
      return { success: true, data: saved };
    }
  }
}
