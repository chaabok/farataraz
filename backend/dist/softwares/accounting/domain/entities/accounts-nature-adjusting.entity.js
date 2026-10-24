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
exports.AccountsNatureAdjusting = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const account_entity_1 = require("./account.entity");
let AccountsNatureAdjusting = class AccountsNatureAdjusting extends app_base_entity_1.AppBaseEntity {
};
exports.AccountsNatureAdjusting = AccountsNatureAdjusting;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'AccountsNatureAdjustingID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], AccountsNatureAdjusting.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountID', type: 'bigint' }),
    __metadata("design:type", Number)
], AccountsNatureAdjusting.prototype, "accountId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.Account, account => account.natureAdjustments, { onDelete: 'RESTRICT', nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: 'AccountID' }),
    __metadata("design:type", account_entity_1.Account)
], AccountsNatureAdjusting.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'MoinCode', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], AccountsNatureAdjusting.prototype, "moinCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'MoinTitle', type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], AccountsNatureAdjusting.prototype, "moinTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Nature', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], AccountsNatureAdjusting.prototype, "nature", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], AccountsNatureAdjusting.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description2', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], AccountsNatureAdjusting.prototype, "description2", void 0);
exports.AccountsNatureAdjusting = AccountsNatureAdjusting = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Acc', name: 'AccountsNatureAdjusting' })
], AccountsNatureAdjusting);
//# sourceMappingURL=accounts-nature-adjusting.entity.js.map