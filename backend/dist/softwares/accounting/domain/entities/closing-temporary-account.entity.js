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
exports.ClosingTemporaryAccount = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const closing_temporary_account_item_entity_1 = require("./closing-temporary-account-item.entity");
const closing_temporary_account_selected_entity_1 = require("./closing-temporary-account-selected.entity");
let ClosingTemporaryAccount = class ClosingTemporaryAccount extends app_base_entity_1.AppBaseEntity {
};
exports.ClosingTemporaryAccount = ClosingTemporaryAccount;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'ClosingTemporaryAccountID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], ClosingTemporaryAccount.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], ClosingTemporaryAccount.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ToDate', type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], ClosingTemporaryAccount.prototype, "toDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Type', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ClosingTemporaryAccount.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Status', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ClosingTemporaryAccount.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'VoucherRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ClosingTemporaryAccount.prototype, "voucherRef", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => closing_temporary_account_item_entity_1.ClosingTemporaryAccountItem, item => item.parent, { cascade: true, eager: true, orphanedRowAction: 'delete' }),
    __metadata("design:type", Array)
], ClosingTemporaryAccount.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => closing_temporary_account_selected_entity_1.ClosingTemporaryAccountSelected, sel => sel.parent, { cascade: true, eager: true, orphanedRowAction: 'delete' }),
    __metadata("design:type", Array)
], ClosingTemporaryAccount.prototype, "selectedAccounts", void 0);
exports.ClosingTemporaryAccount = ClosingTemporaryAccount = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Acc', name: 'ClosingTemporaryAccount' })
], ClosingTemporaryAccount);
//# sourceMappingURL=closing-temporary-account.entity.js.map