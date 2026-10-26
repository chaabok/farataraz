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
exports.ItemPackageDetail = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const item_package_entity_1 = require("./item-package.entity");
const item_entity_1 = require("./item.entity");
const measurement_unit_entity_1 = require("./measurement-unit.entity");
let ItemPackageDetail = class ItemPackageDetail extends app_base_entity_1.AppBaseEntity {
};
exports.ItemPackageDetail = ItemPackageDetail;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemPackageDetail.prototype, "ItemPackageDetailID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemPackageDetail.prototype, "ItemPackageRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_package_entity_1.ItemPackage, (pkg) => pkg.Details, { onDelete: 'CASCADE', createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemPackageRef' }),
    __metadata("design:type", item_package_entity_1.ItemPackage)
], ItemPackageDetail.prototype, "ItemPackage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ItemPackageDetail.prototype, "RowNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemPackageDetail.prototype, "ItemRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_entity_1.Item, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemRef' }),
    __metadata("design:type", item_entity_1.Item)
], ItemPackageDetail.prototype, "Item", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemPackageDetail.prototype, "MeasurementUnitRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => measurement_unit_entity_1.MeasurementUnit, { nullable: true, createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'MeasurementUnitRef' }),
    __metadata("design:type", measurement_unit_entity_1.MeasurementUnit)
], ItemPackageDetail.prototype, "MeasurementUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 1 }),
    __metadata("design:type", Number)
], ItemPackageDetail.prototype, "Quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ItemPackageDetail.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemPackageDetail.prototype, "FiscalYearRef", void 0);
exports.ItemPackageDetail = ItemPackageDetail = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'ItemPackageDetails' })
], ItemPackageDetail);
//# sourceMappingURL=item-package-detail.entity.js.map