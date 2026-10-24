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
exports.VoucherTypeService = void 0;
const common_1 = require("@nestjs/common");
const voucher_type_repository_interface_1 = require("../../domain/repositories/voucher-type.repository.interface");
let VoucherTypeService = class VoucherTypeService {
    constructor(voucherTypeRepository) {
        this.voucherTypeRepository = voucherTypeRepository;
    }
    async create(createDto, companyId = 2, branchId, agencyId) {
        const manager = this.voucherTypeRepository.typeOrmRepo.manager;
        const structures = await manager.query(`SELECT "BusinessStructureID", "ParentRef", "BusinessStructure" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" = $1`, [companyId]);
        let businessStructureRef = companyId;
        if (structures && structures.length > 0) {
            const bs = structures[0];
            const bsType = parseInt(bs.BusinessStructure || bs.businessStructure || '0', 10);
            const parentRef = parseInt(bs.ParentRef || bs.parentRef || '0', 10);
            if (bsType === 2 && parentRef > 0 && parentRef !== 1) {
                businessStructureRef = parentRef;
            }
        }
        const data = { ...createDto, businessStructureRef, companyRef: companyId };
        if (branchId !== undefined)
            data.branchRef = branchId;
        if (agencyId !== undefined)
            data.agencyRef = agencyId;
        return this.voucherTypeRepository.create(data);
    }
    async update(id, updateDto, companyId = 2, branchId, agencyId) {
        await this.findOne(id);
        return this.voucherTypeRepository.update(id, updateDto);
    }
    async findAll() {
        return this.voucherTypeRepository.findAll();
    }
    async findWithPagination(params) {
        const [items, total] = await this.voucherTypeRepository.findAdvanced(params);
        return { items, total };
    }
    async findOne(id) {
        const type = await this.voucherTypeRepository.findById(id);
        if (!type) {
            throw new common_1.NotFoundException(`VoucherType with ID ${id} not found`);
        }
        return type;
    }
    async remove(id) {
        await this.findOne(id);
        await this.voucherTypeRepository.delete(id);
    }
    async seedData() {
        await this.seedForBusinessStructure(1);
    }
    async seedForBusinessStructure(businessStructureId) {
        const seedItems = [
            { code: 1, title: 'سند عادی' },
            { code: 2, title: 'سند افتتاحیه' },
            { code: 3, title: 'سند اختتامیه' },
            { code: 4, title: 'سند بستن حساب‌ها' },
            { code: 5, title: 'سند سود و زیان' },
            { code: 6, title: 'سند انتقال' },
            { code: 7, title: 'اصلاح حساب' },
            { code: 8, title: 'حقوق و دستمزد' },
            { code: 9, title: 'هزینه‌های عمومی' },
        ];
        const manager = this.voucherTypeRepository.typeOrmRepo.manager;
        const structures = await manager.query(`SELECT "BusinessStructureID", "ParentRef", "BusinessStructure", "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [businessStructureId]);
        let businessStructureRef = businessStructureId;
        let isShared = true;
        if (structures && structures.length > 0) {
            const bs = structures.find((r) => (r.BusinessStructureID || r.businessStructureId || r.business_structure_id) === businessStructureId) || structures[0];
            const bsType = parseInt(bs.BusinessStructure || bs.businessStructure || '0', 10);
            const parentRef = parseInt(bs.ParentRef || bs.parentRef || '0', 10);
            let targetForSharingCheck = bs;
            if (bsType === 2 && parentRef > 0 && parentRef !== 1) {
                businessStructureRef = parentRef;
                const parents = await manager.query(`SELECT "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [parentRef]);
                if (parents && parents.length > 0) {
                    targetForSharingCheck = parents.find((r) => (r.BusinessStructureID || r.businessStructureId || r.business_structure_id) === parentRef) || parents[0];
                }
            }
            const val = targetForSharingCheck.IsBasicInfoShared !== undefined ? targetForSharingCheck.IsBasicInfoShared : targetForSharingCheck.isBasicInfoShared;
            isShared = !(val === false || val === 0 || val === 'false' || val === null);
        }
        const checkField = isShared ? 'BusinessStructureRef' : 'CompanyRef';
        const checkValue = isShared ? businessStructureRef : businessStructureId;
        for (const item of seedItems) {
            try {
                const existing = await manager.query(`SELECT COUNT(*) as count FROM "Acc"."VoucherType" WHERE "Title" = $1 AND "${checkField}" = $2`, [item.title, checkValue]);
                if (parseInt(existing[0].count, 10) === 0) {
                    await this.create({
                        code: item.code,
                        title: item.title,
                        isActive: true
                    }, businessStructureId);
                    console.log(`Seeded VoucherType: ${item.title} for BS: ${businessStructureId}`);
                }
            }
            catch (e) {
                console.error(`Error seeding VoucherType ${item.title}:`, e.message);
            }
        }
    }
    async checkDuplicate(field, value, excludeId) {
        return this.voucherTypeRepository.checkDuplicate(field, value, excludeId);
    }
};
exports.VoucherTypeService = VoucherTypeService;
exports.VoucherTypeService = VoucherTypeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(voucher_type_repository_interface_1.IVoucherTypeRepositoryToken)),
    __metadata("design:paramtypes", [Object])
], VoucherTypeService);
//# sourceMappingURL=voucher-type.service.js.map