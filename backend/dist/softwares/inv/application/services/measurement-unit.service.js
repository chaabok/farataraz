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
exports.MeasurementUnitService = void 0;
const common_1 = require("@nestjs/common");
const measurement_unit_repository_interface_1 = require("../../domain/repositories/measurement-unit.repository.interface");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let MeasurementUnitService = class MeasurementUnitService {
    constructor(repository, idGenerationService, requestContextService) {
        this.repository = repository;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
    }
    async getScope() {
        let bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        let compId = this.requestContextService.getCompanyId() ?? 2;
        if (bsId <= 1)
            bsId = 2;
        if (compId <= 1)
            compId = 2;
        let isShared = true;
        try {
            const rows = await this.repository.manager.connection.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [bsId]);
            if (rows && rows.length > 0) {
                if (rows.some((r) => {
                    const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
                    return val === false || val === 0 || val === 'false' || val === null;
                })) {
                    isShared = false;
                }
            }
            else {
                isShared = false;
            }
        }
        catch (err) {
            isShared = false;
        }
        return { bsId, compId, isShared };
    }
    async findAll(query) {
        const { skip, take, search, sortModel, filterModel } = query;
        const { bsId, compId, isShared } = await this.getScope();
        let where = {};
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        const [data, total] = await Promise.all([
            this.repository.findAll({ where, skip: skip ? parseInt(skip) : undefined, take: take ? parseInt(take) : undefined }),
            this.repository.count({ where })
        ]);
        return { data, total, success: true };
    }
    async findOne(id) {
        const entity = await this.repository.findById(id);
        if (!entity)
            throw new common_1.NotFoundException('MeasurementUnit not found');
        return entity;
    }
    async getNextNumber() {
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const res = await this.repository.calculateNextCode(bsId, companyId);
        return {
            documentNumber: res.nextValue,
            isDocumentNumberAuto: res.numberingMethod === '2',
            error: res.error,
        };
    }
    async checkDuplicate(field, value, excludeId) {
        return this.repository.checkDuplicate(field, value, excludeId);
    }
    async validateDuplicates(dto, excludeId) {
        if (dto.MeasurementUnitCode !== undefined) {
            const isDuplicateCode = await this.checkDuplicate('MeasurementUnitCode', dto.MeasurementUnitCode, excludeId);
            if (isDuplicateCode) {
                throw new common_1.BadRequestException('کد واحد سنجش تکراری است');
            }
        }
        if (dto.MeasurementUnitName !== undefined) {
            const isDuplicateTitle = await this.checkDuplicate('MeasurementUnitName', dto.MeasurementUnitName, excludeId);
            if (isDuplicateTitle) {
                throw new common_1.BadRequestException('عنوان واحد سنجش تکراری است');
            }
        }
        if (dto.MeasurementUnitName2 !== undefined && dto.MeasurementUnitName2 !== null && dto.MeasurementUnitName2 !== '') {
            const isDuplicateTitle2 = await this.checkDuplicate('MeasurementUnitName2', dto.MeasurementUnitName2, excludeId);
            if (isDuplicateTitle2) {
                throw new common_1.BadRequestException('عنوان دوم واحد سنجش تکراری است');
            }
        }
    }
    async create(createDto) {
        const userId = this.requestContextService.getUserId();
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        let codeToSave = createDto.MeasurementUnitCode;
        const docRes = await this.repository.calculateNextCode(bsId, companyId);
        if (docRes.numberingMethod === '2' || !codeToSave) {
            if (docRes.error) {
                throw new common_1.BadRequestException(docRes.error);
            }
            codeToSave = parseInt(docRes.nextValue, 10);
        }
        else {
        }
        createDto.MeasurementUnitCode = codeToSave;
        await this.validateDuplicates(createDto);
        const id = await this.idGenerationService.generateNextId('MeasurementUnits');
        const entity = {
            ...createDto,
            MeasurementUnitCode: codeToSave,
            MeasurementUnitID: id,
            creator: userId || 1,
            companyRef: createDto.companyRef || companyId,
            businessStructureRef: createDto.businessStructureRef || bsId
        };
        return this.repository.create(entity);
    }
    async update(id, updateDto) {
        const existing = await this.findOne(id);
        if (updateDto.MeasurementUnitCode === undefined) {
            updateDto.MeasurementUnitCode = existing.MeasurementUnitCode;
        }
        await this.validateDuplicates(updateDto, id);
        const userId = this.requestContextService.getUserId();
        const entityToUpdate = {
            ...updateDto,
            lastModifier: userId || 1,
        };
        return this.repository.update(id, entityToUpdate);
    }
    async remove(id) {
        await this.findOne(id);
        await this.repository.delete(id);
    }
};
exports.MeasurementUnitService = MeasurementUnitService;
exports.MeasurementUnitService = MeasurementUnitService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(measurement_unit_repository_interface_1.IMeasurementUnitRepository)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], MeasurementUnitService);
//# sourceMappingURL=measurement-unit.service.js.map