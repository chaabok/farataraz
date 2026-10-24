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
exports.ReceivedChequeOperationService = void 0;
const common_1 = require("@nestjs/common");
const received_cheque_operation_repository_interface_1 = require("../../domain/repositories/received-cheque-operation.repository.interface");
const auto_voucher_service_1 = require("./auto-voucher.service");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
const received_cheque_operation_item_entity_1 = require("../../domain/entities/received-cheque-operation-item.entity");
let ReceivedChequeOperationService = class ReceivedChequeOperationService {
    constructor(repo, requestContext, idGenService, autoVoucherService) {
        this.repo = repo;
        this.requestContext = requestContext;
        this.idGenService = idGenService;
        this.autoVoucherService = autoVoucherService;
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
        let dateStr = '';
        if (dto.documentDate) {
            dateStr = (0, moment_jalaali_1.default)(dto.documentDate).format('jYYYY/jMM/jDD');
        }
        else {
            dateStr = (0, moment_jalaali_1.default)().format('jYYYY/jMM/jDD');
        }
        const docRes = await this.repo.calculateNextDocumentNumber(dateStr, bsId, compId);
        if (docRes.error) {
            throw new Error(docRes.error);
        }
        if (docRes.numberingMethod === '2' || !dto.documentNumber) {
            dto.documentNumber = docRes.nextValue;
        }
        const id = await this.idGenService.generateNextId('ReceivedChequeOperation');
        let items = [];
        if (dto.items && dto.items.length > 0) {
            items = await Promise.all(dto.items.map(async (item) => {
                const itemId = item.receivedChequeOperationItemId || await this.idGenService.generateNextId('ReceivedChequeOperationItem');
                const entityItem = new received_cheque_operation_item_entity_1.ReceivedChequeOperationItem();
                entityItem.receivedChequeOperationItemId = itemId;
                entityItem.operationRef = id;
                entityItem.receiptChequeRef = item.receiptChequeRef;
                entityItem.chequeStatus = item.chequeStatus || null;
                entityItem.forecastDate = item.forecastDate || null;
                entityItem.cashRef = item.cashRef || null;
                return entityItem;
            }));
        }
        const payload = {
            receivedChequeOperationId: id,
            operationType: dto.operationType,
            documentNumber: dto.documentNumber,
            documentDate: dto.documentDate,
            assignmentNumber: dto.assignmentNumber,
            status: dto.status || 1,
            bankAccountRef: dto.bankAccountRef || null,
            realizerRef: dto.realizerRef || null,
            voucherHeaderRef: dto.voucherHeaderRef || null,
            items: items,
            companyRef: dto.companyRef || compId,
            businessStructureRef: dto.businessStructureRef || bsId,
            fiscalYearRef: dto.fiscalYearRef || 1,
        };
        const saved = await this.repo.create(payload);
        const voucherId = await this.autoVoucherService.generateAutoVoucherIfNeeded('ReceivedChequeOperation', saved.status, saved.documentDate, saved.documentNumber, saved.voucherHeaderRef, saved.receivedChequeOperationId);
        if (voucherId) {
            await this.repo.update(saved.receivedChequeOperationId, { voucherHeaderRef: voucherId });
            saved.voucherHeaderRef = voucherId;
        }
        return saved;
    }
    async update(id, dto) {
        const bsId = this.requestContext.getBusinessStructureId() || 2;
        const compId = this.requestContext.getCompanyId() || 2;
        const existing = await this.repo.findById(id);
        if (!existing) {
            throw new common_1.NotFoundException('ReceivedChequeOperation not found');
        }
        let dateStr = '';
        if (dto.documentDate) {
            dateStr = (0, moment_jalaali_1.default)(dto.documentDate).format('jYYYY/jMM/jDD');
        }
        else if (existing.documentDate) {
            dateStr = (0, moment_jalaali_1.default)(existing.documentDate).format('jYYYY/jMM/jDD');
        }
        const docRes = await this.repo.calculateNextDocumentNumber(dateStr, bsId, compId);
        if (docRes.numberingMethod === '2') {
            dto.documentNumber = existing.documentNumber;
        }
        const payload = {
            operationType: dto.operationType,
            documentNumber: dto.documentNumber,
            documentDate: dto.documentDate,
            assignmentNumber: dto.assignmentNumber,
            status: dto.status,
            bankAccountRef: dto.bankAccountRef !== undefined ? dto.bankAccountRef : existing.bankAccountRef,
            realizerRef: dto.realizerRef !== undefined ? dto.realizerRef : existing.realizerRef,
            voucherHeaderRef: dto.voucherHeaderRef !== undefined ? dto.voucherHeaderRef : existing.voucherHeaderRef,
        };
        if (dto.items) {
            const items = await Promise.all(dto.items.map(async (item) => {
                const itemId = item.receivedChequeOperationItemId || await this.idGenService.generateNextId('ReceivedChequeOperationItem');
                const entityItem = new received_cheque_operation_item_entity_1.ReceivedChequeOperationItem();
                entityItem.receivedChequeOperationItemId = itemId;
                entityItem.operationRef = id;
                entityItem.receiptChequeRef = item.receiptChequeRef;
                entityItem.chequeStatus = item.chequeStatus || null;
                entityItem.forecastDate = item.forecastDate || null;
                entityItem.cashRef = item.cashRef || null;
                return entityItem;
            }));
            payload.items = items;
        }
        await this.repo.update(id, payload);
        const updated = await this.repo.findById(id);
        if (updated) {
            const voucherId = await this.autoVoucherService.generateAutoVoucherIfNeeded('ReceivedChequeOperation', updated.status, updated.documentDate, updated.documentNumber, updated.voucherHeaderRef, updated.receivedChequeOperationId);
            if (voucherId && voucherId !== updated.voucherHeaderRef) {
                await this.repo.update(id, { voucherHeaderRef: voucherId });
                updated.voucherHeaderRef = voucherId;
            }
        }
        return updated;
    }
    async delete(id) {
        await this.repo.delete(id);
    }
    async findById(id) {
        return await this.repo.findById(id);
    }
    async findAll(filters) {
        const compId = this.requestContext.getCompanyId() || 2;
        const bsId = this.requestContext.getBusinessStructureId() || 2;
        const finalFilters = {
            ...filters,
            companyRef: compId,
            businessStructureRef: bsId,
        };
        return await this.repo.findAll(finalFilters);
    }
};
exports.ReceivedChequeOperationService = ReceivedChequeOperationService;
exports.ReceivedChequeOperationService = ReceivedChequeOperationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(received_cheque_operation_repository_interface_1.IReceivedChequeOperationRepositoryToken)),
    __metadata("design:paramtypes", [Object, request_context_service_1.RequestContextService,
        id_generation_service_1.IdGenerationService,
        auto_voucher_service_1.AutoVoucherService])
], ReceivedChequeOperationService);
//# sourceMappingURL=received-cheque-operation.service.js.map