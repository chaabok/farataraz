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
exports.SalesReturnPermission = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const sales_return_permission_item_entity_1 = require("./sales-return-permission-item.entity");
const sales_return_permission_factor_entity_1 = require("./sales-return-permission-factor.entity");
let SalesReturnPermission = class SalesReturnPermission extends app_base_entity_1.AppBaseEntity {
};
exports.SalesReturnPermission = SalesReturnPermission;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SalesReturnPermission.prototype, "SalesReturnPermissionID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SalesReturnPermission.prototype, "PermissionNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], SalesReturnPermission.prototype, "PermissionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesReturnPermission.prototype, "CustomerRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], SalesReturnPermission.prototype, "CustomerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesReturnPermission.prototype, "SalesTypeRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesReturnPermission.prototype, "SalesCenterRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesReturnPermission.prototype, "DeliveryLocationRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesReturnPermission.prototype, "SettlementMethodRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], SalesReturnPermission.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", String)
], SalesReturnPermission.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], SalesReturnPermission.prototype, "BaseDocumentTypeRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesReturnPermission.prototype, "BaseDocumentRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesReturnPermission.prototype, "FiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => sales_return_permission_item_entity_1.SalesReturnPermissionItem, (item) => item.salesReturnPermission, { cascade: true }),
    __metadata("design:type", Array)
], SalesReturnPermission.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => sales_return_permission_factor_entity_1.SalesReturnPermissionFactor, (factor) => factor.salesReturnPermission, { cascade: true }),
    __metadata("design:type", Array)
], SalesReturnPermission.prototype, "factors", void 0);
exports.SalesReturnPermission = SalesReturnPermission = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Sle', name: 'SalesReturnPermissions' })
], SalesReturnPermission);
//# sourceMappingURL=sales-return-permission.entity.js.map