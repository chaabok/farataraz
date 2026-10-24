import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServicePurchaseInvoice } from '../../domain/entities/service-purchase-invoice.entity';
import { ServicePurchaseInvoiceDetail } from '../../domain/entities/service-purchase-invoice-detail.entity';
import { ServicePurchaseInvoiceFactor } from '../../domain/entities/service-purchase-invoice-factor.entity';
import { CreateServicePurchaseInvoiceDto, UpdateServicePurchaseInvoiceDto } from '../dtos/service-purchase-invoice.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { ensureIsoTimestamp } from '../../../../core/utils/date-parser';

@Injectable()
export class ServicePurchaseInvoiceService {
  constructor(
    @InjectRepository(ServicePurchaseInvoice)
    private readonly repository: Repository<ServicePurchaseInvoice>,
    @InjectRepository(ServicePurchaseInvoiceDetail)
    private readonly detailRepository: Repository<ServicePurchaseInvoiceDetail>,
    @InjectRepository(ServicePurchaseInvoiceFactor)
    private readonly factorRepository: Repository<ServicePurchaseInvoiceFactor>,
    private readonly idGenService: IdGenerationService,
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
      .createQueryBuilder('spi')
      .select('MAX(spi.InvoiceNumber)', 'max')
      .where('spi.businessStructureRef = :bsId', { bsId })
      .andWhere('spi.companyRef = :compId', { compId })
      .andWhere('spi.FiscalYearRef = :fiscalYearId', { fiscalYearId })
      .getRawOne();

    const maxVal = maxResult?.max ? parseInt(maxResult.max, 10) : 0;
    return { documentNumber: maxVal + 1 };
  }

  private parseRef(val: any): number | undefined {
    if (val === null || val === undefined || val === '' || val === 0 || val === '0') return undefined;
    if (typeof val === 'object') {
      const innerId = val.id ?? val.ItemID ?? val.value;
      if (innerId !== undefined && innerId !== null) {
        const num = Number(innerId);
        return !isNaN(num) && num > 0 ? num : undefined;
      }
      return undefined;
    }
    const num = Number(val);
    return !isNaN(num) && num > 0 ? num : undefined;
  }

  async create(dto: CreateServicePurchaseInvoiceDto): Promise<ServicePurchaseInvoice> {
    const { bsId, compId, fiscalYearId } = this.getScope();
    const userId = this.requestContextService.getUserId() || 1;

    let invoiceNum = dto.InvoiceNumber;
    if (!invoiceNum) {
      const next = await this.getNextNumber();
      invoiceNum = next.documentNumber;
    }

    const servicePurchaseInvoiceId = await this.idGenService.generateNextIdBlock('ServicePurchaseInvoice', 1);
    const nowTime = new Date().toTimeString().split(' ')[0];

    const entity = this.repository.create({
      ServicePurchaseInvoiceID: servicePurchaseInvoiceId,
      BaseType: Number(dto.BaseType || 1),
      SupplyRequestRef: this.parseRef(dto.SupplyRequestRef),
      SupplierRef: this.parseRef(dto.SupplierRef),
      SupplierName: dto.SupplierName || undefined,
      InvoiceNumber: invoiceNum,
      InvoiceDate: ensureIsoTimestamp(dto.InvoiceDate),
      BaseDocumentNumber: dto.BaseDocumentNumber || undefined,
      Status: Number(dto.Status || 1),
      CurrencyRef: Number(dto.CurrencyRef || 1),
      Description: dto.Description || undefined,
      businessStructureRef: bsId,
      companyRef: compId,
      FiscalYearRef: fiscalYearId,
      creator: userId,
      lastModifier: userId,
      createTime: nowTime,
      lastModificationTime: nowTime,
    });

    await this.repository.save(entity);

    // Details
    if (Array.isArray(dto.items) && dto.items.length > 0) {
      const validDetails = dto.items.filter((d) => !!this.parseRef(d.ItemRef ?? d.ItemID ?? d.itemRef));
      if (validDetails.length > 0) {
        const startDetailId = await this.idGenService.generateNextIdBlock('ServicePurchaseInvoiceDetail', validDetails.length);
        const detailsToSave = validDetails.map((d, idx) => {
          const itemRef = this.parseRef(d.ItemRef ?? d.ItemID ?? d.itemRef)!;
          return {
            ServicePurchaseInvoiceDetailID: startDetailId + idx,
            ServicePurchaseInvoiceRef: servicePurchaseInvoiceId,
            RowNo: idx + 1,
            ItemRef: itemRef,
            UnitType: Number(d.UnitType || 1),
            Quantity: Number(d.Quantity || 1),
            UnitPrice: Number(d.UnitPrice || 0),
            Discount: Number(d.Discount || 0),
            Description: d.Description || undefined,
          };
        });
        await this.detailRepository.insert(detailsToSave);
      }
    }

    // Factors
    if (Array.isArray(dto.factors) && dto.factors.length > 0) {
      const validFactors = dto.factors.filter((f) => !!f.FactorTitle || Number(f.Amount) > 0);
      if (validFactors.length > 0) {
        const startFactorId = await this.idGenService.generateNextIdBlock('ServicePurchaseInvoiceFactor', validFactors.length);
        const factorsToSave = validFactors.map((f, idx) => {
          return {
            ServicePurchaseInvoiceFactorID: startFactorId + idx,
            ServicePurchaseInvoiceRef: servicePurchaseInvoiceId,
            RowNo: idx + 1,
            FactorTitle: f.FactorTitle || '',
            FactorType: Number(f.FactorType || 1),
            Amount: Number(f.Amount || 0),
            Description: f.Description || undefined,
          };
        });
        await this.factorRepository.insert(factorsToSave);
      }
    }

    return this.findOne(servicePurchaseInvoiceId);
  }

