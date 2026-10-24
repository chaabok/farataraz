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
exports.PurchaseSalesParameterService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const purchase_sales_parameter_repository_interface_1 = require("../../domain/repositories/purchase-sales-parameter.repository.interface");
const purchase_sales_parameter_value_entity_1 = require("../../domain/entities/purchase-sales-parameter-value.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let PurchaseSalesParameterService = class PurchaseSalesParameterService {
    constructor(repository, valueRepository, idGenerationService, requestContextService) {
        this.repository = repository;
        this.valueRepository = valueRepository;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
    }
    async findAll(query) {
        const data = await this.repository.findAll();
        const allValues = await this.valueRepository.find({
            order: { RowNo: 'ASC', PurchaseSalesParameterValueID: 'ASC' },
        });
        const valuesMap = new Map();
        for (const val of allValues) {
            const ref = Number(val.PurchaseSalesParameterRef);
            if (!valuesMap.has(ref)) {
                valuesMap.set(ref, []);
            }
            valuesMap.get(ref).push(val);
        }
        const result = data.map((item) => ({
            ...item,
            ParameterValues: valuesMap.get(Number(item.PurchaseSalesParameterID)) || [],
        }));
        return { data: result, total: result.length, success: true };
    }
    async findOne(id) {
        const entity = await this.repository.findById(id);
        if (!entity)
            throw new common_1.NotFoundException('پارامتر خرید و فروش یافت نشد');
        const parameterValues = await this.valueRepository.find({
            where: { PurchaseSalesParameterRef: id },
            order: { RowNo: 'ASC', PurchaseSalesParameterValueID: 'ASC' },
        });
        return {
            ...entity,
            ParameterValues: parameterValues || [],
        };
    }
    async checkDuplicate(field, value, excludeId) {
        return this.repository.checkDuplicate(field, value, excludeId);
    }
    async validateFields(dto, isCreate = false) {
        if (isCreate || dto.Title !== undefined) {
            if (!dto.Title || !dto.Title.trim()) {
                throw new common_1.BadRequestException('عنوان اجباری است');
            }
        }
        if (isCreate || dto.PrintPriority !== undefined) {
            if (dto.PrintPriority === null || dto.PrintPriority === undefined || dto.PrintPriority === '') {
                throw new common_1.BadRequestException('اولویت چاپ اجباری است');
            }
        }
        if (isCreate || dto.CalculationPriority !== undefined) {
            if (dto.CalculationPriority === null || dto.CalculationPriority === undefined || dto.CalculationPriority === '') {
                throw new common_1.BadRequestException('اولویت محاسبه اجباری است');
            }
        }
        if (dto.HasAccountingVoucher) {
            if (!dto.SlAccountRef) {
                throw new common_1.BadRequestException('در صورت انتخاب "دارای سند حسابداری"، انتخاب حساب معین اجباری است');
            }
        }
    }
    async validateDuplicates(dto, excludeId) {
        if (dto.Title !== undefined && dto.Title.trim()) {
            const isDuplicateTitle = await this.checkDuplicate('Title', dto.Title.trim(), excludeId);
            if (isDuplicateTitle) {
                throw new common_1.BadRequestException('عنوان پارامتر خرید و فروش تکراری است');
            }
        }
        if (dto.PrintPriority !== undefined && dto.PrintPriority !== null) {
            const isDuplicatePrintPriority = await this.checkDuplicate('PrintPriority', dto.PrintPriority, excludeId);
            if (isDuplicatePrintPriority) {
                throw new common_1.BadRequestException('اولویت چاپ تکراری است');
            }
        }
    }
    formatChar10Date(d) {
        if (!d)
            return null;
        const trimmed = String(d).trim();
        if (!trimmed)
            return null;
        if (trimmed.includes('T')) {
            return trimmed.split('T')[0].replace(/-/g, '/').slice(0, 10);
        }
        return trimmed.slice(0, 10);
    }
    async saveParameterValues(parameterId, values) {
        if (!values)
            return [];
        const validRows = values.filter((v) => v && (v.StartDate || v.EndDate || v.ParameterValue !== undefined || v.Description || v.ProductServiceRef || v.ProductServiceCode));
        if (validRows.length === 0)
            return [];
        const userId = this.requestContextService.getUserId() || 1;
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const nowTime = new Date().toTimeString().split(' ')[0];
        const startId = await this.idGenerationService.generateNextIdBlock('PurchaseSalesParameterValue', validRows.length);
        const entities = validRows.map((v, idx) => {
            const valNum = v.ParameterValue !== undefined && v.ParameterValue !== null && v.ParameterValue !== '' ? Number(v.ParameterValue) : 0;
            return this.valueRepository.create({
                PurchaseSalesParameterValueID: startId + idx,
                PurchaseSalesParameterRef: parameterId,
                RowNo: v.RowNo ? Number(v.RowNo) : idx + 1,
                StartDate: this.formatChar10Date(v.StartDate),
                EndDate: this.formatChar10Date(v.EndDate),
                ProductServiceRef: v.ProductServiceRef ? Number(v.ProductServiceRef) : null,
                ProductServiceCode: v.ProductServiceCode || null,
                ProductServiceName: v.ProductServiceName || null,
                MeasurementUnitName: v.MeasurementUnitName || null,
                ParameterValue: isNaN(valNum) ? 0 : valNum,
                Description: v.Description || null,
                companyRef: companyId,
                businessStructureRef: bsId,
                creator: userId,
                lastModifier: userId,
                createTime: nowTime,
                lastModificationTime: nowTime,
            });
        });
        return this.valueRepository.save(entities);
    }
    async create(createDto) {
        const userId = this.requestContextService.getUserId();
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const bsId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        await this.validateFields(createDto, true);
        await this.validateDuplicates(createDto);
        const id = await this.idGenerationService.generateNextIdBlock('PurchaseSalesParameters', 1);
        const { ParameterValues, ...masterDto } = createDto;
        const entity = {
            ...masterDto,
            PurchaseSalesParameterID: id,
            creator: userId || 1,
            companyRef: createDto.companyRef || companyId,
            businessStructureRef: createDto.businessStructureRef || bsId,
        };
        const savedMaster = await this.repository.create(entity);
        const savedValues = await this.saveParameterValues(id, ParameterValues);
        return {
            ...savedMaster,
            ParameterValues: savedValues,
        };
    }
    async update(id, updateDto) {
        const existing = await this.repository.findById(id);
        if (!existing)
            throw new common_1.NotFoundException('پارامتر خرید و فروش یافت نشد');
        const mergedDto = { ...existing, ...updateDto };
        await this.validateFields(mergedDto, false);
        await this.validateDuplicates(updateDto, id);
        const { ParameterValues, ...masterDto } = updateDto;
        const entityToSave = {
            ...masterDto,
            lastModifier: this.requestContextService.getUserId() || 1,
        };
        const updatedMaster = await this.repository.update(id, entityToSave);
        if (ParameterValues !== undefined) {
            await this.valueRepository.delete({ PurchaseSalesParameterRef: id });
            const savedValues = await this.saveParameterValues(id, ParameterValues);
            return {
                ...updatedMaster,
                ParameterValues: savedValues,
            };
        }
        else {
            const currentValues = await this.valueRepository.find({
                where: { PurchaseSalesParameterRef: id },
                order: { RowNo: 'ASC', PurchaseSalesParameterValueID: 'ASC' },
            });
            return {
                ...updatedMaster,
                ParameterValues: currentValues,
            };
        }
    }
    async remove(id) {
        const existing = await this.repository.findById(id);
        if (!existing)
            throw new common_1.NotFoundException('پارامتر خرید و فروش یافت نشد');
        await this.valueRepository.delete({ PurchaseSalesParameterRef: id });
        await this.repository.delete(id);
    }
};
exports.PurchaseSalesParameterService = PurchaseSalesParameterService;
exports.PurchaseSalesParameterService = PurchaseSalesParameterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(purchase_sales_parameter_repository_interface_1.IPurchaseSalesParameterRepositoryToken)),
    __param(1, (0, typeorm_1.InjectRepository)(purchase_sales_parameter_value_entity_1.PurchaseSalesParameterValue)),
    __metadata("design:paramtypes", [Object, typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], PurchaseSalesParameterService);
//# sourceMappingURL=purchase-sales-parameter.service.js.map