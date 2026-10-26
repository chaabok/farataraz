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
exports.PettyCash = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const account_entity_1 = require("../../../accounting/domain/entities/account.entity");
const currency_entity_1 = require("../../../common/domain/entities/currency.entity");
const party_entity_1 = require("../../../common/domain/entities/party.entity");
let PettyCash = class PettyCash extends app_base_entity_1.AppBaseEntity {
};
exports.PettyCash = PettyCash;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'PettyCashID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PettyCash.prototype, "pettyCashId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title', type: 'varchar', length: 150, nullable: false }),
    __metadata("design:type", String)
], PettyCash.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CurrencyID', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], PettyCash.prototype, "currencyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => currency_entity_1.Currency, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'CurrencyID', referencedColumnName: 'currencyID' }),
    __metadata("design:type", currency_entity_1.Currency)
], PettyCash.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'OpeningDate', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], PettyCash.prototype, "openingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'InitialBalance', type: 'numeric', precision: 18, scale: 4, default: 0, transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value)
        } }),
    __metadata("design:type", Number)
], PettyCash.prototype, "initialBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PettyCashLimit', type: 'numeric', precision: 18, scale: 4, default: 0, transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value)
        } }),
    __metadata("design:type", Number)
], PettyCash.prototype, "pettyCashLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CurrentBalance', type: 'numeric', precision: 18, scale: 4, default: 0, transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value)
        } }),
    __metadata("design:type", Number)
], PettyCash.prototype, "currentBalance", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'AccountRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PettyCash.prototype, "accountRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.Account, { eager: true, onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'AccountRef', referencedColumnName: 'id' }),
    __metadata("design:type", account_entity_1.Account)
], PettyCash.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'PartyRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PettyCash.prototype, "partyRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => party_entity_1.Party, { eager: true, onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'PartyRef', referencedColumnName: 'partyId' }),
    __metadata("design:type", party_entity_1.Party)
], PettyCash.prototype, "party", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsPettyCashLimitControlled', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PettyCash.prototype, "isPettyCashLimitControlled", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsActive', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PettyCash.prototype, "isActive", void 0);
exports.PettyCash = PettyCash = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'PettyCashes' })
], PettyCash);
//# sourceMappingURL=petty-cash.entity.js.map