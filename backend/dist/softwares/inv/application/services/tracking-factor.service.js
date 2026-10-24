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
exports.TrackingFactorService = void 0;
const common_1 = require("@nestjs/common");
const tracking_factor_repository_interface_1 = require("../../domain/repositories/tracking-factor.repository.interface");
const tracking_factor_item_related_entity_1 = require("../../domain/entities/tracking-factor-item-related.entity");
const tracking_factor_constant_value_entity_1 = require("../../domain/entities/tracking-factor-constant-value.entity");
const item_entity_1 = require("../../domain/entities/item.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
function containsDecimal(val) {
    if (!val)
        return false;
    const normalized = String(val)
        .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
        .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
    return /\d+[\.٫]\d+/.test(normalized) || /\.\d+/.test(normalized) || /٫\d+/.test(normalized);
}
let TrackingFactorService = class TrackingFactorService {
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
    async validateDuplicates(params, excludeId) {
        if (params.code !== undefined && params.code !== null) {
            const isDuplicateCode = await this.repository.checkDuplicateCode(params.code, excludeId);
            if (isDuplicateCode) {
                throw new common_1.BadRequestException(`کد عامل ردیابی (${params.code}) تکراری می‌باشد`);
            }
        }
        if (params.name !== undefined && params.name !== null && params.name.trim() !== '') {
            const trimmedName = params.name.trim();
            const isDuplicateName = await this.repository.checkDuplicateName(trimmedName, excludeId);
            if (isDuplicateName) {
                throw new common_1.BadRequestException(`عنوان عامل ردیابی (${trimmedName}) تکراری می‌باشد`);
            }
        }
        if (params.name2 !== undefined && params.name2 !== null && params.name2.trim() !== '') {
            const trimmedName2 = params.name2.trim();
            const isDuplicateName2 = await this.repository.checkDuplicateName2(trimmedName2, excludeId);
            if (isDuplicateName2) {
                throw new common_1.BadRequestException(`عنوان 2 عامل ردیابی (${trimmedName2}) تکراری می‌باشد`);
            }
        }
        if (params.priority !== undefined && params.priority !== null) {
            const isDuplicatePriority = await this.repository.checkDuplicatePriority(params.priority, excludeId);
            if (isDuplicatePriority) {
                throw new common_1.BadRequestException(`اولویت نمایش (${params.priority}) تکراری می‌باشد`);
            }
        }
    }
    async create(dto) {
        const userId = this.requestContextService.getUserId() || 1;
        const { bsId, compId } = await this.getScope();
        const code = dto.TrackingFactorCode ? Number(dto.TrackingFactorCode) : await this.repository.calculateNextCode();
        const priority = (dto.DisplayPriority !== undefined && dto.DisplayPriority !== null && !isNaN(Number(dto.DisplayPriority)) && Number(dto.DisplayPriority) > 0)
            ? Number(dto.DisplayPriority)
            : await this.repository.calculateNextPriority();
        const name = dto.TrackingFactorName ? dto.TrackingFactorName.trim() : '';
        const name2 = (dto.TrackingFactorName2 && dto.TrackingFactorName2.trim()) ? dto.TrackingFactorName2.trim() : null;
        await this.validateDuplicates({
            code,
            name,
            name2,
            priority,
        });
        const newId = await this.idGenerationService.generateNextIdBlock('TrackingFactors', 1);
        const trackingFactorType = dto.TrackingFactorType ? Number(dto.TrackingFactorType) : 1;
        if (trackingFactorType === 8) {
            if (!dto.StartValue || !dto.StartValue.trim()) {
                throw new common_1.BadRequestException('لطفاً مقدار شروع را وارد نمایید');
            }
            if (!dto.EndValue || !dto.EndValue.trim()) {
                throw new common_1.BadRequestException('لطفاً مقدار پایان را وارد نمایید');
            }
            if (containsDecimal(dto.StartValue)) {
                throw new common_1.BadRequestException('مقدار فیلد شروع نمی‌تواند شامل عدد اعشاری باشد');
            }
            if (containsDecimal(dto.EndValue)) {
                throw new common_1.BadRequestException('مقدار فیلد پایان نمی‌تواند شامل عدد اعشاری باشد');
            }
        }
        const entityData = {
            TrackingFactorID: newId,
            TrackingFactorCode: code,
            TrackingFactorName: name,
            TrackingFactorName2: name2,
            TrackingFactorType: trackingFactorType,
            StartValue: trackingFactorType === 8 ? (dto.StartValue ? dto.StartValue.trim() : 'از سریال') : null,
            EndValue: trackingFactorType === 8 ? (dto.EndValue ? dto.EndValue.trim() : 'تا سریال') : null,
            IsConstantValue: !!dto.IsConstantValue,
            DisplayPriority: priority,
            IsActive: dto.IsActive !== undefined ? !!dto.IsActive : true,
            companyRef: compId,
            businessStructureRef: bsId,
            creator: userId,
            lastModifier: userId,
        };
        const saved = await this.repository.create(entityData);
        const relatedItemIds = this.extractRelatedItemIds(dto);
        if (relatedItemIds.length > 0) {
            const startRelId = await this.idGenerationService.generateNextIdBlock('TrackingFactorItemRelated', relatedItemIds.length);
            for (let i = 0; i < relatedItemIds.length; i++) {
                const itemId = relatedItemIds[i];
                const relId = startRelId + i;
                const relEntity = this.repository.manager.create(tracking_factor_item_related_entity_1.TrackingFactorItemRelated, {
                    TrackingFactorItemRelatedID: relId,
                    TrackingFactorRef: newId,
                    ItemRef: itemId,
                    companyRef: compId,
                    businessStructureRef: bsId,
                    creator: userId,
                    lastModifier: userId,
                });
                await this.repository.manager.save(relEntity);
            }
        }
        if (dto.IsConstantValue && dto.constantValues && dto.constantValues.length > 0) {
            await this.saveConstantValues(newId, dto.constantValues, bsId, compId, userId);
        }
        return this.findOne(newId);
    }
    async update(id, dto) {
        const existing = await this.repository.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException('عامل ردیابی یافت نشد');
        }
        const userId = this.requestContextService.getUserId() || 1;
        const { bsId, compId } = await this.getScope();
        const code = dto.TrackingFactorCode !== undefined ? Number(dto.TrackingFactorCode) : existing.TrackingFactorCode;
        const name = dto.TrackingFactorName !== undefined ? dto.TrackingFactorName.trim() : existing.TrackingFactorName;
        const name2 = dto.TrackingFactorName2 !== undefined
            ? ((dto.TrackingFactorName2 && dto.TrackingFactorName2.trim()) ? dto.TrackingFactorName2.trim() : null)
            : existing.TrackingFactorName2;
        const priority = dto.DisplayPriority !== undefined ? Number(dto.DisplayPriority) : existing.DisplayPriority;
        const isConstantValue = dto.IsConstantValue !== undefined ? !!dto.IsConstantValue : existing.IsConstantValue;
        await this.validateDuplicates({
            code,
            name,
            name2,
            priority,
        }, id);
        const trackingFactorType = dto.TrackingFactorType !== undefined ? Number(dto.TrackingFactorType) : existing.TrackingFactorType;
        if (trackingFactorType === 8) {
            const startVal = dto.StartValue !== undefined ? dto.StartValue : existing.StartValue;
            const endVal = dto.EndValue !== undefined ? dto.EndValue : existing.EndValue;
            if (!startVal || !startVal.trim()) {
                throw new common_1.BadRequestException('لطفاً مقدار شروع را وارد نمایید');
            }
            if (!endVal || !endVal.trim()) {
                throw new common_1.BadRequestException('لطفاً مقدار پایان را وارد نمایید');
            }
            if (containsDecimal(startVal)) {
                throw new common_1.BadRequestException('مقدار فیلد شروع نمی‌تواند شامل عدد اعشاری باشد');
            }
            if (containsDecimal(endVal)) {
                throw new common_1.BadRequestException('مقدار فیلد پایان نمی‌تواند شامل عدد اعشاری باشد');
            }
        }
        const updateData = {
            TrackingFactorCode: code,
            TrackingFactorName: name,
            TrackingFactorName2: name2,
            TrackingFactorType: trackingFactorType,
            StartValue: trackingFactorType === 8 ? (dto.StartValue !== undefined ? (dto.StartValue ? dto.StartValue.trim() : null) : existing.StartValue) : null,
            EndValue: trackingFactorType === 8 ? (dto.EndValue !== undefined ? (dto.EndValue ? dto.EndValue.trim() : null) : existing.EndValue) : null,
            IsConstantValue: isConstantValue,
            DisplayPriority: priority,
            IsActive: dto.IsActive !== undefined ? !!dto.IsActive : existing.IsActive,
            lastModifier: userId,
        };
        await this.repository.update(id, updateData);
        if (dto.relatedItemIds !== undefined || dto.relatedItems !== undefined) {
            await this.repository.manager.delete(tracking_factor_item_related_entity_1.TrackingFactorItemRelated, { TrackingFactorRef: id });
            const relatedItemIds = this.extractRelatedItemIds(dto);
            if (relatedItemIds.length > 0) {
                const startRelId = await this.idGenerationService.generateNextIdBlock('TrackingFactorItemRelated', relatedItemIds.length);
                for (let i = 0; i < relatedItemIds.length; i++) {
                    const itemId = relatedItemIds[i];
                    const relId = startRelId + i;
                    const relEntity = this.repository.manager.create(tracking_factor_item_related_entity_1.TrackingFactorItemRelated, {
                        TrackingFactorItemRelatedID: relId,
                        TrackingFactorRef: id,
                        ItemRef: itemId,
                        companyRef: compId,
                        businessStructureRef: bsId,
                        creator: userId,
                        lastModifier: userId,
                    });
                    await this.repository.manager.save(relEntity);
                }
            }
        }
        if (dto.constantValues !== undefined || dto.IsConstantValue !== undefined) {
            await this.repository.manager.delete(tracking_factor_constant_value_entity_1.TrackingFactorConstantValue, { TrackingFactorRef: id });
            if (isConstantValue && dto.constantValues && dto.constantValues.length > 0) {
                await this.saveConstantValues(id, dto.constantValues, bsId, compId, userId);
            }
        }
        return this.findOne(id);
    }
    async saveConstantValues(trackingFactorId, constantValues, bsId, compId, userId) {
        if (!Array.isArray(constantValues) || constantValues.length === 0)
            return;
        const validValues = constantValues.filter((cvItem) => cvItem && cvItem.ConstantValue !== undefined && cvItem.ConstantValue !== null && String(cvItem.ConstantValue).trim() !== '');
        if (validValues.length === 0)
            return;
        const startCvId = await this.idGenerationService.generateNextIdBlock('TrackingFactorConstantValue', validValues.length);
        for (let i = 0; i < validValues.length; i++) {
            const cvItem = validValues[i];
            const cvId = startCvId + i;
            const cvEntity = this.repository.manager.create(tracking_factor_constant_value_entity_1.TrackingFactorConstantValue, {
                TrackingFactorConstantValueID: cvId,
                TrackingFactorRef: trackingFactorId,
                RowNumber: cvItem.RowNumber || i + 1,
                ConstantValue: String(cvItem.ConstantValue).trim(),
                companyRef: compId,
                businessStructureRef: bsId,
                creator: userId,
                lastModifier: userId,
            });
            await this.repository.manager.save(cvEntity);
        }
    }
    extractRelatedItemIds(dto) {
        const set = new Set();
        if (Array.isArray(dto.relatedItemIds)) {
            dto.relatedItemIds.forEach((id) => {
                if (id && !isNaN(Number(id)))
                    set.add(Number(id));
            });
        }
        if (Array.isArray(dto.relatedItems)) {
            dto.relatedItems.forEach((item) => {
                if (item && item.ItemRef && !isNaN(Number(item.ItemRef)))
                    set.add(Number(item.ItemRef));
            });
        }
        return Array.from(set);
    }
    async findAll(query) {
        const { skip, take } = query;
        const [data, total] = await Promise.all([
            this.repository.findAll({
                skip: skip ? parseInt(skip) : undefined,
                take: take ? parseInt(take) : undefined,
            }),
            this.repository.count(),
        ]);
        return { data, total, success: true };
    }
    async findOne(id) {
        const entity = await this.repository.findById(id);
        if (!entity) {
            throw new common_1.NotFoundException('عامل ردیابی یافت نشد');
        }
        return entity;
    }
    async remove(id) {
        await this.findOne(id);
        await this.repository.delete(id);
    }
    async getNextNumber() {
        const [nextCode, nextPriority] = await Promise.all([
            this.repository.calculateNextCode(),
            this.repository.calculateNextPriority(),
        ]);
        return { documentNumber: nextCode, nextPriority };
    }
    async getNextPriority() {
        const nextPriority = await this.repository.calculateNextPriority();
        return { nextPriority };
    }
    async getAvailableItems(trackingFactorId) {
        const { bsId, compId, isShared } = await this.getScope();
        const qb = this.repository.manager.createQueryBuilder(item_entity_1.Item, 'item');
        if (isShared) {
            qb.where('item.businessStructureRef = :bsId', { bsId });
        }
        else {
            qb.where('item.companyRef = :compId', { compId });
        }
        qb.andWhere('item.IsActive = :isActive', { isActive: true });
        qb.orderBy('item.ItemCode', 'ASC');
        const items = await qb.getMany();
        return items.map((i) => ({
            ItemID: Number(i.ItemID),
            ItemCode: i.ItemCode,
            ItemName: i.ItemName,
            ItemName2: i.ItemName2 || '',
            MeasurementUnitRef: i.MeasurementUnitRef,
            IsActive: i.IsActive,
        }));
    }
    async validateRange(body) {
        const normalize = (val) => {
            if (!val)
                return '';
            return String(val)
                .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
                .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
                .replace(/,/g, '')
                .trim();
        };
        const userStartStr = normalize(body.userStart);
        const userEndStr = normalize(body.userEnd);
        const baseStartStr = normalize(body.baseStart);
        const baseEndStr = normalize(body.baseEnd);
        const fName = body.factorName ? ` (${body.factorName})` : '';
        if (baseStartStr && baseEndStr) {
            if (/^\d+$/.test(baseStartStr) && /^\d+$/.test(baseEndStr)) {
                const baseStartNum = BigInt(baseStartStr);
                const baseEndNum = BigInt(baseEndStr);
                if (userStartStr && /^\d+$/.test(userStartStr)) {
                    const uStartNum = BigInt(userStartStr);
                    if (uStartNum < baseStartNum) {
                        return {
                            valid: false,
                            message: `مقدار "از سریال" (${body.userStart})${fName} نمی‌تواند کمتر از شروع بازه فرم مبنا (${body.baseStart}) باشد.`,
                        };
                    }
                    if (uStartNum > baseEndNum) {
                        return {
                            valid: false,
                            message: `مقدار "از سریال" (${body.userStart})${fName} نمی‌تواند بیشتر از پایان بازه فرم مبنا (${body.baseEnd}) باشد.`,
                        };
                    }
                }
                if (userEndStr && /^\d+$/.test(userEndStr)) {
                    const uEndNum = BigInt(userEndStr);
                    if (uEndNum > baseEndNum) {
                        return {
                            valid: false,
                            message: `مقدار "تا سریال" (${body.userEnd})${fName} نمی‌تواند بیشتر از پایان بازه فرم مبنا (${body.baseEnd}) باشد.`,
                        };
                    }
                    if (uEndNum < baseStartNum) {
                        return {
                            valid: false,
                            message: `مقدار "تا سریال" (${body.userEnd})${fName} نمی‌تواند کمتر از شروع بازه فرم مبنا (${body.baseStart}) باشد.`,
                        };
                    }
                }
                if (userStartStr && userEndStr && /^\d+$/.test(userStartStr) && /^\d+$/.test(userEndStr)) {
                    const uStartNum = BigInt(userStartStr);
                    const uEndNum = BigInt(userEndStr);
                    if (uEndNum < uStartNum) {
                        return {
                            valid: false,
                            message: `مقدار "تا سریال" (${body.userEnd})${fName} نمی‌تواند از "از سریال" (${body.userStart}) کمتر باشد.`,
                        };
                    }
                }
            }
        }
        return { valid: true, message: 'بازه معتبر است.' };
    }
};
exports.TrackingFactorService = TrackingFactorService;
exports.TrackingFactorService = TrackingFactorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(tracking_factor_repository_interface_1.ITrackingFactorRepositoryToken)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], TrackingFactorService);
//# sourceMappingURL=tracking-factor.service.js.map