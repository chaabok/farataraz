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
exports.ServiceSupplyRequestService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const service_supply_request_entity_1 = require("../../domain/entities/service-supply-request.entity");
const service_supply_request_detail_entity_1 = require("../../domain/entities/service-supply-request-detail.entity");
const detailed_account_entity_1 = require("../../../accounting/domain/entities/detailed-account.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const date_parser_1 = require("../../../../core/utils/date-parser");
let ServiceSupplyRequestService = class ServiceSupplyRequestService {
    constructor(repository, detailRepository, idGenService, requestContextService) {
        this.repository = repository;
        this.detailRepository = detailRepository;
        this.idGenService = idGenService;
        this.requestContextService = requestContextService;
    }
    async onModuleInit() {
        try {
            const requests = await this.repository.find();
            for (const req of requests) {
                const norm = (0, date_parser_1.ensureIsoTimestamp)(req.RequestDate);
                if (norm !== req.RequestDate) {
                    req.RequestDate = norm;
                    await this.repository.save(req);
                }
            }
            const details = await this.detailRepository.find();
            for (const d of details) {
                if (d.DeliveryDate) {
                    const norm = (0, date_parser_1.ensureIsoTimestamp)(d.DeliveryDate);
                    if (norm !== d.DeliveryDate) {
                        d.DeliveryDate = norm;
                        await this.detailRepository.save(d);
                    }
                }
            }
        }
        catch (e) {
            console.error("ServiceSupplyRequestService onModuleInit migration error:", e);
        }
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
    async getRequesters() {
        try {
            const accounts = await this.repository.manager.find(detailed_account_entity_1.DetailedAccount, {
                relations: ['detailedType'],
                where: { isActive: true },
                order: { code: 'ASC' },
            });
            const filtered = accounts.filter((da) => {
                const dt = da.detailedType;
                const dtCode = String(dt?.code || '');
                const dtTitle = String(dt?.title || '');
                return (dtCode === '8' ||
                    dtCode === '15' ||
                    dtTitle.includes('مرکز هزینه') ||
                    dtTitle.includes('مراکز هزینه') ||
                    dtTitle.includes('پروژه'));
            });
            return filtered.map((da) => ({
                id: da.detailedAccountId,
                code: da.code || '',
                title: da.title || '',
                title2: da.detailedType?.title || '',
                title_en: da.title_en || '',
                detailedAccountId: da.detailedAccountId,
            }));
        }
        catch (err) {
            console.error('Error fetching requesters in ServiceSupplyRequestService:', err);
            return [];
        }
    }
    parseRef(val) {
        if (val === null || val === undefined || val === '' || val === 0 || val === '0')
            return undefined;
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
    parseString(val) {
        if (!val)
            return '';
        if (typeof val === 'object') {
            return String(val.title || val.name || val.label || '');
        }
        return String(val);
    }
    async create(dto) {
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
            RequestDate: (0, date_parser_1.ensureIsoTimestamp)(dto.RequestDate),
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
            const validDetails = dto.details.filter((d) => !!this.parseRef(d.ItemRef ?? d.ItemID ?? d.itemRef));
            if (validDetails.length > 0) {
                const startDetailId = await this.idGenService.generateNextIdBlock('ServiceSupplyRequestDetail', validDetails.length);
                const detailsToSave = validDetails.map((d, idx) => {
                    const itemRef = this.parseRef(d.ItemRef ?? d.ItemID ?? d.itemRef);
                    return this.detailRepository.create({
                        ServiceSupplyRequestDetailID: startDetailId + idx,
                        ServiceSupplyRequestRef: serviceSupplyRequestId,
                        RowNo: idx + 1,
                        ItemRef: itemRef,
                        RequestQuantity: Number(d.RequestQuantity || 1),
                        ApprovedQuantity: Number(d.ApprovedQuantity || d.RequestQuantity || 1),
                        DeliveryDate: (0, date_parser_1.ensureIsoTimestamp)(d.DeliveryDate || dto.RequestDate),
                        Description: d.Description || undefined,
                    });
                });
                await this.detailRepository.save(detailsToSave);
            }
        }
        return this.findOne(serviceSupplyRequestId);
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
        if (!id || isNaN(id)) {
            throw new common_1.NotFoundException(`شناسه ${id} نامعتبر است`);
        }
        const req = await this.repository.findOne({
            where: { ServiceSupplyRequestID: id },
            relations: ['details', 'details.item', 'details.item.MeasurementUnit'],
        });
        if (!req) {
            throw new common_1.NotFoundException(`درخواست تامین خدمت با شناسه ${id} یافت نشد`);
        }
        return req;
    }
    async update(id, dto) {
        const req = await this.findOne(id);
        const userId = this.requestContextService.getUserId() || 1;
        req.BasisType = Number(dto.BasisType || dto.BaseSource || req.BasisType || 1);
        req.RequestNumber = dto.RequestNumber || req.RequestNumber;
        req.RequestDate = dto.RequestDate ? (0, date_parser_1.ensureIsoTimestamp)(dto.RequestDate) : req.RequestDate;
        req.RequestType = dto.RequestType ? Number(dto.RequestType) : req.RequestType;
        req.Priority = Number(dto.Priority || req.Priority);
        req.Status = Number(dto.Status || req.Status);
        req.Requester = dto.Requester !== undefined ? this.parseString(dto.Requester) : req.Requester;
        req.RequesterRef = dto.RequesterRef !== undefined ? this.parseRef(dto.RequesterRef) : req.RequesterRef;
        req.WarehouseRef = dto.WarehouseRef !== undefined ? this.parseRef(dto.WarehouseRef) : req.WarehouseRef;
        req.Description = dto.Description !== undefined ? dto.Description : req.Description;
        req.lastModifier = userId;
        await this.repository.save(req);
        await this.detailRepository.delete({ ServiceSupplyRequestRef: id });
        if (Array.isArray(dto.details) && dto.details.length > 0) {
            const validDetails = dto.details.filter((d) => !!this.parseRef(d.ItemRef ?? d.ItemID ?? d.itemRef));
            if (validDetails.length > 0) {
                const startDetailId = await this.idGenService.generateNextIdBlock('ServiceSupplyRequestDetail', validDetails.length);
                const detailsToSave = validDetails.map((d, idx) => {
                    const itemRef = this.parseRef(d.ItemRef ?? d.ItemID ?? d.itemRef);
                    return this.detailRepository.create({
                        ServiceSupplyRequestDetailID: startDetailId + idx,
                        ServiceSupplyRequestRef: id,
                        RowNo: idx + 1,
                        ItemRef: itemRef,
                        RequestQuantity: Number(d.RequestQuantity || 1),
                        ApprovedQuantity: Number(d.ApprovedQuantity || d.RequestQuantity || 1),
                        DeliveryDate: (0, date_parser_1.ensureIsoTimestamp)(d.DeliveryDate || req.RequestDate),
                        Description: d.Description || undefined,
                    });
                });
                await this.detailRepository.save(detailsToSave);
            }
        }
        return this.findOne(id);
    }
    async remove(id) {
        const req = await this.findOne(id);
        await this.detailRepository.delete({ ServiceSupplyRequestRef: id });
        await this.repository.remove(req);
        return { success: true };
    }
};
exports.ServiceSupplyRequestService = ServiceSupplyRequestService;
exports.ServiceSupplyRequestService = ServiceSupplyRequestService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(service_supply_request_entity_1.ServiceSupplyRequest)),
    __param(1, (0, typeorm_1.InjectRepository)(service_supply_request_detail_entity_1.ServiceSupplyRequestDetail)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], ServiceSupplyRequestService);
//# sourceMappingURL=service-supply-request.service.js.map