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
exports.AccountsRelatedDetailedAccount = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const account_entity_1 = require("./account.entity");
const detailed_type_entity_1 = require("./detailed-type.entity");
let AccountsRelatedDetailedAccount = class AccountsRelatedDetailedAccount extends app_base_entity_1.AppBaseEntity {
};
exports.AccountsRelatedDetailedAccount = AccountsRelatedDetailedAccount;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'AccountsRelatedDeatailedAccountsID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], AccountsRelatedDetailedAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountID', type: 'bigint' }),
    __metadata("design:type", Number)
], AccountsRelatedDetailedAccount.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.Account, account => account.relatedDetailedAccounts, { onDelete: 'RESTRICT', nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'AccountID' }),
    __metadata("design:type", account_entity_1.Account)
], AccountsRelatedDetailedAccount.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedLevel', type: 'int' }),
    __metadata("design:type", Number)
], AccountsRelatedDetailedAccount.prototype, "detailedLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedTypesID', type: 'bigint' }),
    __metadata("design:type", Number)
], AccountsRelatedDetailedAccount.prototype, "detailedTypeId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => detailed_type_entity_1.DetailedType, { eager: true, onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'DetailedTypesID' }),
    __metadata("design:type", detailed_type_entity_1.DetailedType)
], AccountsRelatedDetailedAccount.prototype, "detailedType", void 0);
exports.AccountsRelatedDetailedAccount = AccountsRelatedDetailedAccount = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Acc', name: 'AccountsRelatedDeatailedAccounts' })
], AccountsRelatedDetailedAccount);
//# sourceMappingURL=accounts-related-detailed-account.entity.js.map