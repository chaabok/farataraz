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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaidDocumentClearingService = void 0;
const common_1 = require("@nestjs/common");
const paid_document_clearing_repository_interface_1 = require("../../domain/repositories/paid-document-clearing.repository.interface");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const document_accounting_info_service_1 = require("./document-accounting-info.service");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
const paid_document_clearing_item_entity_1 = require("../../domain/entities/paid-document-clearing-item.entity");
let PaidDocumentClearingService = class PaidDocumentClearingService {
    constructor(repo, requestContext, idGenService, documentAccountingInfoService) {
        this.repo = repo;
        this.requestContext = requestContext;
        this.idGenService = idGenService;
        this.documentAccountingInfoService = documentAccountingInfoService;
    }
    async getNextNumbers(jalaliDateStr) {
        const bsId = this.requestContext.getBusinessStructureId() || 2;
        const compId = this.requestContext.getCompanyId() || 2;
        let dateStr = jalaliDateStr;
        if (!dateStr) {
            dateStr = (0, moment_jalaali_1.default)().format('jYYYY/jMM/jDD');
        }
        const docRes = await this.repo.calculateNextDocumentNumber(dateStr, bsId, compId);
        return {
            documentNumber: docRes.nextValue,
            isDocumentNumberAuto: docRes.numberingMethod === '2',
            error: docRes.error || null,
        };
    }
    async create(dto) {
        const compId = this.requestContext.getCompanyId() || 2;
        const bsId = this.requestContext.getBusinessStructureId() || 2;
        const defaultFiscalYear = this.requestContext.getFiscalYearId() || 1;
        let dateStr = '';
        if (dto.date) {
            dateStr = (0, moment_jalaali_1.default)(dto.date, 'jYYYY/jMM/jDD').format('jYYYY/jMM/jDD');
        }
        else {
            dateStr = (0, moment_jalaali_1.default)().format('jYYYY/jMM/jDD');
        }
        const docRes = await this.repo.calculateNextDocumentNumber(dateStr, bsId, compId);
        if (docRes.error) {
            throw new Error(docRes.error);
        }
        if (docRes.numberingMethod === '2' || !dto.number) {
            dto.number = docRes.nextValue;
        }
        const id = await this.idGenService.generateNextId('PaidDocumentClearing');
        let items = [];
        if (dto.items && dto.items.length > 0) {
            items = await Promise.all(dto.items.map(async (item) => {
                const itemId = await this.idGenService.generateNextId('PaidDocumentClearingItem');
                const entityItem = new paid_document_clearing_item_entity_1.PaidDocumentClearingItem();
                entityItem.paidDocumentClearingItemId = itemId;
                entityItem.documentType = item.documentType;
                entityItem.paidDocumentClearingRef = id;
                entityItem.documentId = item.documentId;
                return entityItem;
            }));
        }
        const payload = {
            paidDocumentClearingId: id,
            number: dto.number,
            date: dto.date,
            bankAccountRef: dto.bankAccountRef,
            description: dto.description || null,
            status: dto.status !== undefined ? dto.status : 2,
            voucherHeaderRef: dto.voucherHeaderRef || null,
            items: items,
            companyRef: dto.companyRef || compId,
            businessStructureRef: dto.businessStructureRef || bsId,
            fiscalYearRef: dto.fiscalYearRef || defaultFiscalYear,
        };
        const saved = await this.repo.create(payload);
        await this.documentAccountingInfoService.saveDefaults('PaidDocumentClearing', saved.paidDocumentClearingId);
        return saved;
    }
    async update(id, dto) {
        const dtoLocal = dto;
        const bsId = this.requestContext.getBusinessStructureId() || 2;
        const compId = this.requestContext.getCompanyId() || 2;
        const existing = await this.repo.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException('PaidDocumentClearing not found');
        }
        let dateStr = '';
        if (dtoLocal.date) {
            dateStr = (0, moment_jalaali_1.default)(dtoLocal.date, 'jYYYY/jMM/jDD').format('jYYYY/jMM/jDD');
        }
        else if (existing.date) {
            dateStr = (0, moment_jalaali_1.default)(existing.date, 'jYYYY/jMM/jDD').format('jYYYY/jMM/jDD');
        }
        const docRes = await this.repo.calculateNextDocumentNumber(dateStr, bsId, compId);
        if (docRes.numberingMethod === '2') {
            dtoLocal.number = existing.number;
        }
        const payload = {
            number: dtoLocal.number,
            date: dtoLocal.date,
            bankAccountRef: dtoLocal.bankAccountRef !== undefined ? dtoLocal.bankAccountRef : existing.bankAccountRef,
            description: dtoLocal.description,
            status: dtoLocal.status !== undefined ? dtoLocal.status : existing.status,
            fiscalYearRef: dtoLocal.fiscalYearRef !== undefined ? dtoLocal.fiscalYearRef : existing.fiscalYearRef,
            voucherHeaderRef: dtoLocal.voucherHeaderRef !== undefined ? dtoLocal.voucherHeaderRef : existing.voucherHeaderRef,
        };
        if (dtoLocal.items) {
            const items = await Promise.all(dtoLocal.items.map(async (item) => {
                const itemId = await this.idGenService.generateNextId('PaidDocumentClearingItem');
                const entityItem = new paid_document_clearing_item_entity_1.PaidDocumentClearingItem();
                entityItem.paidDocumentClearingItemId = itemId;
                entityItem.documentType = item.documentType;
                entityItem.paidDocumentClearingRef = id;
                entityItem.documentId = item.documentId;
                return entityItem;
            }));
            payload.items = items;
        }
        await this.repo.manager.delete(paid_document_clearing_item_entity_1.PaidDocumentClearingItem, { paidDocumentClearingRef: id });
        const updated = await this.repo.update(id, payload);
        await this.documentAccountingInfoService.saveDefaults('PaidDocumentClearing', id);
        return updated;
    }
    async delete(id) {
        await this.repo.delete(id);
    }
    async findById(id) {
        return await this.repo.findByIdCustom(id);
    }
    async findAll(filters) {
        const compId = this.requestContext.getCompanyId() || 2;
        const bsId = this.requestContext.getBusinessStructureId() || 2;
        const finalFilters = {
            ...filters,
            companyRef: compId,
            businessStructureRef: bsId,
        };
        return await this.repo.findAllCustom(finalFilters);
    }
};
exports.PaidDocumentClearingService = PaidDocumentClearingService;
exports.PaidDocumentClearingService = PaidDocumentClearingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(paid_document_clearing_repository_interface_1.IPaidDocumentClearingRepositoryToken)),
    __metadata("design:paramtypes", [Object, request_context_service_1.RequestContextService,
        id_generation_service_1.IdGenerationService,
        document_accounting_info_service_1.DocumentAccountingInfoService])
], PaidDocumentClearingService);
//# sourceMappingURL=paid-document-clearing.service.js.map