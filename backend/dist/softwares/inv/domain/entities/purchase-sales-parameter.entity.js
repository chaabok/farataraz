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
exports.PurchaseSalesParameter = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let PurchaseSalesParameter = class PurchaseSalesParameter extends app_base_entity_1.AppBaseEntity {
};
exports.PurchaseSalesParameter = PurchaseSalesParameter;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'PurchaseSalesParameterID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PurchaseSalesParameter.prototype, "PurchaseSalesParameterID", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsProcurement', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PurchaseSalesParameter.prototype, "IsProcurement", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsWarehouse', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PurchaseSalesParameter.prototype, "IsWarehouse", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsSales', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PurchaseSalesParameter.prototype, "IsSales", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title', type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], PurchaseSalesParameter.prototype, "Title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title2', type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], PurchaseSalesParameter.prototype, "Title2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CalculationPriority', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PurchaseSalesParameter.prototype, "CalculationPriority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PrintPriority', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PurchaseSalesParameter.prototype, "PrintPriority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ParameterType', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PurchaseSalesParameter.prototype, "ParameterType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CalculationMethod', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PurchaseSalesParameter.prototype, "CalculationMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CalculationCondition', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PurchaseSalesParameter.prototype, "CalculationCondition", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RelationType', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PurchaseSalesParameter.prototype, "RelationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'OperationType', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PurchaseSalesParameter.prototype, "OperationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'AmountAllocationMethod', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PurchaseSalesParameter.prototype, "AmountAllocationMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CategoryOther', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PurchaseSalesParameter.prototype, "CategoryOther", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'HasAccountingVoucher', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PurchaseSalesParameter.prototype, "HasAccountingVoucher", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'SlAccountRef',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        }
    }),
    __metadata("design:type", Number)
], PurchaseSalesParameter.prototype, "SlAccountRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsNonDefiniteAmount', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PurchaseSalesParameter.prototype, "IsNonDefiniteAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsMandatory', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PurchaseSalesParameter.prototype, "IsMandatory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsFactorValueEditableByUser', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PurchaseSalesParameter.prototype, "IsFactorValueEditableByUser", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsActive', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PurchaseSalesParameter.prototype, "IsActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PurchaseSalesParameter.prototype, "Description", void 0);
exports.PurchaseSalesParameter = PurchaseSalesParameter = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'PurchaseSalesParameters' })
], PurchaseSalesParameter);
//# sourceMappingURL=purchase-sales-parameter.entity.js.map