import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IReceivedChequeOperationRepository } from '../../domain/repositories/received-cheque-operation.repository.interface';
import { IReceivedChequeOperationRepositoryToken } from '../../domain/repositories/received-cheque-operation.repository.interface';
import { CreateReceivedChequeOperationDto } from '../dtos/create-received-cheque-operation.dto';
import { UpdateReceivedChequeOperationDto } from '../dtos/update-received-cheque-operation.dto';
import { AutoVoucherService } from './auto-voucher.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import momentJalaali from 'moment-jalaali';
import { ReceivedChequeOperation } from '../../domain/entities/received-cheque-operation.entity';
import { ReceivedChequeOperationItem } from '../../domain/entities/received-cheque-operation-item.entity';

@Injectable()
export class ReceivedChequeOperationService {
  constructor(
    @Inject(IReceivedChequeOperationRepositoryToken)
    private readonly repo: IReceivedChequeOperationRepository,
    private readonly requestContext: RequestContextService,
    private readonly idGenService: IdGenerationService,
    private readonly autoVoucherService: AutoVoucherService,
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

  async create(dto: CreateReceivedChequeOperationDto) {
    const compId = this.requestContext.getCompanyId() || 2;
    const bsId = this.requestContext.getBusinessStructureId() || 2;
    
    let dateStr = '';
    if (dto.documentDate) {
      dateStr = momentJalaali(dto.documentDate).format('jYYYY/jMM/jDD');
    } else {
      dateStr = momentJalaali().format('jYYYY/jMM/jDD');
    }

    const docRes = await this.repo.calculateNextDocumentNumber(dateStr, bsId, compId);
    if (docRes.error) {
      throw new Error(docRes.error);
    }
    if (docRes.numberingMethod === '2' || !dto.documentNumber) {
      dto.documentNumber = docRes.nextValue;
    }

    const id = await this.idGenService.generateNextId('ReceivedChequeOperation');

    let items: ReceivedChequeOperationItem[] = [];
    if (dto.items && dto.items.length > 0) {
      items = await Promise.all(dto.items.map(async (item) => {
        const itemId = item.receivedChequeOperationItemId || await this.idGenService.generateNextId('ReceivedChequeOperationItem');
        const entityItem = new ReceivedChequeOperationItem();
        entityItem.receivedChequeOperationItemId = itemId;
        entityItem.operationRef = id;
        entityItem.receiptChequeRef = item.receiptChequeRef;
        entityItem.chequeStatus = item.chequeStatus || null;
        entityItem.forecastDate = item.forecastDate || null;
        entityItem.cashRef = item.cashRef || null;
        return entityItem;
      }));
    }

    const payload: Partial<ReceivedChequeOperation> = {
      receivedChequeOperationId: id,
      operationType: dto.operationType,
      documentNumber: dto.documentNumber,
      documentDate: dto.documentDate,
      assignmentNumber: dto.assignmentNumber,
      status: dto.status || 1,
      bankAccountRef: dto.bankAccountRef || null,
      realizerRef: dto.realizerRef || null,
      voucherHeaderRef: dto.voucherHeaderRef || null,
      items: items,
      companyRef: dto.companyRef || compId,
      businessStructureRef: dto.businessStructureRef || bsId,
      fiscalYearRef: dto.fiscalYearRef || 1,
    };

    const saved = await this.repo.create(payload);

    // Auto Voucher
    const voucherId = await this.autoVoucherService.generateAutoVoucherIfNeeded(
      'ReceivedChequeOperation',
      saved.status,
      saved.documentDate,
      saved.documentNumber,
      saved.voucherHeaderRef,
      saved.receivedChequeOperationId
    );
    if (voucherId) {
      await this.repo.update(saved.receivedChequeOperationId, { voucherHeaderRef: voucherId });
      saved.voucherHeaderRef = voucherId;
    }

    return saved;
  }

  async update(id: number, dto: UpdateReceivedChequeOperationDto) {
    const bsId = this.requestContext.getBusinessStructureId() || 2;
    const compId = this.requestContext.getCompanyId() || 2;
    const existing = await this.repo.findById(id);
    if (!existing) {
      throw new NotFoundException('ReceivedChequeOperation not found');
    }

    let dateStr = '';
    if (dto.documentDate) {
      dateStr = momentJalaali(dto.documentDate).format('jYYYY/jMM/jDD');
    } else if (existing.documentDate) {
      dateStr = momentJalaali(existing.documentDate).format('jYYYY/jMM/jDD');
    }

    const docRes = await this.repo.calculateNextDocumentNumber(dateStr, bsId, compId);
    if (docRes.numberingMethod === '2') {
       dto.documentNumber = existing.documentNumber;
    }

    const payload: Partial<ReceivedChequeOperation> = {
      operationType: dto.operationType,
      documentNumber: dto.documentNumber,
      documentDate: dto.documentDate,
      assignmentNumber: dto.assignmentNumber,
      status: dto.status,
      bankAccountRef: dto.bankAccountRef !== undefined ? dto.bankAccountRef : existing.bankAccountRef,
      realizerRef: dto.realizerRef !== undefined ? dto.realizerRef : existing.realizerRef,
      voucherHeaderRef: dto.voucherHeaderRef !== undefined ? dto.voucherHeaderRef : existing.voucherHeaderRef,
    };

    if (dto.items) {
      const items: ReceivedChequeOperationItem[] = await Promise.all(dto.items.map(async (item) => {
        const itemId = item.receivedChequeOperationItemId || await this.idGenService.generateNextId('ReceivedChequeOperationItem');
        const entityItem = new ReceivedChequeOperationItem();
        entityItem.receivedChequeOperationItemId = itemId;
        entityItem.operationRef = id;
        entityItem.receiptChequeRef = item.receiptChequeRef;
        entityItem.chequeStatus = item.chequeStatus || null;
        entityItem.forecastDate = item.forecastDate || null;
        entityItem.cashRef = item.cashRef || null;
        return entityItem;
      }));
      payload.items = items;
    }

    await this.repo.update(id, payload);

    const updated = await this.repo.findById(id);
    if (updated) {
      const voucherId = await this.autoVoucherService.generateAutoVoucherIfNeeded(
        'ReceivedChequeOperation',
        updated.status,
        updated.documentDate,
        updated.documentNumber,
        updated.voucherHeaderRef,
        updated.receivedChequeOperationId
      );
      if (voucherId && voucherId !== updated.voucherHeaderRef) {
        await this.repo.update(id, { voucherHeaderRef: voucherId });
        updated.voucherHeaderRef = voucherId;
      }
    }

    return updated;
  }

  async delete(id: number) {
    await this.repo.delete(id);
  }

  async findById(id: number) {
    return await this.repo.findById(id);
  }

  async findAll(filters: any) {
    const compId = this.requestContext.getCompanyId() || 2;
    const bsId = this.requestContext.getBusinessStructureId() || 2;
    const finalFilters = {
      ...filters,
      companyRef: compId,
      businessStructureRef: bsId,
    };
    return await this.repo.findAll(finalFilters);
  }
}
