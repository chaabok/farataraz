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
exports.DetailedTypeService = void 0;
const common_1 = require("@nestjs/common");
const detailed_type_repository_interface_1 = require("../../domain/repositories/detailed-type.repository.interface");
const detailed_account_repository_interface_1 = require("../../domain/repositories/detailed-account.repository.interface");
const detailed_accounts_numbering_repository_interface_1 = require("../../../common/domain/repositories/detailed-accounts-numbering.repository.interface");
let DetailedTypeService = class DetailedTypeService {
    constructor(detailedTypeRepository, detailedAccountRepository, detailedAccountsNumberingRepository) {
        this.detailedTypeRepository = detailedTypeRepository;
        this.detailedAccountRepository = detailedAccountRepository;
        this.detailedAccountsNumberingRepository = detailedAccountsNumberingRepository;
    }
    async create(createDto, companyId = 2, branchId, agencyId) {
        const manager = this.detailedTypeRepository.typeOrmRepo.manager;
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
        return this.detailedTypeRepository.create(data);
    }
    async update(id, updateDto, companyId = 2, branchId, agencyId) {
        await this.findOne(id);
        return this.detailedTypeRepository.update(id, updateDto);
    }
    async findAll() {
        return this.detailedTypeRepository.findAll();
    }
    async findWithPagination(params) {
        const [items, total] = await this.detailedTypeRepository.findAdvanced(params);
        return { items, total };
    }
    async findOne(id) {
        const type = await this.detailedTypeRepository.findById(id);
        if (!type) {
            throw new common_1.NotFoundException(`DetailedType with ID ${id} not found`);
        }
        return type;
    }
    async remove(id) {
        if (id >= 1 && id <= 21) {
            throw new Error('This system-defined detailed type cannot be deleted.');
        }
        await this.findOne(id);
        const accountsCount = await this.detailedAccountRepository.countByDetailedTypeId(id);
        if (accountsCount > 0) {
            throw new common_1.BadRequestException('حذف نوع تفصیلی بدلیل وجود حساب تفصیلی امکان پذیر نمی باشد.');
        }
        await this.detailedAccountsNumberingRepository.deleteByDetailedTypeId(id);
        await this.detailedTypeRepository.delete(id);
    }
    async seedData() {
        await this.seedForBusinessStructure(1);
    }
    async seedForBusinessStructure(businessStructureId) {
        const seedItems = [
            { code: '1', title: 'حساب بانکی' },
            { code: '2', title: 'صندوق' },
            { code: '3', title: 'کارتخوان' },
            { code: '4', title: 'درگاه های اینترنتی' },
            { code: '5', title: 'تنخواه گردان' },
            { code: '6', title: 'اشخاص حقیقی' },
            { code: '7', title: 'اشخاص حقوقی' },
            { code: '8', title: 'پروژه' },
            { code: '9', title: 'قرارداد' },
            { code: '10', title: 'انبار' },
            { code: '11', title: 'کالاها و خدمات' },
            { code: '12', title: 'اعتبارات اسنادی' },
            { code: '13', title: 'گروه مشتریان' },
            { code: '14', title: 'گروه تامین کنندگان' },
            { code: '15', title: 'مراکز هزینه' },
            { code: '16', title: 'تسهیلات مالی' },
            { code: '17', title: 'دارایی های ثابت' },
            { code: '18', title: 'سایر' },
            { code: '19', title: 'گروه بندی کالا انبار' },
            { code: '20', title: 'گروه بندی کالا فروش' },
            { code: '21', title: 'کانال فروش' },
        ];
        const manager = this.detailedTypeRepository.typeOrmRepo.manager;
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
                const existing = await manager.query(`SELECT COUNT(*) as count FROM "Acc"."DetailedTypes" WHERE "Title" = $1 AND "${checkField}" = $2`, [item.title, checkValue]);
                if (parseInt(existing[0].count, 10) === 0) {
                    await this.create({
                        code: item.code,
                        title: item.title,
                        isActive: true
                    }, businessStructureId);
                    console.log(`Seeded DetailedType: ${item.title} for BS: ${businessStructureId}`);
                }
            }
            catch (e) {
                console.error(`Error seeding DetailedType ${item.title}:`, e.message);
            }
        }
    }
    async checkDuplicate(field, value, excludeId) {
        return this.detailedTypeRepository.checkDuplicate(field, value, excludeId);
    }
};
exports.DetailedTypeService = DetailedTypeService;
exports.DetailedTypeService = DetailedTypeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(detailed_type_repository_interface_1.IDetailedTypeRepositoryToken)),
    __param(1, (0, common_1.Inject)(detailed_account_repository_interface_1.IDetailedAccountRepositoryToken)),
    __param(2, (0, common_1.Inject)(detailed_accounts_numbering_repository_interface_1.IDetailedAccountsNumberingRepositoryToken)),
    __metadata("design:paramtypes", [Object, Object, Object])
], DetailedTypeService);
//# sourceMappingURL=detailed-type.service.js.map