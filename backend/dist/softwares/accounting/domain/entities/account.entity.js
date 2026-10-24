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
exports.Account = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const accounts_related_detailed_account_entity_1 = require("./accounts-related-detailed-account.entity");
const accounts_nature_adjusting_entity_1 = require("./accounts-nature-adjusting.entity");
const accounts_voucher_decriptions_entity_1 = require("./accounts-voucher-decriptions.entity");
let Account = class Account extends app_base_entity_1.AppBaseEntity {
};
exports.Account = Account;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'AccountID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], Account.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Code', type: 'varchar', length: 20, nullable: false }),
    __metadata("design:type", String)
], Account.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title', type: 'varchar', length: 100, nullable: false }),
    __metadata("design:type", String)
], Account.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title_En', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], Account.prototype, "title_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ParentID', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], Account.prototype, "parentId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Account, { nullable: true, onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'ParentID' }),
    __metadata("design:type", Account)
], Account.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountType', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Account.prototype, "accountType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountNature', type: 'int', nullable: false, default: 7 }),
    __metadata("design:type", Number)
], Account.prototype, "accountNature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'NatureControl', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Account.prototype, "natureControl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsActive', type: 'boolean', default: true, nullable: false }),
    __metadata("design:type", Boolean)
], Account.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TrackingFeature', type: 'boolean', nullable: true, default: false }),
    __metadata("design:type", Boolean)
], Account.prototype, "trackingFeature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CurrencyFeature', type: 'boolean', nullable: true, default: false }),
    __metadata("design:type", Boolean)
], Account.prototype, "currencyFeature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ExchangeableFeature', type: 'boolean', nullable: true, default: false }),
    __metadata("design:type", Boolean)
], Account.prototype, "exchangeableFeature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TrackingQuantity', type: 'boolean', nullable: true, default: false }),
    __metadata("design:type", Boolean)
], Account.prototype, "trackingQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TrackingNumber', type: 'boolean', nullable: true, default: false }),
    __metadata("design:type", Boolean)
], Account.prototype, "trackingNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'TrackingDate', type: 'boolean', nullable: true, default: false }),
    __metadata("design:type", Boolean)
], Account.prototype, "trackingDate", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => accounts_related_detailed_account_entity_1.AccountsRelatedDetailedAccount, related => related.account, { cascade: true, eager: true, orphanedRowAction: 'delete' }),
    __metadata("design:type", Array)
], Account.prototype, "relatedDetailedAccounts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => accounts_nature_adjusting_entity_1.AccountsNatureAdjusting, adjusting => adjusting.account, { cascade: true, eager: true, orphanedRowAction: 'delete' }),
    __metadata("design:type", Array)
], Account.prototype, "natureAdjustments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => accounts_voucher_decriptions_entity_1.AccountsVoucherDecriptions, desc => desc.account, { cascade: true, eager: true, orphanedRowAction: 'delete' }),
    __metadata("design:type", Array)
], Account.prototype, "frequentDescriptions", void 0);
exports.Account = Account = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Acc', name: 'Accounts' }),
    (0, typeorm_1.Check)('"AccountID" != "ParentID"'),
    (0, typeorm_1.Check)('length("Code") > 0')
], Account);
//# sourceMappingURL=account.entity.js.map