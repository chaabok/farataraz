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
exports.PaymentGatewayService = void 0;
const common_1 = require("@nestjs/common");
const payment_gateway_repository_interface_1 = require("../../domain/repositories/payment-gateway.repository.interface");
const id_generation_service_1 = require("../../../../core/services/id-generation.service");
const detailed_account_service_1 = require("../../../accounting/application/services/detailed-account.service");
const detailed_type_service_1 = require("../../../accounting/application/services/detailed-type.service");
const detailed_accounts_numbering_service_1 = require("../../../common/application/services/detailed-accounts-numbering.service");
const payment_gateway_type_enum_1 = require("../../domain/entities/payment-gateway-type.enum");
const party_service_1 = require("../../../common/application/services/party.service");
let PaymentGatewayService = class PaymentGatewayService {
    constructor(repository, idGenService, detailedAccountService, detailedTypeService, detailedAccountsNumberingService, partyService) {
        this.repository = repository;
        this.idGenService = idGenService;
        this.detailedAccountService = detailedAccountService;
        this.detailedTypeService = detailedTypeService;
        this.detailedAccountsNumberingService = detailedAccountsNumberingService;
        this.partyService = partyService;
    }
    async findAll(companyId, businessStructureId, isActive) {
        const where = {};
        if (companyId)
            where.companyRef = companyId;
        if (businessStructureId)
            where.businessStructureRef = businessStructureId;
        if (isActive !== undefined)
            where.isActive = isActive;
        return this.repository.findAll(where);
    }
    async findOne(id) {
        const entity = await this.repository.findById(id);
        if (!entity)
            throw new common_1.NotFoundException('Payment Gateway not found');
        return entity;
    }
    async create(data) {
        const nextId = await this.idGenService.generateNextId('PaymentGateway');
        const entityData = { ...data, paymentGatewayId: nextId };
        const isInternet = data.gatewayType === payment_gateway_type_enum_1.PaymentGatewayType.INTERNET;
        const typeCode = isInternet ? '4' : '3';
        const detailedTypes = await this.detailedTypeService.findAll();
        const targetType = detailedTypes.find(t => t.code === typeCode);
        if (targetType) {
            let detailedAccountCode = data.detailedAccountCode;
            if (!detailedAccountCode) {
                detailedAccountCode = await this.detailedAccountsNumberingService.getNextCode(targetType.detailedTypesId);
            }
            let title = "درگاه " + (isInternet ? "اینترنتی" : "کارتخوان") + " (" + (data.gatewayIdString || '') + ")";
            try {
                const party = await this.partyService.findOne(data.partiesRef);
                if (party) {
                    title = "درگاه " + (party.firstName || party.lastName || '') + " " + (data.gatewayIdString || '');
                }
            }
            catch (e) {
            }
            const newDa = await this.detailedAccountService.create({
                code: detailedAccountCode,
                title: title.trim(),
                detailedTypesId: targetType.detailedTypesId,
                isActive: data.isActive ?? true,
            });
            entityData.detailedAccountRef = newDa.detailedAccountId;
        }
        delete entityData.detailedAccountCode;
        if (data.contacts && data.contacts.length > 0) {
            let contactCount = data.contacts.length;
            const startContactId = await this.idGenService.generateNextIdBlock('PaymentGatewayContact', contactCount);
            entityData.contacts = data.contacts.map((c, idx) => ({
                ...c,
                paymentGatewayContactId: startContactId + idx,
                paymentGatewayRef: nextId
            }));
        }
        return this.repository.create(entityData);
    }
    async update(id, data) {
        const existing = await this.findOne(id);
        if (existing.detailedAccountRef && existing.detailedAccount) {
            const isInternet = data.gatewayType !== undefined ? data.gatewayType === payment_gateway_type_enum_1.PaymentGatewayType.INTERNET : existing.gatewayType === payment_gateway_type_enum_1.PaymentGatewayType.INTERNET;
            let title = "درگاه " + (isInternet ? "اینترنتی" : "کارتخوان") + " (" + (data.gatewayIdString || existing.gatewayIdString || '') + ")";
            try {
                const partyRef = data.partiesRef || existing.partiesRef;
                if (partyRef) {
                    const party = await this.partyService.findOne(partyRef);
                    if (party) {
                        title = "درگاه " + (party.firstName || party.lastName || '') + " " + (data.gatewayIdString || existing.gatewayIdString || '');
                    }
                }
            }
            catch (e) { }
            await this.detailedAccountService.update(existing.detailedAccountRef, {
                code: data.detailedAccountCode || existing.detailedAccount.code,
                title: title.trim(),
                detailedTypesId: existing.detailedAccount.detailedTypesId,
                isActive: data.isActive !== undefined ? data.isActive : existing.isActive,
            });
        }
        const entityData = { ...data };
        delete entityData.detailedAccountCode;
        if (entityData.contacts && entityData.contacts.length > 0) {
            let contactCount = entityData.contacts.length;
            const startContactId = await this.idGenService.generateNextIdBlock('PaymentGatewayContact', contactCount);
            entityData.contacts = entityData.contacts.map((c, idx) => ({
                ...c,
                paymentGatewayContactId: startContactId + idx,
                paymentGatewayRef: id
            }));
        }
        return this.repository.update(id, entityData);
    }
    async remove(id) {
        const existing = await this.findOne(id);
        const detailedAccountId = existing.detailedAccountRef;
        await this.repository.delete(id);
        if (detailedAccountId) {
            try {
                await this.detailedAccountService.remove(detailedAccountId);
            }
            catch (e) { }
        }
    }
};
exports.PaymentGatewayService = PaymentGatewayService;
exports.PaymentGatewayService = PaymentGatewayService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(payment_gateway_repository_interface_1.IPaymentGatewayRepositoryToken)),
    __metadata("design:paramtypes", [Object, id_generation_service_1.IdGenerationService,
        detailed_account_service_1.DetailedAccountService,
        detailed_type_service_1.DetailedTypeService,
        detailed_accounts_numbering_service_1.DetailedAccountsNumberingService,
        party_service_1.PartyService])
], PaymentGatewayService);
//# sourceMappingURL=payment-gateway.service.js.map