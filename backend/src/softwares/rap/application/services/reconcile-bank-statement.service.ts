import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { IReconcileBankStatementRepository, IReconcileBankStatementRepositoryToken } from '../../domain/repositories/reconcile-bank-statement.repository.interface';
import { CreateReconcileBankStatementDto } from '../dtos/create-reconcile-bank-statement.dto';
import { UpdateReconcileBankStatementDto } from '../dtos/update-reconcile-bank-statement.dto';
import { ReconcileBankStatement } from '../../domain/entities/reconcile-bank-statement.entity';
import { ReconcileBankStatementItem } from '../../domain/entities/reconcile-bank-statement-item.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
import { FiscalYearService } from '../../../common/application/services/fiscal-year.service';
import { BankAccountService } from './bank-account.service';
import momentJalaali from 'moment-jalaali';
import moment from 'moment';

@Injectable()
export class ReconcileBankStatementService {
  constructor(
    @Inject(IReconcileBankStatementRepositoryToken)
    private readonly repository: IReconcileBankStatementRepository,
    private readonly idGenerationService: IdGenerationService,
    private readonly requestContext: RequestContextService,
    private readonly baseSettingsService: BaseSettingsService,
    private readonly fiscalYearService: FiscalYearService,
    private readonly bankAccountService: BankAccountService,
  ) {}

  async findAll() {
    const businessStructureId = this.requestContext.getBusinessStructureId()!;
    const companyId = this.requestContext.getCompanyId()!;
    const fiscalYearId = this.requestContext.getFiscalYearId()!;
    return this.repository.findAll(businessStructureId, companyId, fiscalYearId);
  }

  async findOne(id: number) {
    const businessStructureId = this.requestContext.getBusinessStructureId()!;
    const companyId = this.requestContext.getCompanyId()!;
    const fiscalYearId = this.requestContext.getFiscalYearId()!;
    const result = await this.repository.findById(id, businessStructureId, companyId, fiscalYearId);
    if (!result) throw new NotFoundException('ReconcileBankStatement not found');
    return result;
  }

  async getSuggestedDates(bankAccountRef: number) {
    const businessStructureId = this.requestContext.getBusinessStructureId()!;
    const companyId = this.requestContext.getCompanyId()!;
    
    // Find latest statement for this bank account
    const latest = await this.repository.findLatestByBankAccount(bankAccountRef, businessStructureId, companyId);
    
    if (latest) {
      return {
        fromDate: latest.Date, // Use the end date of the previous statement
        previousBalance: typeof latest.balance === 'string' ? parseFloat(latest.balance) : (latest.balance || 0),
      };
    }

    // If first statement, get establishment year from base settings
    let settings = await this.baseSettingsService.getSettingsByTab(6, companyId, undefined, undefined);
    let establishmentYearRef = settings['establishmentYearRef'];

    // If not found in company settings, try headquarter settings
    if (!establishmentYearRef && businessStructureId !== companyId) {
      settings = await this.baseSettingsService.getSettingsByTab(6, businessStructureId, undefined, undefined);
      establishmentYearRef = settings['establishmentYearRef'];
    }

    // Still not found, try default company (1) settings as a last resort
    if (!establishmentYearRef && companyId !== 1 && businessStructureId !== 1) {
      settings = await this.baseSettingsService.getSettingsByTab(6, 1, undefined, undefined);
      establishmentYearRef = settings['establishmentYearRef'];
    }

    if (establishmentYearRef) {
      const yearStr = String(establishmentYearRef).trim();
      let fiscalYear = null;
      try {
        // Try to find by ID first
        fiscalYear = await this.fiscalYearService.findOne(parseInt(yearStr, 10));
      } catch (e) {
        // If not found by ID (common if title is saved instead of ID), try to find by Title
        fiscalYear = await this.fiscalYearService.findByTitle(yearStr);
      }

      if (fiscalYear && fiscalYear.startDate) {
        // Suggested fromDate for the first statement is 1 day before the start of the fiscal year
        // to ensure transactions for the first day are included (as opening balance/beginning of period)
        const suggestedDate = moment(fiscalYear.startDate).subtract(1, 'day').toISOString();
        
        // Also get initial balance from bank account
        const bankAccount = await this.bankAccountService.findById(bankAccountRef);
        
        return {
          fromDate: suggestedDate,
          previousBalance: typeof bankAccount?.initialBalance === 'string' ? parseFloat(bankAccount.initialBalance) : (bankAccount?.initialBalance || 0),
        };
      }
    }

    return {
      fromDate: '',
      previousBalance: 0,
    };
  }

