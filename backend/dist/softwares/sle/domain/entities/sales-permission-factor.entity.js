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
exports.SalesPermissionFactor = void 0;
const typeorm_1 = require("typeorm");
const sales_permission_entity_1 = require("./sales-permission.entity");
let SalesPermissionFactor = class SalesPermissionFactor {
};
exports.SalesPermissionFactor = SalesPermissionFactor;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SalesPermissionFactor.prototype, "SalesPermissionFactorID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SalesPermissionFactor.prototype, "SalesPermissionRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sales_permission_entity_1.SalesPermission, (permission) => permission.factors, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'SalesPermissionRef' }),
    __metadata("design:type", sales_permission_entity_1.SalesPermission)
], SalesPermissionFactor.prototype, "salesPermission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], SalesPermissionFactor.prototype, "RowNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], SalesPermissionFactor.prototype, "FactorTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], SalesPermissionFactor.prototype, "FactorType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], SalesPermissionFactor.prototype, "Amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], SalesPermissionFactor.prototype, "Description", void 0);
exports.SalesPermissionFactor = SalesPermissionFactor = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Sle', name: 'SalesPermissionFactors' })
], SalesPermissionFactor);
//# sourceMappingURL=sales-permission-factor.entity.js.map