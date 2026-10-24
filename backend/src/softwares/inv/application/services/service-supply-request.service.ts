import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceSupplyRequest } from '../../domain/entities/service-supply-request.entity';
import { ServiceSupplyRequestDetail } from '../../domain/entities/service-supply-request-detail.entity';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';
import { CreateServiceSupplyRequestDto, UpdateServiceSupplyRequestDto } from '../dtos/service-supply-request.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { ensureIsoTimestamp } from '../../../../core/utils/date-parser';

@Injectable()
export class ServiceSupplyRequestService implements OnModuleInit {
  constructor(
    @InjectRepository(ServiceSupplyRequest)
    private readonly repository: Repository<ServiceSupplyRequest>,
    @InjectRepository(ServiceSupplyRequestDetail)
    private readonly detailRepository: Repository<ServiceSupplyRequestDetail>,
    private readonly idGenService: IdGenerationService,
    private readonly requestContextService: RequestContextService,
  ) {}

  async onModuleInit() {
    try {
      const requests = await this.repository.find();
      for (const req of requests) {
        const norm = ensureIsoTimestamp(req.RequestDate);
        if (norm !== req.RequestDate) {
          req.RequestDate = norm;
          await this.repository.save(req);
        }
      }

      const details = await this.detailRepository.find();
      for (const d of details) {
        if (d.DeliveryDate) {
          const norm = ensureIsoTimestamp(d.DeliveryDate);
          if (norm !== d.DeliveryDate) {
            d.DeliveryDate = norm;
            await this.detailRepository.save(d);
          }
        }
      }
    } catch (e) {
      console.error("ServiceSupplyRequestService onModuleInit migration error:", e);
    }
  }

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
      .createQueryBuilder('req')
      .select('MAX(req.RequestNumber)', 'max')
      .where('req.businessStructureRef = :bsId', { bsId })
      .andWhere('req.companyRef = :compId', { compId })
      .andWhere('req.FiscalYearRef = :fiscalYearId', { fiscalYearId })
      .getRawOne();

