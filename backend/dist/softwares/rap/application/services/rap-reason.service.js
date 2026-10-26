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
exports.RapReasonService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const rap_reason_repository_interface_1 = require("../../domain/repositories/rap-reason.repository.interface");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const rap_reason_entity_1 = require("../../domain/entities/rap-reason.entity");
const usage_check_service_1 = require("../../../../core/services/usage-check.service");
let RapReasonService = class RapReasonService {
    constructor(rapReasonRepository, dataSource, idGenerationService, usageCheckService) {
        this.rapReasonRepository = rapReasonRepository;
        this.dataSource = dataSource;
        this.idGenerationService = idGenerationService;
        this.usageCheckService = usageCheckService;
    }
    async isBasicInfoShared(businessStructureId) {
        const q = `SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`;
        const rows = await this.dataSource.query(q, [businessStructureId]);
        if (rows && rows.length > 0) {
            if (rows.some((r) => {
                const val = r.IsBasicInfoShared !== undefined ? r.IsBasicInfoShared : r.isBasicInfoShared;
                return val === false || val === 0 || val === 'false' || val === null;
            })) {
                return false;
            }
            return true;
        }
        return false;
    }
    async create(data, authContext) {
        const isShared = await this.isBasicInfoShared(authContext.businessStructureId);
        const existingList = await this.rapReasonRepository.findAll(authContext, isShared);
        if (data.Code) {
            const existingCode = existingList.find(r => r.Code === data.Code);
            if (existingCode) {
                throw new common_1.BadRequestException("کد وارد شده تکراری است");
            }
        }
        if (data.Title) {
            const existingTitle = existingList.find(r => r.Title === data.Title);
            if (existingTitle) {
                throw new common_1.BadRequestException("عنوان وارد شده تکراری است");
            }
        }
        const bsRef = authContext.businessStructureId <= 1 ? 2 : authContext.businessStructureId;
        const companyRef = authContext.companyId <= 1 ? 2 : authContext.companyId;
        const newId = await this.idGenerationService.generateNextId('RapReason');
        const obj = {
            ...data,
            RapReasonID: newId,
            businessStructureRef: bsRef,
            companyRef: companyRef,
        };
        return await this.rapReasonRepository.create(obj);
    }
    async ensureDefaultReasons(authContext) {
        const isShared = await this.isBasicInfoShared(authContext.businessStructureId);
        const all = await this.rapReasonRepository.findAll(authContext, isShared);
        const bsRef = authContext.businessStructureId <= 1 ? 2 : authContext.businessStructureId;
        const companyRef = authContext.companyId <= 1 ? 2 : authContext.companyId;
        if (all.length === 0) {
            const sourceId = await this.idGenerationService.generateNextId('RapReason');
            await this.rapReasonRepository.create({
                RapReasonID: sourceId,
                Title: 'منابع',
                Title_En: 'Sources',
                Nature: rap_reason_entity_1.RapReasonNature.SOURCE,
                IsActive: true,
                businessStructureRef: bsRef,
                companyRef: companyRef,
            });
            const useId = await this.idGenerationService.generateNextId('RapReason');
            await this.rapReasonRepository.create({
                RapReasonID: useId,
                Title: 'مصارف',
                Title_En: 'Uses',
                Nature: rap_reason_entity_1.RapReasonNature.USE,
                IsActive: true,
                businessStructureRef: bsRef,
                companyRef: companyRef,
            });
        }
    }
    async findAll(authContext) {
        await this.ensureDefaultReasons(authContext);
        const isShared = await this.isBasicInfoShared(authContext.businessStructureId);
        return await this.rapReasonRepository.findAll(authContext, isShared);
    }
    async findAllTree(authContext) {
        await this.ensureDefaultReasons(authContext);
        const isShared = await this.isBasicInfoShared(authContext.businessStructureId);
        const all = await this.rapReasonRepository.findAll(authContext, isShared);
        const map = new Map();
        all.forEach(item => map.set(item.RapReasonID, { ...item, children: [] }));
        const tree = [];
        all.forEach(item => {
            if (item.ParentRef) {
                const parent = map.get(item.ParentRef);
                if (parent) {
                    parent.children.push(map.get(item.RapReasonID));
                }
                else {
                    tree.push(map.get(item.RapReasonID));
                }
            }
            else {
                tree.push(map.get(item.RapReasonID));
            }
        });
        return tree;
    }
    async findOne(id, authContext) {
        const isShared = await this.isBasicInfoShared(authContext.businessStructureId);
        const entity = await this.rapReasonRepository.findById(id, authContext, isShared);
        if (!entity)
            throw new common_1.NotFoundException('RapReason not found');
        return entity;
    }
    async update(id, data, authContext) {
        await this.findOne(id, authContext);
        const usage = await this.usageCheckService.isRecordUsed('RapReason', id);
        if (usage.isUsed) {
            throw new common_1.ConflictException(`این بابت در فرم دیگری استفاده شده است و امکان ویرایش آن وجود ندارد.`);
        }
        const isShared = await this.isBasicInfoShared(authContext.businessStructureId);
        const existingList = await this.rapReasonRepository.findAll(authContext, isShared);
        if (data.Code) {
            const existingCode = existingList.find(r => r.Code === data.Code && Number(r.RapReasonID) !== Number(id));
            if (existingCode) {
                throw new common_1.BadRequestException("کد وارد شده تکراری است");
            }
        }
        if (data.Title) {
            const existingTitle = existingList.find(r => r.Title === data.Title && Number(r.RapReasonID) !== Number(id));
            if (existingTitle) {
                throw new common_1.BadRequestException("عنوان وارد شده تکراری است");
            }
        }
        return await this.rapReasonRepository.update(id, data);
    }
    async remove(id, authContext) {
        await this.findOne(id, authContext);
        const usage = await this.usageCheckService.isRecordUsed('RapReason', id);
        if (usage.isUsed) {
            throw new common_1.ConflictException(`این بابت در فرم دیگری استفاده شده است و امکان حذف آن وجود ندارد.`);
        }
        await this.rapReasonRepository.delete(id);
    }
};
exports.RapReasonService = RapReasonService;
exports.RapReasonService = RapReasonService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(rap_reason_repository_interface_1.IRapReasonRepositoryToken)),
    __metadata("design:paramtypes", [Object, typeorm_1.DataSource,
        id_generation_service_1.IdGenerationService,
        usage_check_service_1.UsageCheckService])
], RapReasonService);
//# sourceMappingURL=rap-reason.service.js.map