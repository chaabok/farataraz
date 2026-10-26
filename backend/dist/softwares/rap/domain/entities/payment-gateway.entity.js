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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGateway = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const bank_account_entity_1 = require("./bank-account.entity");
const detailed_account_entity_1 = require("../../../accounting/domain/entities/detailed-account.entity");
const party_entity_1 = require("../../../common/domain/entities/party.entity");
const payment_gateway_contact_entity_1 = require("./payment-gateway-contact.entity");
const payment_gateway_type_enum_1 = require("./payment-gateway-type.enum");
let PaymentGateway = class PaymentGateway extends app_base_entity_1.AppBaseEntity {
};
exports.PaymentGateway = PaymentGateway;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'PaymentGatewayID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PaymentGateway.prototype, "paymentGatewayId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'GatewayType', type: 'varchar', length: 50, nullable: false, default: payment_gateway_type_enum_1.PaymentGatewayType.INTERNET }),
    __metadata("design:type", String)
], PaymentGateway.prototype, "gatewayType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PartiesRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], PaymentGateway.prototype, "partiesRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => party_entity_1.Party, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'PartiesRef', referencedColumnName: 'partyId' }),
    __metadata("design:type", party_entity_1.Party)
], PaymentGateway.prototype, "party", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], PaymentGateway.prototype, "detailedAccountRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => detailed_account_entity_1.DetailedAccount, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'DetailedAccountRef', referencedColumnName: 'detailedAccountId' }),
    __metadata("design:type", detailed_account_entity_1.DetailedAccount)
], PaymentGateway.prototype, "detailedAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BankAccountRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], PaymentGateway.prototype, "bankAccountRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_account_entity_1.BankAccount, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'BankAccountRef', referencedColumnName: 'bankAccountId' }),
    __metadata("design:type", bank_account_entity_1.BankAccount)
], PaymentGateway.prototype, "bankAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'GatewayIdString', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], PaymentGateway.prototype, "gatewayIdString", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsActive', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PaymentGateway.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => payment_gateway_contact_entity_1.PaymentGatewayContact, (contact) => contact.paymentGateway, { cascade: true, eager: true, orphanedRowAction: 'delete' }),
    __metadata("design:type", Array)
], PaymentGateway.prototype, "contacts", void 0);
exports.PaymentGateway = PaymentGateway = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'PaymentGateways' })
], PaymentGateway);
//# sourceMappingURL=payment-gateway.entity.js.map