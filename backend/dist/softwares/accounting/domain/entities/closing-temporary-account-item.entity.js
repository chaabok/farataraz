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
exports.ClosingTemporaryAccountItem = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const closing_temporary_account_entity_1 = require("./closing-temporary-account.entity");
let ClosingTemporaryAccountItem = class ClosingTemporaryAccountItem extends app_base_entity_1.AppBaseEntity {
};
exports.ClosingTemporaryAccountItem = ClosingTemporaryAccountItem;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'ClosingTemporaryAccountItemID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], ClosingTemporaryAccountItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ClosingTemporaryAccountRef', type: 'bigint' }),
    __metadata("design:type", Number)
], ClosingTemporaryAccountItem.prototype, "closingTemporaryAccountRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => closing_temporary_account_entity_1.ClosingTemporaryAccount, parent => parent.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ClosingTemporaryAccountRef' }),
    __metadata("design:type", closing_temporary_account_entity_1.ClosingTemporaryAccount)
], ClosingTemporaryAccountItem.prototype, "parent", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IntermediaryAccountRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], ClosingTemporaryAccountItem.prototype, "intermediaryAccountRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IntermediaryCode', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], ClosingTemporaryAccountItem.prototype, "intermediaryCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Percentage', type: 'decimal', precision: 5, scale: 2, nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseFloat(value) : null
        } }),
    __metadata("design:type", Number)
], ClosingTemporaryAccountItem.prototype, "percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountRef1', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ClosingTemporaryAccountItem.prototype, "detailedAccountRef1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountRef2', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ClosingTemporaryAccountItem.prototype, "detailedAccountRef2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountRef3', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ClosingTemporaryAccountItem.prototype, "detailedAccountRef3", void 0);
exports.ClosingTemporaryAccountItem = ClosingTemporaryAccountItem = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Acc', name: 'ClosingTemporaryAccountItem' })
], ClosingTemporaryAccountItem);
//# sourceMappingURL=closing-temporary-account-item.entity.js.map