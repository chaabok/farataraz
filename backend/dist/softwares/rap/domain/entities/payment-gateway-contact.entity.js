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
exports.PaymentGatewayContact = void 0;
const typeorm_1 = require("typeorm");
const payment_gateway_entity_1 = require("./payment-gateway.entity");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let PaymentGatewayContact = class PaymentGatewayContact extends app_base_entity_1.AppBaseEntity {
};
exports.PaymentGatewayContact = PaymentGatewayContact;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'PaymentGatewayContactID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PaymentGatewayContact.prototype, "paymentGatewayContactId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PaymentGatewayRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], PaymentGatewayContact.prototype, "paymentGatewayRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => payment_gateway_entity_1.PaymentGateway, (pg) => pg.contacts, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'PaymentGatewayRef', referencedColumnName: 'paymentGatewayId' }),
    __metadata("design:type", payment_gateway_entity_1.PaymentGateway)
], PaymentGatewayContact.prototype, "paymentGateway", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], PaymentGatewayContact.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title2', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], PaymentGatewayContact.prototype, "title2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PhoneNumber', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], PaymentGatewayContact.prototype, "phoneNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaymentGatewayContact.prototype, "description", void 0);
exports.PaymentGatewayContact = PaymentGatewayContact = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'PaymentGatewayContacts' })
], PaymentGatewayContact);
//# sourceMappingURL=payment-gateway-contact.entity.js.map