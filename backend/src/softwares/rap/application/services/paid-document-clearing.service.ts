import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IPaidDocumentClearingRepository, IPaidDocumentClearingRepositoryToken } from '../../domain/repositories/paid-document-clearing.repository.interface';
import { CreatePaidDocumentClearingDto } from '../dtos/create-paid-document-clearing.dto';
import { UpdatePaidDocumentClearingDto } from '../dtos/update-paid-document-clearing.dto';
import { AutoVoucherService } from './auto-voucher.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { DocumentAccountingInfoService } from './document-accounting-info.service';
import momentJalaali from 'moment-jalaali';
import { PaidDocumentClearing } from '../../domain/entities/paid-document-clearing.entity';
import { PaidDocumentClearingItem } from '../../domain/entities/paid-document-clearing-item.entity';

@Injectable()
export class PaidDocumentClearingService {
  constructor(
    @Inject(IPaidDocumentClearingRepositoryToken)
    private readonly repo: IPaidDocumentClearingRepository,
    private readonly requestContext: RequestContextService,
    private readonly idGenService: IdGenerationService,
    private readonly documentAccountingInfoService: DocumentAccountingInfoService,
  ) {}

  async getNextNumbers(jalaliDateStr: string) {
    const bsId = this.requestContext.getBusinessStructureId() || 2;
    const compId = this.requestContext.getCompanyId() || 2;
    
    let dateStr = jalaliDateStr;
    if (!dateStr) {
      dateStr = momentJalaali().format('jYYYY/jMM/jDD');
    }

    const docRes = await this.repo.calculateNextDocumentNumber(dateStr, bsId, compId);
    
    return {
      documentNumber: docRes.nextValue,
      isDocumentNumberAuto: docRes.numberingMethod === '2',
      error: docRes.error || null,
    };
  }

  async create(dto: CreatePaidDocumentClearingDto) {
    const compId = this.requestContext.getCompanyId() || 2;
    const bsId = this.requestContext.getBusinessStructureId() || 2;
    const defaultFiscalYear = this.requestContext.getFiscalYearId() || 1;
    
    let dateStr = '';
    if (dto.date) {
      dateStr = momentJalaali(dto.date, 'jYYYY/jMM/jDD').format('jYYYY/jMM/jDD');
    } else {
      dateStr = momentJalaali().format('jYYYY/jMM/jDD');
    }

    const docRes = await this.repo.calculateNextDocumentNumber(dateStr, bsId, compId);
    if (docRes.error) {
      throw new Error(docRes.error);
    }
    if (docRes.numberingMethod === '2' || !dto.number) {
      dto.number = docRes.nextValue;
    }

    const id = await this.idGenService.generateNextId('PaidDocumentClearing');

    let items: PaidDocumentClearingItem[] = [];
    if (dto.items && dto.items.length > 0) {
      items = await Promise.all(dto.items.map(async (item) => {
        const itemId = await this.idGenService.generateNextId('PaidDocumentClearingItem');
        const entityItem = new PaidDocumentClearingItem();
        entityItem.paidDocumentClearingItemId = itemId;
        entityItem.documentType = item.documentType;
        entityItem.paidDocumentClearingRef = id;
        entityItem.documentId = item.documentId;
        return entityItem;
      }));
    }

    const payload: Partial<PaidDocumentClearing> = {
      paidDocumentClearingId: id,
      number: dto.number,
      date: dto.date,
      bankAccountRef: dto.bankAccountRef,
      description: dto.description || null,
      status: dto.status !== undefined ? dto.status : 2,
      voucherHeaderRef: dto.voucherHeaderRef || null,
      items: items,
      companyRef: dto.companyRef || compId,
      businessStructureRef: dto.businessStructureRef || bsId,
      fiscalYearRef: dto.fiscalYearRef || defaultFiscalYear,
    };

    const saved = await this.repo.create(payload as any);
    await this.documentAccountingInfoService.saveDefaults('PaidDocumentClearing', saved.paidDocumentClearingId);
    return saved;
  }

  async update(id: number, dto: UpdatePaidDocumentClearingDto) {
    const dtoLocal: any = dto;
    const bsId = this.requestContext.getBusinessStructureId() || 2;
    const compId = this.requestContext.getCompanyId() || 2;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException('PaidDocumentClearing not found');
    }

    let dateStr = '';
    if (dtoLocal.date) {
      dateStr = momentJalaali(dtoLocal.date, 'jYYYY/jMM/jDD').format('jYYYY/jMM/jDD');
    } else if (existing.date) {
      dateStr = momentJalaali(existing.date, 'jYYYY/jMM/jDD').format('jYYYY/jMM/jDD');
    }

    const docRes = await this.repo.calculateNextDocumentNumber(dateStr, bsId, compId);
    if (docRes.numberingMethod === '2') {
       dtoLocal.number = existing.number;
    }

    const payload: Partial<PaidDocumentClearing> = {
      number: dtoLocal.number,
      date: dtoLocal.date,
      bankAccountRef: dtoLocal.bankAccountRef !== undefined ? dtoLocal.bankAccountRef : existing.bankAccountRef,
      description: dtoLocal.description,
      status: dtoLocal.status !== undefined ? dtoLocal.status : existing.status,
      fiscalYearRef: dtoLocal.fiscalYearRef !== undefined ? dtoLocal.fiscalYearRef : existing.fiscalYearRef,
      voucherHeaderRef: dtoLocal.voucherHeaderRef !== undefined ? dtoLocal.voucherHeaderRef : existing.voucherHeaderRef,
    };

    if (dtoLocal.items) {
      const items: PaidDocumentClearingItem[] = await Promise.all(dtoLocal.items.map(async (item: any) => {
        const itemId = await this.idGenService.generateNextId('PaidDocumentClearingItem');
        const entityItem = new PaidDocumentClearingItem();
        entityItem.paidDocumentClearingItemId = itemId;
        entityItem.documentType = item.documentType;
        entityItem.paidDocumentClearingRef = id;
        entityItem.documentId = item.documentId;
        return entityItem;
      }));
      payload.items = items;
    }

    // Since we manage items manually, first delete old items to prevent orphaned records without cascade updates correctly mapped
    await this.repo.manager.delete(PaidDocumentClearingItem, { paidDocumentClearingRef: id });

    const updated = await this.repo.update(id, payload as any);
    await this.documentAccountingInfoService.saveDefaults('PaidDocumentClearing', id);
    return updated;
  }

  async delete(id: number) {
    await this.repo.delete(id);
  }

  async findById(id: number) {
    return await this.repo.findByIdCustom(id);
  }

  async findAll(filters: any) {
    const compId = this.requestContext.getCompanyId() || 2;
    const bsId = this.requestContext.getBusinessStructureId() || 2;
    const finalFilters = {
      ...filters,
      companyRef: compId,
      businessStructureRef: bsId,
    };
    return await this.repo.findAllCustom(finalFilters);
  }
}
