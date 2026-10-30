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
exports.SalesContractService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const sales_contract_entity_1 = require("../../domain/entities/sales-contract.entity");
const sales_contract_item_entity_1 = require("../../domain/entities/sales-contract-item.entity");
const sales_contract_factor_entity_1 = require("../../domain/entities/sales-contract-factor.entity");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const typeorm_query_builder_1 = require("../../../../core/utils/typeorm-query-builder");
let SalesContractService = class SalesContractService {
    constructor(repository, itemRepository, factorRepository, idGenerationService, requestContextService) {
        this.repository = repository;
        this.itemRepository = itemRepository;
        this.factorRepository = factorRepository;
        this.idGenerationService = idGenerationService;
        this.requestContextService = requestContextService;
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
            .createQueryBuilder('sc')
            .select('MAX(sc.ContractNumber)', 'max')
            .where('sc.businessStructureRef = :bsId', { bsId })
            .andWhere('sc.companyRef = :compId', { compId })
            .andWhere('sc.FiscalYearRef = :fiscalYearId', { fiscalYearId })
            .getRawOne();
        const maxVal = maxResult?.max ? parseInt(maxResult.max, 10) : 0;
        return { documentNumber: maxVal + 1 };
    }
    validateRequiredRefs(dto) {
        const missing = [];
        if (!dto.SalesTypeRef || !Number(dto.SalesTypeRef))
            missing.push('نوع فروش');
        if (!dto.SalesCenterRef || !Number(dto.SalesCenterRef))
            missing.push('مرکز فروش');
        if (!dto.DeliveryLocationRef || !Number(dto.DeliveryLocationRef))
            missing.push('محل تحویل');
        if (!dto.SettlementMethodRef || !Number(dto.SettlementMethodRef))
            missing.push('روش تسویه');
        if (missing.length > 0) {
            throw new common_1.BadRequestException(`لطفاً ${missing.join('، ')} را انتخاب کنید`);
        }
    }
    async create(dto) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const userId = this.requestContextService.getUserId() || 1;
        this.validateRequiredRefs(dto);
        let contractNumber = dto.ContractNumber ? Number(dto.ContractNumber) : 0;
        if (!contractNumber || contractNumber <= 0) {
            const next = await this.getNextNumber();
            contractNumber = next.documentNumber;
        }
        const salesContractId = await this.idGenerationService.generateNextIdBlock('SalesContracts', 1);
        const contract = this.repository.create({
            SalesContractID: salesContractId,
            ContractNumber: contractNumber,
            DocumentDate: dto.DocumentDate || null,
            ContractDate: dto.ContractDate || null,
            CustomerRef: dto.CustomerRef ? Number(dto.CustomerRef) : null,
            CustomerName: dto.CustomerName || null,
            SalesTypeRef: dto.SalesTypeRef ? Number(dto.SalesTypeRef) : null,
            SalesCenterRef: dto.SalesCenterRef ? Number(dto.SalesCenterRef) : null,
            DeliveryLocationRef: dto.DeliveryLocationRef ? Number(dto.DeliveryLocationRef) : null,
            SettlementMethodRef: dto.SettlementMethodRef ? Number(dto.SettlementMethodRef) : null,
            Status: Number(dto.Status || 1),
            ContractSubject: dto.ContractSubject || null,
            BaseDocumentTypeRef: dto.BaseDocumentTypeRef !== undefined && dto.BaseDocumentTypeRef !== null && Number(dto.BaseDocumentTypeRef) > 0 ? Number(dto.BaseDocumentTypeRef) : null,
            BaseDocumentRef: dto.BaseDocumentRef ? Number(dto.BaseDocumentRef) : null,
            businessStructureRef: bsId,
            companyRef: compId,
            FiscalYearRef: fiscalYearId,
            creator: userId,
        });
        await this.repository.save(contract);
        const validItems = (Array.isArray(dto.items) ? dto.items : []).filter((i) => i.ItemRef && !isNaN(Number(i.ItemRef)));
        if (validItems.length > 0) {
            await this.saveItems(salesContractId, validItems);
        }
        const validFactors = (Array.isArray(dto.factors) ? dto.factors : []).filter((f) => f.FactorTitle && Number(f.Amount || 0) > 0);
        if (validFactors.length > 0) {
            await this.saveFactors(salesContractId, validFactors);
        }
        return this.findOne(salesContractId);
    }
    async saveItems(salesContractId, items) {
        const startItemId = await this.idGenerationService.generateNextIdBlock('SalesContractItems', items.length);
        const itemsToSave = items.map((d, idx) => {
            const qty = Number(d.Quantity || 0);
            const price = Number(d.UnitPrice || 0);
            return this.itemRepository.create({
                SalesContractItemID: startItemId + idx,
                SalesContractRef: salesContractId,
                RowNo: idx + 1,
                ItemRef: Number(d.ItemRef),
                ItemCode: d.ItemCode || null,
                ItemName: d.ItemName || null,
                UnitName: d.UnitName || null,
                Quantity: qty,
                UnitPrice: price,
                TotalPrice: d.TotalPrice !== undefined && d.TotalPrice !== null && d.TotalPrice !== ''
                    ? Math.round(Number(d.TotalPrice))
                    : Math.round(qty * price),
                Description: d.Description || null,
                TrackingFactorValues: d.trackingFactorValues ?? d.TrackingFactorValues ?? d.trackingFactors ?? null,
            });
        });
        await this.itemRepository.save(itemsToSave);
    }
    async saveFactors(salesContractId, factors) {
        const startFactorId = await this.idGenerationService.generateNextIdBlock('SalesContractFactors', factors.length);
        const factorsToSave = factors.map((f, idx) => this.factorRepository.create({
            SalesContractFactorID: startFactorId + idx,
            SalesContractRef: salesContractId,
            RowNo: idx + 1,
            FactorTitle: f.FactorTitle || null,
            FactorType: Number(f.FactorType || 1),
            Amount: Number(f.Amount || 0),
            Description: f.Description || null,
        }));
        await this.factorRepository.save(factorsToSave);
    }
    async findAll(query) {
        const { bsId, compId, fiscalYearId } = this.getScope();
        const qb = this.repository
            .createQueryBuilder('sc')
            .where('sc.businessStructureRef = :bsId', { bsId })
            .andWhere('sc.companyRef = :compId', { compId })
            .andWhere('sc.FiscalYearRef = :fiscalYearId', { fiscalYearId })
            .orderBy('sc.ContractNumber', 'DESC');
        const searchQ = (0, typeorm_query_builder_1.toLatinDigits)(String(query?.search ?? query?.globalFilter ?? '')).trim();
        if (searchQ) {
            qb.andWhere(new typeorm_2.Brackets((b) => {
                b.where('CAST(sc.ContractNumber AS VARCHAR) ILIKE :scSearch', { scSearch: `%${searchQ}%` })
                    .orWhere('sc.CustomerName ILIKE :scSearch', { scSearch: `%${searchQ}%` })
                    .orWhere('sc.ContractSubject ILIKE :scSearch', { scSearch: `%${searchQ}%` });
            }));
        }
        const hasPageSize = query && query.pageSize !== undefined && query.pageSize !== null && String(query.pageSize).trim() !== '';
        (0, typeorm_query_builder_1.applyDataGridParams)(qb, query, 'sc', { skipPagination: !hasPageSize });
        const [items, total] = await qb.getManyAndCount();
        return { items, total };
    }
    async findOne(id) {
        const contract = await this.repository.findOne({
            where: { SalesContractID: id },
            relations: ['items', 'factors'],
        });
        if (!contract) {
            throw new common_1.NotFoundException(`قرارداد فروش با شناسه ${id} یافت نشد`);
        }
        return contract;
    }
    async update(id, dto) {
        const contract = await this.findOne(id);
        const userId = this.requestContextService.getUserId() || 1;
        this.validateRequiredRefs(dto);
        if (dto.ContractNumber !== undefined && dto.ContractNumber !== null && Number(dto.ContractNumber) > 0) {
            contract.ContractNumber = Number(dto.ContractNumber);
        }
        contract.DocumentDate = dto.DocumentDate !== undefined ? dto.DocumentDate : contract.DocumentDate;
        contract.ContractDate = dto.ContractDate !== undefined ? (dto.ContractDate || null) : contract.ContractDate;
        contract.CustomerRef = dto.CustomerRef !== undefined ? (dto.CustomerRef ? Number(dto.CustomerRef) : null) : contract.CustomerRef;
        contract.CustomerName = dto.CustomerName !== undefined ? dto.CustomerName : contract.CustomerName;
        contract.SalesTypeRef = dto.SalesTypeRef !== undefined ? (dto.SalesTypeRef ? Number(dto.SalesTypeRef) : null) : contract.SalesTypeRef;
        contract.SalesCenterRef = dto.SalesCenterRef !== undefined ? (dto.SalesCenterRef ? Number(dto.SalesCenterRef) : null) : contract.SalesCenterRef;
        contract.DeliveryLocationRef = dto.DeliveryLocationRef !== undefined ? (dto.DeliveryLocationRef ? Number(dto.DeliveryLocationRef) : null) : contract.DeliveryLocationRef;
        contract.SettlementMethodRef = dto.SettlementMethodRef !== undefined ? (dto.SettlementMethodRef ? Number(dto.SettlementMethodRef) : null) : contract.SettlementMethodRef;
        contract.Status = dto.Status !== undefined ? Number(dto.Status || 1) : contract.Status;
        contract.ContractSubject = dto.ContractSubject !== undefined ? dto.ContractSubject : contract.ContractSubject;
        contract.BaseDocumentTypeRef = dto.BaseDocumentTypeRef !== undefined ? (Number(dto.BaseDocumentTypeRef) > 0 ? Number(dto.BaseDocumentTypeRef) : null) : contract.BaseDocumentTypeRef;
        contract.BaseDocumentRef = dto.BaseDocumentRef !== undefined ? (dto.BaseDocumentRef ? Number(dto.BaseDocumentRef) : null) : contract.BaseDocumentRef;
        contract.lastModifier = userId;
        await this.repository.save(contract);
        await this.itemRepository.delete({ SalesContractRef: id });
        const validItems = (Array.isArray(dto.items) ? dto.items : []).filter((i) => i.ItemRef && !isNaN(Number(i.ItemRef)));
        if (validItems.length > 0) {
            await this.saveItems(id, validItems);
        }
        await this.factorRepository.delete({ SalesContractRef: id });
        const validFactors = (Array.isArray(dto.factors) ? dto.factors : []).filter((f) => f.FactorTitle && Number(f.Amount || 0) > 0);
        if (validFactors.length > 0) {
            await this.saveFactors(id, validFactors);
        }
        return this.findOne(id);
    }
    async remove(id) {
        const contract = await this.findOne(id);
        await this.itemRepository.delete({ SalesContractRef: id });
        await this.factorRepository.delete({ SalesContractRef: id });
        await this.repository.remove(contract);
        return { success: true };
    }
};
exports.SalesContractService = SalesContractService;
exports.SalesContractService = SalesContractService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(sales_contract_entity_1.SalesContract)),
    __param(1, (0, typeorm_1.InjectRepository)(sales_contract_item_entity_1.SalesContractItem)),
    __param(2, (0, typeorm_1.InjectRepository)(sales_contract_factor_entity_1.SalesContractFactor)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        id_generation_service_1.IdGenerationService,
        request_context_service_1.RequestContextService])
], SalesContractService);
//# sourceMappingURL=sales-contract.service.js.map