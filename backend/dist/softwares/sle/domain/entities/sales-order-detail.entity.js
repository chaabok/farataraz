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
exports.SalesOrderDetail = void 0;
const typeorm_1 = require("typeorm");
const sales_order_entity_1 = require("./sales-order.entity");
let SalesOrderDetail = class SalesOrderDetail {
};
exports.SalesOrderDetail = SalesOrderDetail;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SalesOrderDetail.prototype, "SalesOrderDetailID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SalesOrderDetail.prototype, "SalesOrderRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sales_order_entity_1.SalesOrder, (so) => so.details, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'SalesOrderRef' }),
    __metadata("design:type", sales_order_entity_1.SalesOrder)
], SalesOrderDetail.prototype, "salesOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], SalesOrderDetail.prototype, "RowNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesOrderDetail.prototype, "ItemRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], SalesOrderDetail.prototype, "UnitName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], SalesOrderDetail.prototype, "UnitType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 1 }),
    __metadata("design:type", Number)
], SalesOrderDetail.prototype, "Quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], SalesOrderDetail.prototype, "UnitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], SalesOrderDetail.prototype, "Discount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], SalesOrderDetail.prototype, "TotalPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], SalesOrderDetail.prototype, "PriceAfterDiscount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], SalesOrderDetail.prototype, "Additions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], SalesOrderDetail.prototype, "NetPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], SalesOrderDetail.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], SalesOrderDetail.prototype, "TrackingFactorValues", void 0);
exports.SalesOrderDetail = SalesOrderDetail = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Sle', name: 'SalesOrderDetails' })
], SalesOrderDetail);
//# sourceMappingURL=sales-order-detail.entity.js.map