    const maxVal = maxResult?.max ? parseInt(maxResult.max, 10) : 0;
    return { documentNumber: maxVal + 1 };
  }

  async getRequesters(): Promise<any[]> {
    try {
      const accounts = await this.repository.manager.find(DetailedAccount, {
        relations: ['detailedType'],
        where: { isActive: true },
        order: { code: 'ASC' },
      });

      const filtered = accounts.filter((da) => {
        const dt = da.detailedType;
        const dtCode = String(dt?.code || '');
        const dtTitle = String(dt?.title || '');

        return (
          dtCode === '8' ||
          dtCode === '15' ||
          dtTitle.includes('مرکز هزینه') ||
          dtTitle.includes('مراکز هزینه') ||
          dtTitle.includes('پروژه')
        );
      });

      return filtered.map((da) => ({
        id: da.detailedAccountId,
        code: da.code || '',
        title: da.title || '',
        title2: da.detailedType?.title || '',
        title_en: da.title_en || '',
        detailedAccountId: da.detailedAccountId,
      }));
    } catch (err) {
      console.error('Error fetching requesters in ServiceSupplyRequestService:', err);
      return [];
    }
  }

  private parseRef(val: any): number | undefined {
    if (val === null || val === undefined || val === '' || val === 0 || val === '0') return undefined;
    if (typeof val === 'object') {
      const innerId = val.id ?? val.WarehouseID ?? val.ProjectID ?? val.ItemID ?? val.value;
      if (innerId !== undefined && innerId !== null) {
        const num = Number(innerId);
        return !isNaN(num) && num > 0 ? num : undefined;
      }
      return undefined;
    }
    const num = Number(val);
    return !isNaN(num) && num > 0 ? num : undefined;
  }

  private parseString(val: any): string {
    if (!val) return '';
    if (typeof val === 'object') {
      return String(val.title || val.name || val.label || '');
    }
    return String(val);
  }

  async create(dto: CreateServiceSupplyRequestDto): Promise<ServiceSupplyRequest> {
    const { bsId, compId, fiscalYearId } = this.getScope();
    const userId = this.requestContextService.getUserId() || 1;

    let reqNum = dto.RequestNumber;
    if (!reqNum) {
      const next = await this.getNextNumber();
      reqNum = next.documentNumber;
    }

    const serviceSupplyRequestId = await this.idGenService.generateNextIdBlock('ServiceSupplyRequest', 1);

    const nowTime = new Date().toTimeString().split(' ')[0];

    const serviceSupplyRequest = this.repository.create({
      ServiceSupplyRequestID: serviceSupplyRequestId,
      BasisType: Number(dto.BasisType || dto.BaseSource || 1),
      RequestNumber: reqNum,
      RequestDate: ensureIsoTimestamp(dto.RequestDate),
      RequestType: dto.RequestType ? Number(dto.RequestType) : 1,
      Priority: Number(dto.Priority || 1),
      Status: Number(dto.Status || 1),
      Requester: this.parseString(dto.Requester),
      RequesterRef: this.parseRef(dto.RequesterRef),
      WarehouseRef: this.parseRef(dto.WarehouseRef),
      Description: dto.Description || undefined,
      businessStructureRef: bsId,
      companyRef: compId,
      FiscalYearRef: fiscalYearId,
      creator: userId,
      lastModifier: userId,
      createTime: nowTime,
      lastModificationTime: nowTime,
    });

    const savedRequest = await this.repository.save(serviceSupplyRequest);

    if (Array.isArray(dto.details) && dto.details.length > 0) {
      const validDetails = dto.details.filter((d) => !!this.parseRef(d.ItemRef ?? (d as any).ItemID ?? (d as any).itemRef));
      if (validDetails.length > 0) {
        const startDetailId = await this.idGenService.generateNextIdBlock('ServiceSupplyRequestDetail', validDetails.length);
        const detailsToSave: ServiceSupplyRequestDetail[] = validDetails.map((d, idx) => {
          const itemRef = this.parseRef(d.ItemRef ?? (d as any).ItemID ?? (d as any).itemRef)!;
          return this.detailRepository.create({
            ServiceSupplyRequestDetailID: startDetailId + idx,
            ServiceSupplyRequestRef: serviceSupplyRequestId,
            RowNo: idx + 1,
            ItemRef: itemRef,
            RequestQuantity: Number(d.RequestQuantity || 1),
            ApprovedQuantity: Number(d.ApprovedQuantity || d.RequestQuantity || 1),
            DeliveryDate: ensureIsoTimestamp(d.DeliveryDate || dto.RequestDate),
            Description: d.Description || undefined,
          });
        });
        await this.detailRepository.save(detailsToSave);
      }
    }

    return this.findOne(serviceSupplyRequestId);
  }

  async findAll(query?: any): Promise<ServiceSupplyRequest[]> {
    const { bsId, compId, fiscalYearId } = this.getScope();

    const qb = this.repository
      .createQueryBuilder('req')
      .where('req.businessStructureRef = :bsId', { bsId })
      .andWhere('req.companyRef = :compId', { compId })
      .andWhere('req.FiscalYearRef = :fiscalYearId', { fiscalYearId })
      .orderBy('req.RequestNumber', 'DESC');

    return qb.getMany();
  }

  async findOne(id: number): Promise<ServiceSupplyRequest> {
    if (!id || isNaN(id)) {
      throw new NotFoundException(`شناسه ${id} نامعتبر است`);
    }
    const req = await this.repository.findOne({
      where: { ServiceSupplyRequestID: id },
      relations: ['details', 'details.item', 'details.item.MeasurementUnit'],
    });

    if (!req) {
      throw new NotFoundException(`درخواست تامین خدمت با شناسه ${id} یافت نشد`);
    }

    return req;
  }

  async update(id: number, dto: UpdateServiceSupplyRequestDto): Promise<ServiceSupplyRequest> {
    const req = await this.findOne(id);
    const userId = this.requestContextService.getUserId() || 1;

    req.BasisType = Number(dto.BasisType || dto.BaseSource || req.BasisType || 1);
    req.RequestNumber = dto.RequestNumber || req.RequestNumber;
    req.RequestDate = dto.RequestDate ? ensureIsoTimestamp(dto.RequestDate) : req.RequestDate;
    req.RequestType = dto.RequestType ? Number(dto.RequestType) : req.RequestType;
    req.Priority = Number(dto.Priority || req.Priority);
    req.Status = Number(dto.Status || req.Status);
    req.Requester = dto.Requester !== undefined ? this.parseString(dto.Requester) : req.Requester;
    req.RequesterRef = dto.RequesterRef !== undefined ? this.parseRef(dto.RequesterRef) : req.RequesterRef;
    req.WarehouseRef = dto.WarehouseRef !== undefined ? this.parseRef(dto.WarehouseRef) : req.WarehouseRef;
    req.Description = dto.Description !== undefined ? dto.Description : req.Description;
    req.lastModifier = userId;

    await this.repository.save(req);

    // Replace details
    await this.detailRepository.delete({ ServiceSupplyRequestRef: id });

    if (Array.isArray(dto.details) && dto.details.length > 0) {
      const validDetails = dto.details.filter((d) => !!this.parseRef(d.ItemRef ?? (d as any).ItemID ?? (d as any).itemRef));
      if (validDetails.length > 0) {
        const startDetailId = await this.idGenService.generateNextIdBlock('ServiceSupplyRequestDetail', validDetails.length);
        const detailsToSave: ServiceSupplyRequestDetail[] = validDetails.map((d, idx) => {
          const itemRef = this.parseRef(d.ItemRef ?? (d as any).ItemID ?? (d as any).itemRef)!;
          return this.detailRepository.create({
            ServiceSupplyRequestDetailID: startDetailId + idx,
            ServiceSupplyRequestRef: id,
            RowNo: idx + 1,
            ItemRef: itemRef,
            RequestQuantity: Number(d.RequestQuantity || 1),
            ApprovedQuantity: Number(d.ApprovedQuantity || d.RequestQuantity || 1),
            DeliveryDate: ensureIsoTimestamp(d.DeliveryDate || req.RequestDate),
            Description: d.Description || undefined,
          });
        });
        await this.detailRepository.save(detailsToSave);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    const req = await this.findOne(id);
    await this.detailRepository.delete({ ServiceSupplyRequestRef: id });
    await this.repository.remove(req);
    return { success: true };
  }
}
