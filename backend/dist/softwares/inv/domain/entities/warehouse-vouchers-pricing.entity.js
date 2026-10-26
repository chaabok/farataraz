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
exports.WarehouseVouchersPricing = void 0;
const typeorm_1 = require("typeorm");
const item_entity_1 = require("./item.entity");
const pricing_type_enum_1 = require("../enums/pricing-type.enum");
let WarehouseVouchersPricing = class WarehouseVouchersPricing {
};
exports.WarehouseVouchersPricing = WarehouseVouchersPricing;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], WarehouseVouchersPricing.prototype, "WarehouseVouchersPricingID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: pricing_type_enum_1.PricingType.Receipt }),
    __metadata("design:type", Number)
], WarehouseVouchersPricing.prototype, "PricingType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseVouchersPricing.prototype, "WarehouseVoucherRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseVouchersPricing.prototype, "WarehouseVoucherDetailRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseVouchersPricing.prototype, "ItemRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_entity_1.Item, { nullable: true, createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemRef' }),
    __metadata("design:type", item_entity_1.Item)
], WarehouseVouchersPricing.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], WarehouseVouchersPricing.prototype, "UnitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], WarehouseVouchersPricing.prototype, "Additions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], WarehouseVouchersPricing.prototype, "Deductions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], WarehouseVouchersPricing.prototype, "NetPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], WarehouseVouchersPricing.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseVouchersPricing.prototype, "businessStructureRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseVouchersPricing.prototype, "companyRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseVouchersPricing.prototype, "FiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseVouchersPricing.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], WarehouseVouchersPricing.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], WarehouseVouchersPricing.prototype, "lastModifier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], WarehouseVouchersPricing.prototype, "lastModificationTime", void 0);
exports.WarehouseVouchersPricing = WarehouseVouchersPricing = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'WarehouseVouchersPricing' })
], WarehouseVouchersPricing);
//# sourceMappingURL=warehouse-vouchers-pricing.entity.js.map