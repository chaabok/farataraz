import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { SalesContract } from '../../domain/entities/sales-contract.entity';
import { SalesContractItem } from '../../domain/entities/sales-contract-item.entity';
import { SalesContractFactor } from '../../domain/entities/sales-contract-factor.entity';
import { CreateSalesContractDto, UpdateSalesContractDto } from '../dtos/sales-contract.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { applyDataGridParams, toLatinDigits } from '../../../../core/utils/typeorm-query-builder';

// ---------------------------------------------------------------------------
// Task 128: سرویس قرارداد فروش — همانند SalesProformaInvoiceService (Task 88)
// شماره‌گذاری سند: MAX+1 به تفکیک ساختار/شرکت/سال مالی (الگوی سفارش فروش)
// ---------------------------------------------------------------------------
@Injectable()
export class SalesContractService {
  constructor(
    @InjectRepository(SalesContract)
    private readonly repository: Repository<SalesContract>,
    @InjectRepository(SalesContractItem)
    private readonly itemRepository: Repository<SalesContractItem>,
    @InjectRepository(SalesContractFactor)
    private readonly factorRepository: Repository<SalesContractFactor>,
    private readonly idGenerationService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
  ) {}

  private getScope() {
    let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
    let compId = this.requestContextService.getCompanyId() ?? 2;
    let fiscalYearId = this.requestContextService.getFiscalYearId() ?? 1;

    if (bsId <= 1) bsId = 2;
    if (compId <= 1) compId = 2;

    return { bsId, compId, fiscalYearId };
  }

  async getNextNumber(): Promise<{ documentNumber: number }> {
    const { bsId, compId, fiscalYearId } = this.getScope();

    const maxResult = await this.repository
      .createQueryBuilder('sc')
      .select('MAX(sc.ContractNumber)', 'max')
      .where('sc.businessStructureRef = :bsId', { bsId })
      .andWhere('sc.companyRef = :compId', { compId })
      .andWhere('sc.FiscalYearRef = :fiscalYearId', { fiscalYearId })
      .getRawOne();

    const maxVal = maxResult?.max ? parseInt(maxResult.max, 10) : 0;
    return { documentNumber: maxVal + 1 };
  }

  /**
   * اعتبارسنجی فیلدهای اجباری هدر: نوع فروش، مرکز فروش، محل تحویل و روش تسویه نمی‌توانند خالی باشند
   */
  private validateRequiredRefs(dto: CreateSalesContractDto | UpdateSalesContractDto): void {
    const missing: string[] = [];
    if (!dto.SalesTypeRef || !Number(dto.SalesTypeRef)) missing.push('نوع فروش');
    if (!dto.SalesCenterRef || !Number(dto.SalesCenterRef)) missing.push('مرکز فروش');
    if (!dto.DeliveryLocationRef || !Number(dto.DeliveryLocationRef)) missing.push('محل تحویل');
    if (!dto.SettlementMethodRef || !Number(dto.SettlementMethodRef)) missing.push('روش تسویه');
    if (missing.length > 0) {
      throw new BadRequestException(`لطفاً ${missing.join('، ')} را انتخاب کنید`);
    }
  }

  async create(dto: CreateSalesContractDto): Promise<SalesContract> {
    const { bsId, compId, fiscalYearId } = this.getScope();
    const userId = this.requestContextService.getUserId() || 1;

    this.validateRequiredRefs(dto);

    let contractNumber = dto.ContractNumber ? Number(dto.ContractNumber) : 0;
    if (!contractNumber || contractNumber <= 0) {
      const next = await this.getNextNumber();
      contractNumber = next.documentNumber;
    }

    const salesContractId = await this.idGenerationService.generateNextIdBlock('SalesContracts', 1);

    const contract = this.repository.create({
      SalesContractID: salesContractId,
      ContractNumber: contractNumber,
      DocumentDate: dto.DocumentDate || null,
      ContractDate: dto.ContractDate || null,
      CustomerRef: dto.CustomerRef ? Number(dto.CustomerRef) : null,
      CustomerName: dto.CustomerName || null,
      SalesTypeRef: dto.SalesTypeRef ? Number(dto.SalesTypeRef) : null,
      SalesCenterRef: dto.SalesCenterRef ? Number(dto.SalesCenterRef) : null,
      DeliveryLocationRef: dto.DeliveryLocationRef ? Number(dto.DeliveryLocationRef) : null,
      SettlementMethodRef: dto.SettlementMethodRef ? Number(dto.SettlementMethodRef) : null,
      Status: Number(dto.Status || 1),
      ContractSubject: dto.ContractSubject || null,
      // سند مبنا — 0/undefined = بدون مبنا (null)
      BaseDocumentTypeRef: dto.BaseDocumentTypeRef !== undefined && dto.BaseDocumentTypeRef !== null && Number(dto.BaseDocumentTypeRef) > 0 ? Number(dto.BaseDocumentTypeRef) : null,
      BaseDocumentRef: dto.BaseDocumentRef ? Number(dto.BaseDocumentRef) : null,
      businessStructureRef: bsId,
      companyRef: compId,
      FiscalYearRef: fiscalYearId,
      creator: userId,
    });

    await this.repository.save(contract);

    const validItems = (Array.isArray(dto.items) ? dto.items : []).filter(
      (i) => i.ItemRef && !isNaN(Number(i.ItemRef)),
    );
    if (validItems.length > 0) {
      await this.saveItems(salesContractId, validItems);
    }

    // ذخیره عوامل قرارداد فروش (اضافات/کسورات)
    const validFactors = (Array.isArray(dto.factors) ? dto.factors : []).filter(
      (f: any) => f.FactorTitle && Number(f.Amount || 0) > 0,
    );
    if (validFactors.length > 0) {
      await this.saveFactors(salesContractId, validFactors);
    }

    return this.findOne(salesContractId);
  }