  async findAll(query?: any): Promise<ServicePurchaseInvoice[]> {
    const { bsId, compId, fiscalYearId } = this.getScope();

    return this.repository
      .createQueryBuilder('spi')
      .where('spi.businessStructureRef = :bsId', { bsId })
      .andWhere('spi.companyRef = :compId', { compId })
      .andWhere('spi.FiscalYearRef = :fiscalYearId', { fiscalYearId })
      .orderBy('spi.InvoiceNumber', 'DESC')
      .getMany();
  }

  async findOne(id: number): Promise<ServicePurchaseInvoice> {
    if (!id || isNaN(id)) {
      throw new NotFoundException(`شناسه ${id} نامعتبر است`);
    }
    const spi = await this.repository.findOne({
      where: { ServicePurchaseInvoiceID: id },
      relations: ['details', 'details.item', 'details.item.MeasurementUnit', 'factors'],
    });

    if (!spi) {
      throw new NotFoundException(`فاکتور خرید خدمت با شناسه ${id} یافت نشد`);
    }

    return spi;
  }

  async update(id: number, dto: UpdateServicePurchaseInvoiceDto): Promise<ServicePurchaseInvoice> {
    const spi = await this.findOne(id);
    const userId = this.requestContextService.getUserId() || 1;

    spi.BaseType = Number(dto.BaseType || spi.BaseType || 1);
    spi.SupplyRequestRef = dto.SupplyRequestRef !== undefined ? this.parseRef(dto.SupplyRequestRef) : spi.SupplyRequestRef;
    spi.SupplierRef = dto.SupplierRef !== undefined ? this.parseRef(dto.SupplierRef) : spi.SupplierRef;
    spi.SupplierName = dto.SupplierName !== undefined ? dto.SupplierName : spi.SupplierName;
    spi.InvoiceNumber = dto.InvoiceNumber || spi.InvoiceNumber;
    spi.InvoiceDate = dto.InvoiceDate ? ensureIsoTimestamp(dto.InvoiceDate) : spi.InvoiceDate;
    spi.BaseDocumentNumber = dto.BaseDocumentNumber !== undefined ? dto.BaseDocumentNumber : spi.BaseDocumentNumber;
    spi.Status = Number(dto.Status || spi.Status);
    spi.CurrencyRef = Number(dto.CurrencyRef || spi.CurrencyRef);
    spi.Description = dto.Description !== undefined ? dto.Description : spi.Description;
    spi.lastModifier = userId;

    await this.repository.save(spi);

    // Replace details
    await this.detailRepository.delete({ ServicePurchaseInvoiceRef: id });
    if (Array.isArray(dto.items) && dto.items.length > 0) {
      const validDetails = dto.items.filter((d) => !!this.parseRef(d.ItemRef ?? d.ItemID ?? d.itemRef));
      if (validDetails.length > 0) {
        const startDetailId = await this.idGenService.generateNextIdBlock('ServicePurchaseInvoiceDetail', validDetails.length);
        const detailsToSave = validDetails.map((d, idx) => {
          const itemRef = this.parseRef(d.ItemRef ?? d.ItemID ?? d.itemRef)!;
          return {
            ServicePurchaseInvoiceDetailID: startDetailId + idx,
            ServicePurchaseInvoiceRef: id,
            RowNo: idx + 1,
            ItemRef: itemRef,
            UnitType: Number(d.UnitType || 1),
            Quantity: Number(d.Quantity || 1),
            UnitPrice: Number(d.UnitPrice || 0),
            Discount: Number(d.Discount || 0),
            Description: d.Description || undefined,
          };
        });
        await this.detailRepository.insert(detailsToSave);
      }
    }

    // Replace factors
    await this.factorRepository.delete({ ServicePurchaseInvoiceRef: id });
    if (Array.isArray(dto.factors) && dto.factors.length > 0) {
      const validFactors = dto.factors.filter((f) => !!f.FactorTitle || Number(f.Amount) > 0);
      if (validFactors.length > 0) {
        const startFactorId = await this.idGenService.generateNextIdBlock('ServicePurchaseInvoiceFactor', validFactors.length);
        const factorsToSave = validFactors.map((f, idx) => {
          return {
            ServicePurchaseInvoiceFactorID: startFactorId + idx,
            ServicePurchaseInvoiceRef: id,
            RowNo: idx + 1,
            FactorTitle: f.FactorTitle || '',
            FactorType: Number(f.FactorType || 1),
            Amount: Number(f.Amount || 0),
            Description: f.Description || undefined,
          };
        });
        await this.factorRepository.insert(factorsToSave);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    const spi = await this.findOne(id);
    await this.detailRepository.delete({ ServicePurchaseInvoiceRef: id });
    await this.factorRepository.delete({ ServicePurchaseInvoiceRef: id });
    await this.repository.remove(spi);
    return { success: true };
  }
}
