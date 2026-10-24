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
exports.WarehouseDocumentTypeRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const warehouse_document_type_entity_1 = require("../../domain/entities/warehouse-document-type.entity");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let WarehouseDocumentTypeRepository = class WarehouseDocumentTypeRepository {
    constructor(repository, requestContextService) {
        this.repository = repository;
        this.requestContextService = requestContextService;
    }
    get manager() {
        return this.repository.manager;
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
    async checkDuplicate(field, value, excludeId) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { [field]: value };
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        if (excludeId) {
            where.WarehouseDocumentTypeID = (0, typeorm_2.Not)(parseInt(excludeId, 10));
        }
        const count = await this.repository.count({ where });
        return count > 0;
    }
    async findAll(criteria) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = criteria?.where ? { ...criteria.where } : {};
        if (isShared)
            where.businessStructureRef = bsId;
        else
            where.companyRef = compId;
        return this.repository.find({ ...criteria, where, order: { WarehouseDocumentTypeCode: 'ASC' } });
    }
    async findById(id) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { WarehouseDocumentTypeID: id };
        if (isShared)
            where.businessStructureRef = bsId;
        else
            where.companyRef = compId;
        return this.repository.findOne({ where });
    }
    async create(entity) {
        const { bsId, compId } = await this.getScope();
        if (!entity.businessStructureRef || entity.businessStructureRef <= 1)
            entity.businessStructureRef = bsId;
        if (!entity.companyRef || entity.companyRef <= 1)
            entity.companyRef = compId;
        const newEntity = this.repository.create(entity);
        return this.repository.save(newEntity);
    }
    async update(id, entity) {
        const existing = await this.repository.findOne({ where: { WarehouseDocumentTypeID: id } });
        if (!existing) {
            throw new Error('نوع سند انبار یافت نشد');
        }
        const merged = this.repository.merge(existing, entity);
        return this.repository.save(merged);
    }
    async delete(id) {
        await this.repository.delete(id);
    }
    async calculateNextCode(bsId, companyId) {
        const { isShared } = await this.getScope();
        const where = {};
        if (isShared)
            where.businessStructureRef = bsId;
        else
            where.companyRef = companyId;
        const hasWhere = Object.keys(where).length > 0;
        const lastList = await this.repository.find({
            ...(hasWhere ? { where } : {}),
            order: { WarehouseDocumentTypeCode: 'DESC' },
            take: 1,
        });
        const last = lastList.length > 0 ? lastList[0] : null;
        const nextVal = last && last.WarehouseDocumentTypeCode ? last.WarehouseDocumentTypeCode + 1 : 1;
        return {
            nextValue: String(nextVal),
            numberingMethod: '2',
        };
    }
};
exports.WarehouseDocumentTypeRepository = WarehouseDocumentTypeRepository;
exports.WarehouseDocumentTypeRepository = WarehouseDocumentTypeRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(warehouse_document_type_entity_1.WarehouseDocumentType)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        request_context_service_1.RequestContextService])
], WarehouseDocumentTypeRepository);
//# sourceMappingURL=warehouse-document-type.repository.js.map