  private async saveItems(salesContractId: number, items: any[]): Promise<void> {
    const startItemId = await this.idGenerationService.generateNextIdBlock('SalesContractItems', items.length);
    const itemsToSave: SalesContractItem[] = items.map((d, idx) => {
      const qty = Number(d.Quantity || 0);
      const price = Number(d.UnitPrice || 0);
      return this.itemRepository.create({
        SalesContractItemID: startItemId + idx,
        SalesContractRef: salesContractId,
        RowNo: idx + 1,
        ItemRef: Number(d.ItemRef),
        ItemCode: d.ItemCode || null,
        ItemName: d.ItemName || null,
        UnitName: d.UnitName || null,
        Quantity: qty,
        UnitPrice: price,
        // مبلغ کل بدون اعشار (گرد شده)
        TotalPrice: d.TotalPrice !== undefined && d.TotalPrice !== null && d.TotalPrice !== ''
          ? Math.round(Number(d.TotalPrice))
          : Math.round(qty * price),
        Description: d.Description || null,
        // مقادیر عوامل ردیابی (خروجی مودال عامل ردیابی)
        TrackingFactorValues: (d as any).trackingFactorValues ?? (d as any).TrackingFactorValues ?? (d as any).trackingFactors ?? null,
      });
    });
    await this.itemRepository.save(itemsToSave);
  }

  /**
   * ذخیره عوامل قرارداد فروش — همانند پیش فاکتور فروش
   */
  private async saveFactors(salesContractId: number, factors: any[]): Promise<void> {
    const startFactorId = await this.idGenerationService.generateNextIdBlock('SalesContractFactors', factors.length);
    const factorsToSave: SalesContractFactor[] = factors.map((f, idx) =>
      this.factorRepository.create({
        SalesContractFactorID: startFactorId + idx,
        SalesContractRef: salesContractId,
        RowNo: idx + 1,
        FactorTitle: f.FactorTitle || null,
        FactorType: Number(f.FactorType || 1),
        Amount: Number(f.Amount || 0),
        Description: f.Description || null,
      }),
    );
    await this.factorRepository.save(factorsToSave);
  }

  /**
   * فهرست قراردادهای فروش با پشتیبانی کامل از پارامترهای دیتاگرید:
   * pageIndex/pageSize، sorting، columnFilters، advancedFilters و search/globalFilter.
   * خروجی { items, total } — پنل فهرست و RecordNavigator هر دو سازگار هستند.
   */
  async findAll(query?: any): Promise<{ items: SalesContract[]; total: number }> {
    const { bsId, compId, fiscalYearId } = this.getScope();

    const qb = this.repository
      .createQueryBuilder('sc')
      .where('sc.businessStructureRef = :bsId', { bsId })
      .andWhere('sc.companyRef = :compId', { compId })
      .andWhere('sc.FiscalYearRef = :fiscalYearId', { fiscalYearId })
      .orderBy('sc.ContractNumber', 'DESC');

    // جستجوی سریع (search / globalFilter): جستجوی متنی در شماره، مشتری و موضوع قرارداد
    // (ارقام بومی کاربر مثل ۳ به لاتین نرمال می‌شود تا با داده‌های لاتین مقایسه شوند)
    const searchQ = toLatinDigits(String(query?.search ?? query?.globalFilter ?? '')).trim();
    if (searchQ) {
      qb.andWhere(
        new Brackets((b) => {
          b.where('CAST(sc.ContractNumber AS VARCHAR) ILIKE :scSearch', { scSearch: `%${searchQ}%` })
            .orWhere('sc.CustomerName ILIKE :scSearch', { scSearch: `%${searchQ}%` })
            .orWhere('sc.ContractSubject ILIKE :scSearch', { scSearch: `%${searchQ}%` });
        }),
      );
    }

    // فیلترهای ستونی/پیشرفته + مرتب‌سازی؛ صفحه‌بندی فقط وقتی pageSize ارسال شده باشد
    const hasPageSize = query && query.pageSize !== undefined && query.pageSize !== null && String(query.pageSize).trim() !== '';
    applyDataGridParams(qb, query as any, 'sc', { skipPagination: !hasPageSize });

    const [items, total] = await qb.getManyAndCount();
    return { items, total };
  }

