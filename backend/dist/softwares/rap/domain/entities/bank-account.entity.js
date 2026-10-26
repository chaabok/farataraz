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
exports.BankAccount = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const bank_branch_entity_1 = require("./bank-branch.entity");
const bank_account_type_entity_1 = require("./bank-account-type.entity");
const account_entity_1 = require("../../../accounting/domain/entities/account.entity");
const currency_entity_1 = require("../../../common/domain/entities/currency.entity");
let BankAccount = class BankAccount extends app_base_entity_1.AppBaseEntity {
};
exports.BankAccount = BankAccount;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'BankAccountID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], BankAccount.prototype, "bankAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BankBranchRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], BankAccount.prototype, "bankBranchRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_branch_entity_1.BankBranch, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'BankBranchRef', referencedColumnName: 'bankBranchId' }),
    __metadata("design:type", bank_branch_entity_1.BankBranch)
], BankAccount.prototype, "bankBranch", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BankAccountTypeRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], BankAccount.prototype, "bankAccountTypeRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_account_type_entity_1.BankAccountType, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'BankAccountTypeRef', referencedColumnName: 'bankAccountTypeId' }),
    __metadata("design:type", bank_account_type_entity_1.BankAccountType)
], BankAccount.prototype, "bankAccountType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountNumber', type: 'varchar', length: 50, nullable: false }),
    __metadata("design:type", String)
], BankAccount.prototype, "accountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title', type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], BankAccount.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LatinTitle', type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], BankAccount.prototype, "latinTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ShabaNumber', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BankAccount.prototype, "shabaNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedCode', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], BankAccount.prototype, "detailedCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], BankAccount.prototype, "accountRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.Account, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'AccountRef', referencedColumnName: 'id' }),
    __metadata("design:type", account_entity_1.Account)
], BankAccount.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CurrencyRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], BankAccount.prototype, "currencyRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => currency_entity_1.Currency, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'CurrencyRef', referencedColumnName: 'currencyID' }),
    __metadata("design:type", currency_entity_1.Currency)
], BankAccount.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'InitialBalance', type: 'decimal', precision: 18, scale: 2, nullable: false, default: 1, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseFloat(value.toString()) : 0
        } }),
    __metadata("design:type", Number)
], BankAccount.prototype, "initialBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'OpeningDate', type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], BankAccount.prototype, "openingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountHolderName', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], BankAccount.prototype, "accountHolderName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsActive', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], BankAccount.prototype, "isActive", void 0);
exports.BankAccount = BankAccount = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'BankAccounts' })
], BankAccount);
//# sourceMappingURL=bank-account.entity.js.map