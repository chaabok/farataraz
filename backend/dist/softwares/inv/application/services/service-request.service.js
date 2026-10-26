"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRequestService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const service_request_entity_1 = require("../../domain/entities/service-request.entity");
const service_request_detail_entity_1 = require("../../domain/entities/service-request-detail.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let ServiceRequestService = class ServiceRequestService {
    constructor(repository, detailRepository, idGenService, requestContextService) {
        this.repository = repository;
        this.detailRepository = detailRepository;
        this.idGenService = idGenService;
        this.requestContextService = requestContextService;
    }
    getScope() {
        let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        let compId = this.requestContextService.getCompanyId() ?? 2;
        let fiscalYearId = this.requestContextService.getFiscalYearId() ?? 1;
        if (bsId <= 1)
            bsId = 2;
        if (compId <= 1)
            compId = 2;
        return { bsId, compId, fiscalYearId };
    }
    async getNextNumber() {
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
    async create(dto) {
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
                const detailsToSave = validDetails.map((d, idx) => {
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
    async findAll(query) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const qb = this.repository
            .createQueryBuilder('req')
            .where('req.businessStructureRef = :bsId', { bsId })
            .andWhere('req.companyRef = :compId', { compId })
            .andWhere('req.FiscalYearRef = :fiscalYearId', { fiscalYearId })
            .orderBy('req.RequestNumber', 'DESC');
        return qb.getMany();
    }
    async findOne(id) {
        const req = await this.repository.findOne({
            where: { ServiceRequestID: id },
            relations: ['details', 'details.item'],
        });
        if (!req) {
            throw new common_1.NotFoundException(`درخواست خدمت با شناسه ${id} یافت نشد`);
        }
        return req;
    }
    async update(id, dto) {
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
        await this.detailRepository.delete({ ServiceRequestRef: id });
        if (Array.isArray(dto.details) && dto.details.length > 0) {
            const validDetails = dto.details.filter((d) => d.ItemRef && !isNaN(Number(d.ItemRef)));
            if (validDetails.length > 0) {
                const startDetailId = await this.idGenService.generateNextIdBlock('ServiceRequestDetail', validDetails.length);
                const detailsToSave = validDetails.map((d, idx) => {
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
    async remove(id) {
        const req = await this.findOne(id);
        await this.detailRepository.delete({ ServiceRequestRef: id });
        await this.repository.remove(req);
        return { success: true };
    }
};
exports.ServiceRequestService = ServiceRequestService;
exports.ServiceRequestService = ServiceRequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(service_request_entity_1.ServiceRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(service_request_detail_entity_1.ServiceRequestDetail)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], ServiceRequestService);
//# sourceMappingURL=service-request.service.js.map