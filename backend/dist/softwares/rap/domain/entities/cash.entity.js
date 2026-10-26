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
exports.Cash = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const detailed_account_entity_1 = require("../../../accounting/domain/entities/detailed-account.entity");
const currency_entity_1 = require("../../../common/domain/entities/currency.entity");
const cashier_entity_1 = require("./cashier.entity");
let Cash = class Cash extends app_base_entity_1.AppBaseEntity {
};
exports.Cash = Cash;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'CashID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], Cash.prototype, "cashId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Code', type: 'varchar', length: 50, nullable: false }),
    __metadata("design:type", String)
], Cash.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title', type: 'varchar', length: 150, nullable: false }),
    __metadata("design:type", String)
], Cash.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title_En', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], Cash.prototype, "title_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CashTypeID', type: 'int', nullable: false, default: 1 }),
    __metadata("design:type", Number)
], Cash.prototype, "cashTypeId", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'DetailedAccountID', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], Cash.prototype, "detailedAccountId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => detailed_account_entity_1.DetailedAccount, { eager: true, onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'DetailedAccountID', referencedColumnName: 'detailedAccountId' }),
    __metadata("design:type", detailed_account_entity_1.DetailedAccount)
], Cash.prototype, "detailedAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CurrencyID', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], Cash.prototype, "currencyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => currency_entity_1.Currency, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'CurrencyID', referencedColumnName: 'currencyID' }),
    __metadata("design:type", currency_entity_1.Currency)
], Cash.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'InitialBalance', type: 'numeric', precision: 18, scale: 4, default: 0, transformer: {
            to: (value) => value,
            from: (value) => parseFloat(value)
        } }),
    __metadata("design:type", Number)
], Cash.prototype, "initialBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'OpeningDate', type: 'date', nullable: true }),
    __metadata("design:type", Date)
], Cash.prototype, "openingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsActive', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Cash.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Cash.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => cashier_entity_1.Cashier, cashier => cashier.cash, { cascade: ['insert', 'update'] }),
    __metadata("design:type", Array)
], Cash.prototype, "cashiers", void 0);
exports.Cash = Cash = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'Cashes' })
], Cash);
//# sourceMappingURL=cash.entity.js.map