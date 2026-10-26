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
exports.BankReconciliationService = void 0;
const common_1 = require("@nestjs/common");
const bank_reconciliation_repository_interface_1 = require("../../domain/repositories/bank-reconciliation.repository.interface");
const request_context_service_1 = require("../../../../core/services/request-context.service");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const bank_reconciliation_item_entity_1 = require("../../domain/entities/bank-reconciliation-item.entity");
let BankReconciliationService = class BankReconciliationService {
    constructor(bankReconciliationRepository, requestContextService, idGenerationService) {
        this.bankReconciliationRepository = bankReconciliationRepository;
        this.requestContextService = requestContextService;
        this.idGenerationService = idGenerationService;
    }
    async getNextNumbers(jalaliDateStr) {
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const docRes = await this.bankReconciliationRepository.calculateNextDocumentNumber(jalaliDateStr, businessStructureId, companyId);
        return {
            isDocumentNumberAuto: docRes.numberingMethod === '2',
            documentNumber: docRes.nextValue,
            error: docRes.error,
        };
    }
    async create(createDto) {
        const companyId = this.requestContextService.getCompanyId() || 2;
        const businessStructureId = this.requestContextService.getBusinessStructureId() || 2;
        const id = await this.idGenerationService.generateNextId('BankReconciliation');
        let Number = createDto.Number;
        if (!Number) {
            Number = id.toString();
        }
        const items = [];
        if (createDto.items) {
            for (const itemDto of createDto.items) {
                const itemId = await this.idGenerationService.generateNextId('BankReconciliationItem');
                const item = new bank_reconciliation_item_entity_1.BankReconciliationItem();
                item.BankReconciliationItemID = itemId;
                item.BankStatementItemRef = itemDto.BankStatementItemRef;
                item.BookItemRef = itemDto.BookItemRef;
                item.matchId = itemDto.matchId;
                item.companyRef = companyId;
                item.businessStructureRef = businessStructureId;
                item.BankReconciliationRef = id;
                items.push(item);
            }
        }
        const entity = this.bankReconciliationRepository.create({
            ...createDto,
            Number,
            BankReconciliationID: id,
            items,
            companyRef: companyId,
            businessStructureRef: businessStructureId,
        });
        return this.bankReconciliationRepository.save(entity);
    }
    async findAll() {
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        return this.bankReconciliationRepository.find({
            where: {
                companyRef: companyId,
                businessStructureRef: businessStructureId,
            },
            relations: ['bankAccount', 'bankStatement', 'items'],
        });
    }
    async findOne(id) {
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        const entity = await this.bankReconciliationRepository.findOne({
            where: {
                BankReconciliationID: id,
                companyRef: companyId,
                businessStructureRef: businessStructureId,
            },
            relations: ['bankAccount', 'bankStatement', 'items'],
        });
        if (!entity)
            throw new common_1.NotFoundException('BankReconciliation not found');
        return entity;
    }
    async update(id, updateDto) {
        const entity = await this.findOne(id);
        const companyId = (this.requestContextService.getCompanyId() && this.requestContextService.getCompanyId() > 1) ? this.requestContextService.getCompanyId() : 2;
        const businessStructureId = (this.requestContextService.getBusinessStructureId() && this.requestContextService.getBusinessStructureId() > 1) ? this.requestContextService.getBusinessStructureId() : 2;
        if (updateDto.items) {
            const items = [];
            for (const itemDto of updateDto.items) {
                const itemId = await this.idGenerationService.generateNextId('BankReconciliationItem');
                const item = new bank_reconciliation_item_entity_1.BankReconciliationItem();
                item.BankReconciliationItemID = itemId;
                item.BankStatementItemRef = itemDto.BankStatementItemRef;
                item.BookItemRef = itemDto.BookItemRef;
                item.matchId = itemDto.matchId;
                item.companyRef = companyId;
                item.businessStructureRef = businessStructureId;
                item.BankReconciliationRef = id;
                items.push(item);
            }
            entity.items = items;
        }
        Object.assign(entity, {
            ...updateDto,
            items: entity.items,
        });
        return this.bankReconciliationRepository.save(entity);
    }
    async remove(id) {
        const entity = await this.findOne(id);
        return this.bankReconciliationRepository.remove(entity);
    }
};
exports.BankReconciliationService = BankReconciliationService;
exports.BankReconciliationService = BankReconciliationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(bank_reconciliation_repository_interface_1.IBankReconciliationRepositoryToken)),
    __metadata("design:paramtypes", [Object, request_context_service_1.RequestContextService,
        id_generation_service_1.IdGenerationService])
], BankReconciliationService);
//# sourceMappingURL=bank-reconciliation.service.js.map