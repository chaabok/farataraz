import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { IPettyCashSummaryRepository } from '../../domain/repositories/petty-cash-summary.repository.interface';
import { CreatePettyCashSummaryDto } from '../dtos/create-petty-cash-summary.dto';
import { UpdatePettyCashSummaryDto } from '../dtos/update-petty-cash-summary.dto';
import { AutoVoucherService } from './auto-voucher.service';
import { PettyCashSummary } from '../../domain/entities/petty-cash-summary.entity';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { PettyCashSummaryItem } from '../../domain/entities/petty-cash-summary-item.entity';
import momentJalaali from 'moment-jalaali';

function parseSafeDate(dateStr: any): Date | null {
  if (dateStr === undefined || dateStr === null || dateStr === '') return null;
  let d: Date;
  if (typeof dateStr === 'string') {
    const persianDigits = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
    const arabicDigits = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
    let cleanStr = dateStr;
    for (let i = 0; i < 10; i++) {
      cleanStr = cleanStr.replace(persianDigits[i], String(i)).replace(arabicDigits[i], String(i));
    }
    
    if (cleanStr.includes('/')) {
      d = momentJalaali(cleanStr, 'jYYYY/jMM/jDD').toDate();
    } else if (cleanStr.includes('-')) {
      const parts = cleanStr.split('-');
      if (parts.length === 3 && !cleanStr.includes('T')) {
        d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      } else {
        d = new Date(cleanStr);
      }
    } else {
      d = new Date(cleanStr);
    }
  } else {
    d = new Date(dateStr);
  }
  return isNaN(d.getTime()) ? null : d;
}

@Injectable()
export class PettyCashSummaryService {
  constructor(
    @Inject('IPettyCashSummaryRepository')
    private readonly repository: IPettyCashSummaryRepository,
    private readonly requestContextService: RequestContextService,
    private readonly idGenerationService: IdGenerationService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {}

  async findAll(options: any) {
    const [data, total] = await this.repository.findAll(options);
    
    const mappedData = data.map(item => {
      let totalAmount = 0;
      if (item.items && Array.isArray(item.items)) {
        totalAmount = item.items.reduce((sum, current) => sum + (Number(current.amount) || 0), 0);
      }
      
      let pettyCashName = '';
      if (item.pettyCash?.party) {
        if (item.pettyCash.party.detailedAccount?.title) {
          pettyCashName = item.pettyCash.party.detailedAccount.title;
        } else {
          pettyCashName = `${item.pettyCash.party.firstName || ''} ${item.pettyCash.party.lastName || ''}`.trim();
        }
      }
      
      const currentBalance = item.pettyCash?.currentBalance || 0;

      return {
        ...item,
        pettyCashName,
        currentBalance,
        totalAmount
      };
    });

    return { items: mappedData, total };
  }

  async findOne(id: number): Promise<PettyCashSummary> {
    const entity = await this.repository.findById(id);
    if (!entity) {
      throw new NotFoundException(`PettyCashSummary with ID ${id} not found`);
    }
    return entity;
  }

  async getNextNumbers(jalaliDateStr: string) {
    const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    
    let dateStr = jalaliDateStr;
    if (!dateStr) {
      dateStr = momentJalaali().format('jYYYY/jMM/jDD');
    }

    const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
    
    return {
      documentNumber: docRes.nextValue,
      isDocumentNumberAuto: docRes.numberingMethod === '2',
      error: docRes.error || null,
    };
  }

  async create(createDto: CreatePettyCashSummaryDto): Promise<PettyCashSummary> {
    const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    const id = await this.idGenerationService.generateNextId('PettyCashSummaries');
    
    let dateStr = '';
    if (createDto.date) {
      dateStr = momentJalaali(createDto.date).format('jYYYY/jMM/jDD');
    } else {
      dateStr = momentJalaali().format('jYYYY/jMM/jDD');
    }
    
    const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
    if (docRes.error) {
      throw new BadRequestException(docRes.error);
    }
    if (docRes.numberingMethod === '2' || !createDto.number) {
      createDto.number = Number(docRes.nextValue);
    }

    // Convert string items dates properly if needed or let class-transformer handle it
    const entity = new PettyCashSummary();
    entity.pettyCashSummaryId = id;
    entity.pettyCashRef = createDto.pettyCashRef;
    entity.number = createDto.number;
    entity.date = parseSafeDate(createDto.date) || new Date();
    entity.description = createDto.description;
    entity.fiscalYearRef = createDto.fiscalYearRef || this.requestContextService.getFiscalYearId() || 1;
    if (createDto.voucherHeaderRef !== undefined) {
      entity.voucherHeaderRef = createDto.voucherHeaderRef;
    }
    if (createDto.state !== undefined) {
      entity.state = createDto.state;
    }
    
    entity.businessStructureRef = businessStructureId;
    entity.companyRef = companyId;

    if (createDto.items && createDto.items.length > 0) {
      entity.items = await Promise.all(createDto.items.map(async itemDto => {
        const item = new PettyCashSummaryItem();
        item.pettyCashSummaryItemId = await this.idGenerationService.generateNextId('PettyCashSummaryItems');
        item.reasonRef = itemDto.reasonRef;
        item.paymentReceiptNumber = itemDto.paymentReceiptNumber;
        item.paymentReceiptDate = parseSafeDate(itemDto.paymentReceiptDate);
        item.amount = itemDto.amount;
        item.description = itemDto.description;
        item.businessStructureRef = businessStructureId;
        item.companyRef = companyId;
        item.pettyCashSummaryRef = id;
        return item;
      }));
    } else {
      entity.items = [];
    }

    return this.repository.create(entity);
  }

  async update(id: number, updateDto: UpdatePettyCashSummaryDto): Promise<PettyCashSummary> {
    const entity = await this.findOne(id);
    const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId()! > 1) ? this.requestContextService.getBusinessStructureId()! : 2;
    const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId()! > 1) ? this.requestContextService.getCompanyId()! : 2;
    
