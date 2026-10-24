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
exports.ItemPackage = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const item_enums_1 = require("../enums/item.enums");
const measurement_unit_entity_1 = require("./measurement-unit.entity");
const item_package_detail_entity_1 = require("./item-package-detail.entity");
let ItemPackage = class ItemPackage extends app_base_entity_1.AppBaseEntity {
};
exports.ItemPackage = ItemPackage;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemPackage.prototype, "ItemPackageID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: item_enums_1.ItemType.GOODS }),
    __metadata("design:type", Number)
], ItemPackage.prototype, "ItemType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ItemPackage.prototype, "PackageCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250 }),
    __metadata("design:type", String)
], ItemPackage.prototype, "PackageTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], ItemPackage.prototype, "PackageTitle2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemPackage.prototype, "MeasurementUnitRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => measurement_unit_entity_1.MeasurementUnit, { nullable: true, createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'MeasurementUnitRef' }),
    __metadata("design:type", measurement_unit_entity_1.MeasurementUnit)
], ItemPackage.prototype, "MeasurementUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 1 }),
    __metadata("design:type", Number)
], ItemPackage.prototype, "Quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ItemPackage.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ItemPackage.prototype, "IsActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemPackage.prototype, "FiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => item_package_detail_entity_1.ItemPackageDetail, (detail) => detail.ItemPackage, { cascade: true }),
    __metadata("design:type", Array)
], ItemPackage.prototype, "Details", void 0);
exports.ItemPackage = ItemPackage = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'ItemPackages' })
], ItemPackage);
//# sourceMappingURL=item-package.entity.js.map