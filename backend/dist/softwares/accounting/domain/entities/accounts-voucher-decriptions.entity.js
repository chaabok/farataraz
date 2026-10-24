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
exports.AccountsVoucherDecriptions = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const account_entity_1 = require("./account.entity");
let AccountsVoucherDecriptions = class AccountsVoucherDecriptions extends app_base_entity_1.AppBaseEntity {
};
exports.AccountsVoucherDecriptions = AccountsVoucherDecriptions;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'AccountsVoucherDecriptionID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], AccountsVoucherDecriptions.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountID', type: 'bigint' }),
    __metadata("design:type", Number)
], AccountsVoucherDecriptions.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.Account, account => account.frequentDescriptions, { onDelete: 'CASCADE', nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'AccountID' }),
    __metadata("design:type", account_entity_1.Account)
], AccountsVoucherDecriptions.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], AccountsVoucherDecriptions.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description_En', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], AccountsVoucherDecriptions.prototype, "description2", void 0);
exports.AccountsVoucherDecriptions = AccountsVoucherDecriptions = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Acc', name: 'AccountsVoucherDecriptions' })
], AccountsVoucherDecriptions);
//# sourceMappingURL=accounts-voucher-decriptions.entity.js.map