  async findOne(id: number): Promise<SalesContract> {
    const contract = await this.repository.findOne({
      where: { SalesContractID: id },
      relations: ['items', 'factors'],
    });

    if (!contract) {
      throw new NotFoundException(`قرارداد فروش با شناسه ${id} یافت نشد`);
    }

    return contract;
  }

  async update(id: number, dto: UpdateSalesContractDto): Promise<SalesContract> {
    const contract = await this.findOne(id);
    const userId = this.requestContextService.getUserId() || 1;

    this.validateRequiredRefs(dto);

    if (dto.ContractNumber !== undefined && dto.ContractNumber !== null && Number(dto.ContractNumber) > 0) {
      contract.ContractNumber = Number(dto.ContractNumber);
    }
    contract.DocumentDate = dto.DocumentDate !== undefined ? dto.DocumentDate : contract.DocumentDate;
    contract.ContractDate = dto.ContractDate !== undefined ? (dto.ContractDate || null) : contract.ContractDate;
    contract.CustomerRef = dto.CustomerRef !== undefined ? (dto.CustomerRef ? Number(dto.CustomerRef) : null) : contract.CustomerRef;
    contract.CustomerName = dto.CustomerName !== undefined ? dto.CustomerName : contract.CustomerName;
    contract.SalesTypeRef = dto.SalesTypeRef !== undefined ? (dto.SalesTypeRef ? Number(dto.SalesTypeRef) : null) : contract.SalesTypeRef;
    contract.SalesCenterRef = dto.SalesCenterRef !== undefined ? (dto.SalesCenterRef ? Number(dto.SalesCenterRef) : null) : contract.SalesCenterRef;
    contract.DeliveryLocationRef = dto.DeliveryLocationRef !== undefined ? (dto.DeliveryLocationRef ? Number(dto.DeliveryLocationRef) : null) : contract.DeliveryLocationRef;
    contract.SettlementMethodRef = dto.SettlementMethodRef !== undefined ? (dto.SettlementMethodRef ? Number(dto.SettlementMethodRef) : null) : contract.SettlementMethodRef;
    contract.Status = dto.Status !== undefined ? Number(dto.Status || 1) : contract.Status;
    contract.ContractSubject = dto.ContractSubject !== undefined ? dto.ContractSubject : contract.ContractSubject;
    // سند مبنا — 0/undefined = بدون مبنا (null)
    contract.BaseDocumentTypeRef = dto.BaseDocumentTypeRef !== undefined ? (Number(dto.BaseDocumentTypeRef) > 0 ? Number(dto.BaseDocumentTypeRef) : null) : contract.BaseDocumentTypeRef;
    contract.BaseDocumentRef = dto.BaseDocumentRef !== undefined ? (dto.BaseDocumentRef ? Number(dto.BaseDocumentRef) : null) : contract.BaseDocumentRef;
    contract.lastModifier = userId;

    await this.repository.save(contract);

    // Replace items
    await this.itemRepository.delete({ SalesContractRef: id });
    const validItems = (Array.isArray(dto.items) ? dto.items : []).filter(
      (i) => i.ItemRef && !isNaN(Number(i.ItemRef)),
    );
    if (validItems.length > 0) {
      await this.saveItems(id, validItems);
    }

    // جایگزینی عوامل قرارداد (حذف قبلی‌ها و درج دوباره)
    await this.factorRepository.delete({ SalesContractRef: id });
    const validFactors = (Array.isArray(dto.factors) ? dto.factors : []).filter(
      (f: any) => f.FactorTitle && Number(f.Amount || 0) > 0,
    );
    if (validFactors.length > 0) {
      await this.saveFactors(id, validFactors);
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    const contract = await this.findOne(id);
    await this.itemRepository.delete({ SalesContractRef: id });
    await this.factorRepository.delete({ SalesContractRef: id });
    await this.repository.remove(contract);
    return { success: true };
  }
}
