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
exports.ClosingTemporaryAccountSelected = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const closing_temporary_account_entity_1 = require("./closing-temporary-account.entity");
let ClosingTemporaryAccountSelected = class ClosingTemporaryAccountSelected extends app_base_entity_1.AppBaseEntity {
};
exports.ClosingTemporaryAccountSelected = ClosingTemporaryAccountSelected;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'ClosingTemporaryAccountSelectedID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], ClosingTemporaryAccountSelected.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ClosingTemporaryAccountRef', type: 'bigint' }),
    __metadata("design:type", Number)
], ClosingTemporaryAccountSelected.prototype, "closingTemporaryAccountRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => closing_temporary_account_entity_1.ClosingTemporaryAccount, parent => parent.selectedAccounts, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ClosingTemporaryAccountRef' }),
    __metadata("design:type", closing_temporary_account_entity_1.ClosingTemporaryAccount)
], ClosingTemporaryAccountSelected.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ClosingTemporaryAccountSelected.prototype, "accountRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountCode', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], ClosingTemporaryAccountSelected.prototype, "accountCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AccountTitle', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], ClosingTemporaryAccountSelected.prototype, "accountTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ClosingTemporaryAccountSelected.prototype, "detailedAccountRef", void 0);
exports.ClosingTemporaryAccountSelected = ClosingTemporaryAccountSelected = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Acc', name: 'ClosingTemporaryAccountSelected' })
], ClosingTemporaryAccountSelected);
//# sourceMappingURL=closing-temporary-account-selected.entity.js.map