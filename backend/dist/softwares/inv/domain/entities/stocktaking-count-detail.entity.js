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
exports.StocktakingCountDetail = void 0;
const typeorm_1 = require("typeorm");
const stocktaking_count_entity_1 = require("./stocktaking-count.entity");
const item_entity_1 = require("./item.entity");
const stocktaking_count_tracking_factor_entity_1 = require("./stocktaking-count-tracking-factor.entity");
let StocktakingCountDetail = class StocktakingCountDetail {
};
exports.StocktakingCountDetail = StocktakingCountDetail;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingCountDetail.prototype, "StocktakingCountDetailID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingCountDetail.prototype, "StocktakingCountRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => stocktaking_count_entity_1.StocktakingCount, (c) => c.details, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'StocktakingCountRef' }),
    __metadata("design:type", stocktaking_count_entity_1.StocktakingCount)
], StocktakingCountDetail.prototype, "count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], StocktakingCountDetail.prototype, "RowNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingCountDetail.prototype, "ItemRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_entity_1.Item, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemRef' }),
    __metadata("design:type", item_entity_1.Item)
], StocktakingCountDetail.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], StocktakingCountDetail.prototype, "TagNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], StocktakingCountDetail.prototype, "CountedQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], StocktakingCountDetail.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => stocktaking_count_tracking_factor_entity_1.StocktakingCountTrackingFactor, (tf) => tf.countDetail, { cascade: true }),
    __metadata("design:type", Array)
], StocktakingCountDetail.prototype, "trackingFactors", void 0);
exports.StocktakingCountDetail = StocktakingCountDetail = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'StocktakingCountDetails' })
], StocktakingCountDetail);
//# sourceMappingURL=stocktaking-count-detail.entity.js.map