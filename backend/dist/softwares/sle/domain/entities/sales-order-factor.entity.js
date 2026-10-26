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
exports.SalesOrderFactor = void 0;
const typeorm_1 = require("typeorm");
const sales_order_entity_1 = require("./sales-order.entity");
let SalesOrderFactor = class SalesOrderFactor {
};
exports.SalesOrderFactor = SalesOrderFactor;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SalesOrderFactor.prototype, "SalesOrderFactorID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SalesOrderFactor.prototype, "SalesOrderRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sales_order_entity_1.SalesOrder, (order) => order.factors, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'SalesOrderRef' }),
    __metadata("design:type", sales_order_entity_1.SalesOrder)
], SalesOrderFactor.prototype, "salesOrder", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], SalesOrderFactor.prototype, "RowNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], SalesOrderFactor.prototype, "FactorTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], SalesOrderFactor.prototype, "FactorType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], SalesOrderFactor.prototype, "Amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], SalesOrderFactor.prototype, "Description", void 0);
exports.SalesOrderFactor = SalesOrderFactor = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Sle', name: 'SalesOrderFactors' })
], SalesOrderFactor);
//# sourceMappingURL=sales-order-factor.entity.js.map