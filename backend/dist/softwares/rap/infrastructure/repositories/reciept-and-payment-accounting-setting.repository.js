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
exports.RecieptAndPaymentAccountingSettingRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const reciept_and_payment_accounting_setting_entity_1 = require("../../domain/entities/reciept-and-payment-accounting-setting.entity");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
const entity_numbering_entity_1 = require("../../../common/domain/entities/entity-numbering.entity");
let RecieptAndPaymentAccountingSettingRepository = class RecieptAndPaymentAccountingSettingRepository {
    constructor(repository, requestContextService) {
        this.repository = repository;
        this.requestContextService = requestContextService;
    }
    async getScope() {
        const bsId = this.requestContextService.getBusinessStructureId() ?? 2;
        const compId = this.requestContextService.getCompanyId() ?? 2;
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
        catch (e) {
            isShared = false;
        }
        return { bsId, compId, isShared };
    }
    async create(entity) {
        const newEntity = this.repository.create(entity);
        return await this.repository.save(newEntity);
    }
    async update(entity) {
        return await this.repository.save(entity);
    }
    async delete(id) {
        await this.repository.delete({ recieptAndPaymentAccountingSettingId: id });
    }
    async findById(id) {
        return await this.repository.findOne({
            where: { recieptAndPaymentAccountingSettingId: id },
            relations: ['account']
        });
    }
    async findAll(options) {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.createQueryBuilder('rapSetting')
            .leftJoinAndSelect('rapSetting.account', 'account');
        if (isShared) {
            qb.where('rapSetting.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('rapSetting.companyRef = :compId', { compId });
        }
        if (options?.usedEntryType) {
            qb.andWhere('rapSetting.usedEntryType = :usedEntryType', { usedEntryType: options.usedEntryType });
        }
        if (options?.operationType) {
            qb.andWhere('rapSetting.operationType = :operationType', { operationType: options.operationType });
        }
        if (options?.isActive === 'true' || options?.isActive === true) {
            qb.andWhere('rapSetting.isActive = :isActive', { isActive: true });
        }
        else if (options?.isActive === 'false' || options?.isActive === false) {
            qb.andWhere('rapSetting.isActive = :isActive', { isActive: false });
        }
        if (options?.hasAccount === 'true' || options?.hasAccount === true) {
            qb.andWhere('rapSetting.accountRef IS NOT NULL');
        }
        if (options) {
            (0, typeorm_query_builder_1.applyDataGridParams)(qb, options, 'rapSetting');
        }
        else {
            qb.orderBy('rapSetting.creationDate', 'DESC');
        }
        const [items, total] = await qb.getManyAndCount();
        return { items, total };
    }
    async findByCode(code) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { code };
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        return await this.repository.findOne({ where });
    }
    async calculateNextCode(businessStructureId, companyId) {
        const manager = this.repository.manager;
        let config = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
            where: {
                entityRef: 'rap_accounting_setting',
                companyRef: companyId,
            }
        });
        if (!config) {
            config = await manager.getRepository(entity_numbering_entity_1.EntityNumbering).findOne({
                where: {
                    entityRef: 'rap_accounting_setting',
                    businessStructureRef: businessStructureId,
                }
            });
        }
        let numberingMethod = '2';
        let items = null;
        if (config) {
            numberingMethod = config.numberingMethod || '2';
            items = config.items;
        }
        let startNumber = 1;
        let endNumber = 999999;
        let fixedChar = '';
        if (items) {
            let fYears = items.fiscalYears || [];
            if (Array.isArray(items)) {
                fYears = items;
            }
            if (fYears.length > 0) {
                startNumber = parseInt(fYears[0].startNumber || '1', 10);
                endNumber = parseInt(fYears[0].endNumber || '999999', 10);
                fixedChar = fYears[0].fixedChar || '';
            }
        }
        let query = this.repository.createQueryBuilder('p')
            .where('p.companyRef = :companyId', { companyId })
            .andWhere('p.businessStructureRef = :businessStructureId', { businessStructureId });
        const lastRecord = await query
            .orderBy('CAST(p.code AS int)', 'DESC')
            .getOne();
        let nextSeq = startNumber;
        if (lastRecord && lastRecord.code) {
            const lastValStr = String(lastRecord.code);
            let prefixStr = String(fixedChar || '');
            if (prefixStr && lastValStr.startsWith(prefixStr)) {
                const numPart = lastValStr.slice(prefixStr.length);
                const parsed = parseInt(numPart, 10);
                if (!isNaN(parsed)) {
                    nextSeq = parsed + 1;
                }
            }
            else {
                const matchDigits = lastValStr.match(/\\d+$/);
                if (matchDigits) {
                    nextSeq = parseInt(matchDigits[0], 10) + 1;
                }
                else {
                    nextSeq = (parseInt(lastRecord.code, 10) || 0) + 1;
                }
            }
        }
        if (nextSeq > endNumber) {
            return {
                numberingMethod,
                nextValue: '',
                error: `شماره تولید شده (${nextSeq}) از شماره پایانی تعریف شده (${endNumber}) در روش شماره گذاری تجاوز کرده است.`
            };
        }
        const formatted = String(fixedChar || '') + String(nextSeq);
        return { numberingMethod, nextValue: formatted };
    }
};
exports.RecieptAndPaymentAccountingSettingRepository = RecieptAndPaymentAccountingSettingRepository;
exports.RecieptAndPaymentAccountingSettingRepository = RecieptAndPaymentAccountingSettingRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(reciept_and_payment_accounting_setting_entity_1.RecieptAndPaymentAccountingSetting)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        request_context_service_1.RequestContextService])
], RecieptAndPaymentAccountingSettingRepository);
//# sourceMappingURL=reciept-and-payment-accounting-setting.repository.js.map