import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ServiceRequest } from '../../domain/entities/service-request.entity';
import { ServiceRequestDetail } from '../../domain/entities/service-request-detail.entity';
import { CreateServiceRequestDto, UpdateServiceRequestDto } from '../dtos/service-request.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';

@Injectable()
export class ServiceRequestService {
  constructor(
    @InjectRepository(ServiceRequest)
    private readonly repository: Repository<ServiceRequest>,
    @InjectRepository(ServiceRequestDetail)
    private readonly detailRepository: Repository<ServiceRequestDetail>,
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
      .createQueryBuilder('req')
      .select('MAX(req.RequestNumber)', 'max')
      .where('req.businessStructureRef = :bsId', { bsId })
      .andWhere('req.companyRef = :compId', { compId })
      .andWhere('req.FiscalYearRef = :fiscalYearId', { fiscalYearId })
      .getRawOne();

    const maxVal = maxResult?.max ? parseInt(maxResult.max, 10) : 0;
    return { documentNumber: maxVal + 1 };
  }

  async create(dto: CreateServiceRequestDto): Promise<ServiceRequest> {
    const { bsId, compId, fiscalYearId } = this.getScope();
    const userId = this.requestContextService.getUserId() || 1;

    let reqNum = dto.RequestNumber;
    if (!reqNum) {
      const next = await this.getNextNumber();
      reqNum = next.documentNumber;
    }

    const serviceRequestId = await this.idGenService.generateNextIdBlock('ServiceRequest', 1);

    const serviceRequest = this.repository.create({
      ServiceRequestID: serviceRequestId,
      BaseSource: Number(dto.BaseSource || 1),
      RequestNumber: reqNum,
      RequestDate: dto.RequestDate,
      Priority: Number(dto.Priority || 1),
      Status: Number(dto.Status || 1),
      Requester: dto.Requester,
      RequesterRef: dto.RequesterRef ? Number(dto.RequesterRef) : null,
      Description: dto.Description,
      businessStructureRef: bsId,
      companyRef: compId,
      FiscalYearRef: fiscalYearId,
      creator: userId,
    });

    await this.repository.save(serviceRequest);

    if (Array.isArray(dto.details) && dto.details.length > 0) {
      const validDetails = dto.details.filter((d) => d.ItemRef && !isNaN(Number(d.ItemRef)));
      if (validDetails.length > 0) {
        const startDetailId = await this.idGenService.generateNextIdBlock('ServiceRequestDetail', validDetails.length);
        const detailsToSave: ServiceRequestDetail[] = validDetails.map((d, idx) => {
          return this.detailRepository.create({
            ServiceRequestDetailID: startDetailId + idx,
            ServiceRequestRef: serviceRequestId,
            RowNo: idx + 1,
            ItemRef: Number(d.ItemRef),
            RequestQuantity: Number(d.RequestQuantity),
            ApprovedQuantity: Number(d.ApprovedQuantity || d.RequestQuantity),
            DeliveryDate: d.DeliveryDate,
            Description: d.Description,
          });
        });
        await this.detailRepository.save(detailsToSave);
      }
    }

    return this.findOne(serviceRequestId);
  }

  async findAll(query?: any): Promise<ServiceRequest[]> {
    const { bsId, compId, fiscalYearId } = this.getScope();

    const qb = this.repository
      .createQueryBuilder('req')
      .where('req.businessStructureRef = :bsId', { bsId })
      .andWhere('req.companyRef = :compId', { compId })
      .andWhere('req.FiscalYearRef = :fiscalYearId', { fiscalYearId })
      .orderBy('req.RequestNumber', 'DESC');

    return qb.getMany();
  }

  async findOne(id: number): Promise<ServiceRequest> {
    const req = await this.repository.findOne({
      where: { ServiceRequestID: id },
      relations: ['details', 'details.item'],
    });

    if (!req) {
      throw new NotFoundException(`درخواست خدمت با شناسه ${id} یافت نشد`);
    }

    return req;
  }

  async update(id: number, dto: UpdateServiceRequestDto): Promise<ServiceRequest> {
    const req = await this.findOne(id);
    const userId = this.requestContextService.getUserId() || 1;

    req.BaseSource = dto.BaseSource !== undefined ? Number(dto.BaseSource) : req.BaseSource;
    req.RequestNumber = dto.RequestNumber || req.RequestNumber;
    req.RequestDate = dto.RequestDate || req.RequestDate;
    req.Priority = Number(dto.Priority || req.Priority);
    req.Status = Number(dto.Status || req.Status);
    req.Requester = dto.Requester || req.Requester;
    req.RequesterRef = dto.RequesterRef !== undefined ? (dto.RequesterRef ? Number(dto.RequesterRef) : null) : req.RequesterRef;
    req.Description = dto.Description !== undefined ? dto.Description : req.Description;
    req.lastModifier = userId;

    await this.repository.save(req);

    // Replace details
    await this.detailRepository.delete({ ServiceRequestRef: id });

    if (Array.isArray(dto.details) && dto.details.length > 0) {
      const validDetails = dto.details.filter((d) => d.ItemRef && !isNaN(Number(d.ItemRef)));
      if (validDetails.length > 0) {
        const startDetailId = await this.idGenService.generateNextIdBlock('ServiceRequestDetail', validDetails.length);
        const detailsToSave: ServiceRequestDetail[] = validDetails.map((d, idx) => {
          return this.detailRepository.create({
            ServiceRequestDetailID: startDetailId + idx,
            ServiceRequestRef: id,
            RowNo: idx + 1,
            ItemRef: Number(d.ItemRef),
            RequestQuantity: Number(d.RequestQuantity),
            ApprovedQuantity: Number(d.ApprovedQuantity || d.RequestQuantity),
            DeliveryDate: d.DeliveryDate,
            Description: d.Description,
          });
        });
        await this.detailRepository.save(detailsToSave);
      }
    }

    return this.findOne(id);
  }

  async remove(id: number): Promise<{ success: boolean }> {
    const req = await this.findOne(id);
    await this.detailRepository.delete({ ServiceRequestRef: id });
    await this.repository.remove(req);
    return { success: true };
  }
}
