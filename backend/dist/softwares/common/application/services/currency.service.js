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
exports.CurrencyService = void 0;
const common_1 = require("@nestjs/common");
const currency_entity_1 = require("../../domain/entities/currency.entity");
let CurrencyService = class CurrencyService {
    constructor(repository) {
        this.repository = repository;
    }
    async create(dto, businessStructureRef = 2, branchRef, agencyRef) {
        if (dto.code) {
            const existingCode = await this.repository.findByCode(dto.code, businessStructureRef);
            if (existingCode)
                throw new common_1.ConflictException('تکراری: کُد وارد شده قبلاً ثبت شده است.');
        }
        const existingTitle = await this.repository.findByTitle(dto.title, businessStructureRef);
        if (existingTitle)
            throw new common_1.ConflictException('تکراری: این عنوان قبلاً ثبت شده است.');
        const existingTitleEn = await this.repository.findByTitleEn(dto.titleEn, businessStructureRef);
        if (existingTitleEn)
            throw new common_1.ConflictException('تکراری: این عنوان لاتین قبلاً ثبت شده است.');
        let finalCode = dto.code;
        if (!finalCode) {
            const maxCode = await this.repository.getMaxCode(businessStructureRef);
            finalCode = maxCode + 1;
        }
        const currency = new currency_entity_1.Currency();
        currency.code = finalCode;
        currency.title = dto.title;
        currency.titleEn = dto.titleEn;
        currency.exchangeUnit = dto.exchangeUnit;
        currency.precisionCount = dto.precisionCount;
        currency.precisionTitle = dto.precisionTitle;
        currency.precisionTitleEn = dto.precisionTitleEn;
        currency.isActive = dto.isActive !== undefined ? dto.isActive : true;
        currency.businessStructureRef = businessStructureRef;
        currency.companyRef = businessStructureRef;
        if (branchRef)
            currency.branchRef = branchRef;
        if (agencyRef)
            currency.agencyRef = agencyRef;
        return this.repository.create(currency);
    }
    async findAll() {
        return this.repository.findAll();
    }
    async findOne(id) {
        const currency = await this.repository.findById(id);
        if (!currency)
            throw new common_1.NotFoundException('ارز مورد نظر یافت نشد.');
        return currency;
    }
    async update(id, dto, businessStructureRef = 2, branchRef, agencyRef) {
        const currency = await this.findOne(id);
        if (dto.code && dto.code !== currency.code) {
            const existing = await this.repository.findByCode(dto.code, businessStructureRef);
            if (existing && existing.currencyID !== id)
                throw new common_1.ConflictException('تکراری: کُد وارد شده قبلاً ثبت شده است.');
        }
        if (dto.title && dto.title !== currency.title) {
            const existing = await this.repository.findByTitle(dto.title, businessStructureRef);
            if (existing && existing.currencyID !== id)
                throw new common_1.ConflictException('تکراری: این عنوان قبلاً ثبت شده است.');
        }
        if (dto.titleEn && dto.titleEn !== currency.titleEn) {
            const existing = await this.repository.findByTitleEn(dto.titleEn, businessStructureRef);
            if (existing && existing.currencyID !== id)
                throw new common_1.ConflictException('تکراری: این عنوان لاتین قبلاً ثبت شده است.');
        }
        const updateData = { ...dto, businessStructureRef, companyRef: businessStructureRef };
        if (branchRef !== undefined)
            updateData.branchRef = branchRef;
        if (agencyRef !== undefined)
            updateData.agencyRef = agencyRef;
        return this.repository.update(id, updateData);
    }
    async remove(id) {
        await this.findOne(id);
        await this.repository.delete(id);
    }
    async getNextCode(businessStructureRef = 2) {
        const maxCode = await this.repository.getMaxCode(businessStructureRef);
        return maxCode + 1;
    }
    async seedForBusinessStructure(businessStructureId) {
        const defaultCurrencies = [
            { code: 1, title: 'ریال ایران', titleEn: 'Iranian Rial', exchangeUnit: 1, precisionCount: 0, precisionTitle: 'دینار', precisionTitleEn: 'Dinar' },
            { code: 2, title: 'دلار آمریکا', titleEn: 'US Dollar', exchangeUnit: 1, precisionCount: 2, precisionTitle: 'سنت', precisionTitleEn: 'Cent' },
        ];
        let resolvedBSRef = businessStructureId;
        let isShared = true;
        try {
            const structures = await this.repository.typeOrmRepo.manager.query(`SELECT "BusinessStructureID", "ParentRef", "BusinessStructure", "IsBasicInfoShared" FROM "Gnr"."BusinessStructure" WHERE "BusinessStructureID" IN ($1, 1)`, [businessStructureId]);
            if (structures && structures.length > 0) {
                const bs = structures.find((r) => (r.BusinessStructureID || r.businessStructureId || r.business_structure_id) === businessStructureId) || structures[0];
                const bsType = parseInt(bs.BusinessStructure || bs.businessStructure || '0', 10);
                const parentRef = parseInt(bs.ParentRef || bs.parentRef || '0', 10);
                if (bsType === 2 && parentRef > 0) {
                    resolvedBSRef = parentRef;
                }
                if (structures.some((r) => {
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
        catch (e) {
            isShared = false;
        }
        const checkBSRef = isShared ? resolvedBSRef : businessStructureId;
        for (const cur of defaultCurrencies) {
            try {
                await this.create(cur, businessStructureId);
            }
            catch (e) {
            }
        }
    }
};
exports.CurrencyService = CurrencyService;
exports.CurrencyService = CurrencyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('ICurrencyRepository')),
    __metadata("design:paramtypes", [Object])
], CurrencyService);
//# sourceMappingURL=currency.service.js.map