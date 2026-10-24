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
exports.PaymentGatewayRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_gateway_entity_1 = require("../../domain/entities/payment-gateway.entity");
const payment_gateway_contact_entity_1 = require("../../domain/entities/payment-gateway-contact.entity");
const request_context_service_1 = require("../../../../core/services/request-context.service");
let PaymentGatewayRepository = class PaymentGatewayRepository {
    constructor(repository, contactRepository, requestContextService) {
        this.repository = repository;
        this.contactRepository = contactRepository;
        this.requestContextService = requestContextService;
    }
    async getScope(overrideBsId, overrideCompId) {
        const bsId = overrideBsId ?? this.requestContextService.getBusinessStructureId() ?? 2;
        const compId = overrideCompId ?? this.requestContextService.getCompanyId() ?? 2;
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
    async findById(id) {
        const { bsId, compId, isShared } = await this.getScope();
        const where = { paymentGatewayId: id };
        if (isShared)
            where.businessStructureRef = bsId;
        else
            where.companyRef = compId;
        return this.repository.findOne({ where, relations: ['party', 'detailedAccount', 'bankAccount', 'contacts'] });
    }
    async findAll(where = {}) {
        const { bsId, compId, isShared } = await this.getScope(where.businessStructureRef, where.companyRef);
        delete where.businessStructureRef;
        delete where.companyRef;
        if (isShared) {
            where.businessStructureRef = bsId;
        }
        else {
            where.companyRef = compId;
        }
        return this.repository.find({ where, relations: ['party', 'detailedAccount', 'bankAccount', 'contacts'], order: { paymentGatewayId: 'DESC' } });
    }
    async create(data) {
        const { bsId, compId } = await this.getScope();
        if (!data.businessStructureRef || data.businessStructureRef <= 1)
            data.businessStructureRef = bsId;
        if (!data.companyRef || data.companyRef <= 1)
            data.companyRef = compId;
        const contacts = data.contacts || [];
        delete data.contacts;
        const entity = this.repository.create(data);
        const saved = await this.repository.save(entity);
        if (contacts && contacts.length > 0) {
            const contactsToSave = contacts.map(c => this.contactRepository.create({ ...c, paymentGatewayRef: saved.paymentGatewayId }));
            await this.contactRepository.save(contactsToSave);
            saved.contacts = contactsToSave;
        }
        return saved;
    }
    async update(id, data) {
        const existing = await this.findById(id);
        if (!existing)
            throw new common_1.NotFoundException('Payment Gateway not found');
        const contacts = data.contacts;
        delete data.contacts;
        Object.assign(existing, data);
        const saved = await this.repository.save(existing);
        if (contacts) {
            await this.contactRepository.delete({ paymentGatewayRef: id });
            if (contacts.length > 0) {
                const contactsToSave = contacts.map(c => this.contactRepository.create({ ...c, paymentGatewayRef: saved.paymentGatewayId }));
                await this.contactRepository.save(contactsToSave);
                saved.contacts = contactsToSave;
            }
            else {
                saved.contacts = [];
            }
        }
        return saved;
    }
    async delete(id) {
        await this.contactRepository.delete({ paymentGatewayRef: id });
        await this.repository.delete(id);
    }
};
exports.PaymentGatewayRepository = PaymentGatewayRepository;
exports.PaymentGatewayRepository = PaymentGatewayRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_gateway_entity_1.PaymentGateway)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_gateway_contact_entity_1.PaymentGatewayContact)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        request_context_service_1.RequestContextService])
], PaymentGatewayRepository);
//# sourceMappingURL=payment-gateway.repository.js.map