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
exports.ItemRequestDetail = void 0;
const typeorm_1 = require("typeorm");
const item_request_entity_1 = require("./item-request.entity");
const item_entity_1 = require("./item.entity");
const item_request_tracking_factor_entity_1 = require("./item-request-tracking-factor.entity");
let ItemRequestDetail = class ItemRequestDetail {
};
exports.ItemRequestDetail = ItemRequestDetail;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemRequestDetail.prototype, "ItemRequestDetailID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemRequestDetail.prototype, "ItemRequestRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], ItemRequestDetail.prototype, "RowNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemRequestDetail.prototype, "ItemRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], ItemRequestDetail.prototype, "RequestQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], ItemRequestDetail.prototype, "ApprovedQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], ItemRequestDetail.prototype, "DeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], ItemRequestDetail.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ItemRequestDetail.prototype, "TrackingFactorValues", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_request_entity_1.ItemRequest, (req) => req.details, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemRequestRef' }),
    __metadata("design:type", item_request_entity_1.ItemRequest)
], ItemRequestDetail.prototype, "itemRequest", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_entity_1.Item, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemRef' }),
    __metadata("design:type", item_entity_1.Item)
], ItemRequestDetail.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => item_request_tracking_factor_entity_1.ItemRequestTrackingFactor, (tf) => tf.itemRequestDetail, { cascade: true }),
    __metadata("design:type", Array)
], ItemRequestDetail.prototype, "trackingFactors", void 0);
exports.ItemRequestDetail = ItemRequestDetail = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'ItemRequestDetails' })
], ItemRequestDetail);
//# sourceMappingURL=item-request-detail.entity.js.map