    let dateStr = '';
    if (updateDto.date) {
      dateStr = momentJalaali(updateDto.date).format('jYYYY/jMM/jDD');
    } else if (entity.date) {
      dateStr = momentJalaali(entity.date).format('jYYYY/jMM/jDD');
    }

    const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
    if (docRes.numberingMethod === '2') {
       // if numbering is automatic, keep the original document number
       if (updateDto.number !== undefined) {
         updateDto.number = entity.number;
       }
    }

    if (updateDto.pettyCashRef !== undefined) entity.pettyCashRef = updateDto.pettyCashRef;
    if (updateDto.number !== undefined) entity.number = updateDto.number;
    if (updateDto.date !== undefined) {
      const parsedDate = parseSafeDate(updateDto.date);
      if (parsedDate) {
        entity.date = parsedDate;
      }
    }
    if (updateDto.description !== undefined) entity.description = updateDto.description;
    if (updateDto.fiscalYearRef !== undefined) entity.fiscalYearRef = updateDto.fiscalYearRef;
    if (updateDto.voucherHeaderRef !== undefined) entity.voucherHeaderRef = updateDto.voucherHeaderRef;
    if (updateDto.state !== undefined) entity.state = updateDto.state;

    if (updateDto.items) {
      await this.dataSource.manager.delete(PettyCashSummaryItem, { pettyCashSummaryRef: id });
      const newItems = await Promise.all(updateDto.items.map(async itemDto => {
        const item = new PettyCashSummaryItem();
        item.pettyCashSummaryItemId = await this.idGenerationService.generateNextId('PettyCashSummaryItems');
        item.reasonRef = itemDto.reasonRef;
        item.paymentReceiptNumber = itemDto.paymentReceiptNumber;
        item.paymentReceiptDate = parseSafeDate(itemDto.paymentReceiptDate);
        item.amount = itemDto.amount;
        item.description = itemDto.description;
        item.businessStructureRef = businessStructureId;
        item.companyRef = companyId;
        item.pettyCashSummaryRef = entity.pettyCashSummaryId;
        return item;
      }));
      await this.dataSource.manager.save(newItems);
      delete entity.items;
    }

    const saved = await this.repository.create(entity);
    if (updateDto.items) {
      saved.items = await this.dataSource.manager.find(PettyCashSummaryItem, { where: { pettyCashSummaryRef: id } });
    }
    return saved;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id); // ensure exists
    await this.repository.delete(id);
  }

  async isUsed(id: number): Promise<boolean> {
    return this.repository.isUsed(id);
  }
}
