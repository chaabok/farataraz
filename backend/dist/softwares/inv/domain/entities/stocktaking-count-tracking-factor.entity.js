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
exports.StocktakingCountTrackingFactor = void 0;
const typeorm_1 = require("typeorm");
const stocktaking_count_detail_entity_1 = require("./stocktaking-count-detail.entity");
const tracking_factor_entity_1 = require("./tracking-factor.entity");
let StocktakingCountTrackingFactor = class StocktakingCountTrackingFactor {
};
exports.StocktakingCountTrackingFactor = StocktakingCountTrackingFactor;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingCountTrackingFactor.prototype, "StocktakingCountTrackingFactorID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingCountTrackingFactor.prototype, "StocktakingCountDetailRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => stocktaking_count_detail_entity_1.StocktakingCountDetail, (d) => d.trackingFactors, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'StocktakingCountDetailRef' }),
    __metadata("design:type", stocktaking_count_detail_entity_1.StocktakingCountDetail)
], StocktakingCountTrackingFactor.prototype, "countDetail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingCountTrackingFactor.prototype, "TrackingFactorRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tracking_factor_entity_1.TrackingFactor, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'TrackingFactorRef' }),
    __metadata("design:type", tracking_factor_entity_1.TrackingFactor)
], StocktakingCountTrackingFactor.prototype, "trackingFactor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], StocktakingCountTrackingFactor.prototype, "FactorValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], StocktakingCountTrackingFactor.prototype, "CountedQuantity", void 0);
exports.StocktakingCountTrackingFactor = StocktakingCountTrackingFactor = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'StocktakingCountTrackingFactors' })
], StocktakingCountTrackingFactor);
//# sourceMappingURL=stocktaking-count-tracking-factor.entity.js.map