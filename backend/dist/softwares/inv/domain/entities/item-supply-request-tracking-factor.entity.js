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
exports.ItemSupplyRequestTrackingFactor = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const item_supply_request_detail_entity_1 = require("./item-supply-request-detail.entity");
let ItemSupplyRequestTrackingFactor = class ItemSupplyRequestTrackingFactor extends app_base_entity_1.AppBaseEntity {
};
exports.ItemSupplyRequestTrackingFactor = ItemSupplyRequestTrackingFactor;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemSupplyRequestTrackingFactor.prototype, "ItemSupplyRequestTrackingFactorID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemSupplyRequestTrackingFactor.prototype, "ItemSupplyRequestDetailRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemSupplyRequestTrackingFactor.prototype, "TrackingFactorRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ItemSupplyRequestTrackingFactor.prototype, "TrackingFactorCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], ItemSupplyRequestTrackingFactor.prototype, "TrackingFactorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], ItemSupplyRequestTrackingFactor.prototype, "Quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ItemSupplyRequestTrackingFactor.prototype, "FactorValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ItemSupplyRequestTrackingFactor.prototype, "StartValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ItemSupplyRequestTrackingFactor.prototype, "EndValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ItemSupplyRequestTrackingFactor.prototype, "TrackingFactorValues", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_supply_request_detail_entity_1.ItemSupplyRequestDetail, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemSupplyRequestDetailRef' }),
    __metadata("design:type", item_supply_request_detail_entity_1.ItemSupplyRequestDetail)
], ItemSupplyRequestTrackingFactor.prototype, "itemSupplyRequestDetail", void 0);
exports.ItemSupplyRequestTrackingFactor = ItemSupplyRequestTrackingFactor = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'ItemSupplyRequestTrackingFactors' })
], ItemSupplyRequestTrackingFactor);
//# sourceMappingURL=item-supply-request-tracking-factor.entity.js.map