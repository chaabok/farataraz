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
exports.PurchaseSalesParameterValue = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let PurchaseSalesParameterValue = class PurchaseSalesParameterValue extends app_base_entity_1.AppBaseEntity {
};
exports.PurchaseSalesParameterValue = PurchaseSalesParameterValue;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'PurchaseSalesParameterValueID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PurchaseSalesParameterValue.prototype, "PurchaseSalesParameterValueID", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'PurchaseSalesParameterRef',
        type: 'bigint',
        nullable: false,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PurchaseSalesParameterValue.prototype, "PurchaseSalesParameterRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RowNo', type: 'int', nullable: true, default: 1 }),
    __metadata("design:type", Number)
], PurchaseSalesParameterValue.prototype, "RowNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'StartDate', type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], PurchaseSalesParameterValue.prototype, "StartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EndDate', type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], PurchaseSalesParameterValue.prototype, "EndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ParameterValue', type: 'decimal', precision: 18, scale: 4, default: 0, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseFloat(value.toString()) : 0
        } }),
    __metadata("design:type", Number)
], PurchaseSalesParameterValue.prototype, "ParameterValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], PurchaseSalesParameterValue.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'ProductServiceRef',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        }
    }),
    __metadata("design:type", Number)
], PurchaseSalesParameterValue.prototype, "ProductServiceRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ProductServiceCode', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], PurchaseSalesParameterValue.prototype, "ProductServiceCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ProductServiceName', type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], PurchaseSalesParameterValue.prototype, "ProductServiceName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'MeasurementUnitName', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], PurchaseSalesParameterValue.prototype, "MeasurementUnitName", void 0);
exports.PurchaseSalesParameterValue = PurchaseSalesParameterValue = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'PurchaseSalesParameterValues' })
], PurchaseSalesParameterValue);
//# sourceMappingURL=purchase-sales-parameter-value.entity.js.map