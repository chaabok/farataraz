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
exports.SalesOrder = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const sales_order_item_entity_1 = require("./sales-order-item.entity");
let SalesOrder = class SalesOrder extends app_base_entity_1.AppBaseEntity {
};
exports.SalesOrder = SalesOrder;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SalesOrder.prototype, "SalesOrderID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SalesOrder.prototype, "OrderNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], SalesOrder.prototype, "OrderDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], SalesOrder.prototype, "DeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesOrder.prototype, "CustomerRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], SalesOrder.prototype, "CustomerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesOrder.prototype, "SalesTypeRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesOrder.prototype, "DeliveryLocationRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesOrder.prototype, "SettlementMethodRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], SalesOrder.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", String)
], SalesOrder.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesOrder.prototype, "FiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => sales_order_item_entity_1.SalesOrderItem, (item) => item.salesOrder, { cascade: true }),
    __metadata("design:type", Array)
], SalesOrder.prototype, "items", void 0);
exports.SalesOrder = SalesOrder = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Sle', name: 'SalesOrders' })
], SalesOrder);
//# sourceMappingURL=sales-order.entity.js.map