  async getNextNumbers(jalaliDateStr: string) {
    const businessStructureId = this.requestContext.getBusinessStructureId()!;
    const companyId = this.requestContext.getCompanyId()!;
    
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

  async create(dto: CreateReconcileBankStatementDto) {
    const businessStructureId = this.requestContext.getBusinessStructureId()!;
    const companyId = this.requestContext.getCompanyId()!;
    const fiscalYearId = this.requestContext.getFiscalYearId()!;

    let dateStr = '';
    if (dto.Date) {
      dateStr = momentJalaali(dto.Date).format('jYYYY/jMM/jDD');
    } else {
      dateStr = momentJalaali().format('jYYYY/jMM/jDD');
    }
    
    const docRes = await this.repository.calculateNextDocumentNumber(dateStr, businessStructureId, companyId);
    if (docRes.error) {
      throw new Error(docRes.error);
    }
    if (docRes.numberingMethod === '2' || !dto.Number) {
      dto.Number = docRes.nextValue;
    }

    const id = await this.idGenerationService.generateNextId('ReconcileBankStatement');
    
    const entity = new ReconcileBankStatement();
    Object.assign(entity, dto);

    // Validation for items
    if (dto.items) {
      const headerDateStr = dto.Date ? moment(dto.Date).format('YYYY-MM-DD') : '';
      dto.items.forEach((item, index) => {
        const rowNum = index + 1;
        if (!item.documentDate) {
          throw new Error(`ورود تاریخ سند در ردیف ${rowNum} اجباری است.`);
        }
        if (headerDateStr) {
          const itemDateStr = moment(item.documentDate).format('YYYY-MM-DD');
          if (itemDateStr > headerDateStr) {
            throw new Error(`تاریخ سند در ردیف ${rowNum} نباید از تاریخ صورتحساب بزرگتر باشد.`);
          }
        }
        const d = item.debit || 0;
        const c = item.credit || 0;
        if (d <= 0 && c <= 0) {
          throw new Error(`ورود یکی از مقادیر بدهکار یا بستانکار در ردیف ${rowNum} اجباری است.`);
        }
        if (d > 0 && c > 0) {
          throw new Error('هر ردیف در صورتحساب بانکی نمی‌تواند همزمان دارای مبلغ بدهکار و بستانکار باشد.');
        }
      });
    }

    entity.ReconcileBankStatementID = id;
    entity.businessStructureRef = businessStructureId;
    entity.companyRef = companyId;
    entity.fiscalYearRef = fiscalYearId;

    if (dto.items && dto.items.length > 0) {
      entity.items = await Promise.all(dto.items.map(async itemDto => {
        const item = new ReconcileBankStatementItem();
        Object.assign(item, itemDto);
        item.ReconcileBankStatementItemID = await this.idGenerationService.generateNextId('ReconcileBankStatementItem');
        item.businessStructureRef = businessStructureId;
        item.companyRef = companyId;
          item.ReconcileBankStatementRef = id;
        return item;
      }));
    } else {
      entity.items = [];
    }

    return this.repository.create(entity);
  }

  async update(id: number, dto: UpdateReconcileBankStatementDto) {
    const businessStructureId = this.requestContext.getBusinessStructureId()!;
    const companyId = this.requestContext.getCompanyId()!;
    const fiscalYearId = this.requestContext.getFiscalYearId()!;
    const existing = await this.findOne(id);
    
    Object.assign(existing, dto);
    existing.fiscalYearRef = fiscalYearId;

    // Validation for items
    if (dto.items) {
      const headerDateStr = dto.Date ? moment(dto.Date).format('YYYY-MM-DD') : '';
      dto.items.forEach((item, index) => {
        const rowNum = index + 1;
        if (!item.documentDate) {
          throw new Error(`ورود تاریخ سند در ردیف ${rowNum} اجباری است.`);
        }
        if (headerDateStr) {
          const itemDateStr = moment(item.documentDate).format('YYYY-MM-DD');
          if (itemDateStr > headerDateStr) {
            throw new Error(`تاریخ سند در ردیف ${rowNum} نباید از تاریخ صورتحساب بزرگتر باشد.`);
          }
        }
        const d = item.debit || 0;
        const c = item.credit || 0;
        if (d <= 0 && c <= 0) {
          throw new Error(`ورود یکی از مقادیر بدهکار یا بستانکار در ردیف ${rowNum} اجباری است.`);
        }
        if (d > 0 && c > 0) {
          throw new Error('هر ردیف در صورتحساب بانکی نمی‌تواند همزمان دارای مبلغ بدهکار و بستانکار باشد.');
        }
      });
    }

    if (dto.items) {
      const itemsMap = new Map((existing.items || []).map(i => [i.ReconcileBankStatementItemID, i]));
      existing.items = await Promise.all(dto.items.map(async itemDto => {
        let item = itemDto.ReconcileBankStatementItemID ? itemsMap.get(itemDto.ReconcileBankStatementItemID) : null;
        if (!item) {
          item = new ReconcileBankStatementItem();
          item.ReconcileBankStatementItemID = await this.idGenerationService.generateNextId('ReconcileBankStatementItem');
          item.businessStructureRef = businessStructureId;
          item.companyRef = companyId;
          item.ReconcileBankStatementRef = id;
        }
        Object.assign(item, itemDto);
        return item;
      }));
    }

    return this.repository.update(existing);
  }

  async remove(id: number) {
    const businessStructureId = this.requestContext.getBusinessStructureId()!;
    const companyId = this.requestContext.getCompanyId()!;
    await this.findOne(id);
    await this.repository.delete(id, businessStructureId, companyId);
  }
}
