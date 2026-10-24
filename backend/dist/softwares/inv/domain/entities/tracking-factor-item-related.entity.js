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
exports.TrackingFactorItemRelated = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const tracking_factor_entity_1 = require("./tracking-factor.entity");
const item_entity_1 = require("./item.entity");
let TrackingFactorItemRelated = class TrackingFactorItemRelated extends app_base_entity_1.AppBaseEntity {
};
exports.TrackingFactorItemRelated = TrackingFactorItemRelated;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], TrackingFactorItemRelated.prototype, "TrackingFactorItemRelatedID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], TrackingFactorItemRelated.prototype, "TrackingFactorRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], TrackingFactorItemRelated.prototype, "ItemRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tracking_factor_entity_1.TrackingFactor, (tf) => tf.relatedItems, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'TrackingFactorRef', referencedColumnName: 'TrackingFactorID' }),
    __metadata("design:type", tracking_factor_entity_1.TrackingFactor)
], TrackingFactorItemRelated.prototype, "trackingFactor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_entity_1.Item, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemRef', referencedColumnName: 'ItemID' }),
    __metadata("design:type", item_entity_1.Item)
], TrackingFactorItemRelated.prototype, "item", void 0);
exports.TrackingFactorItemRelated = TrackingFactorItemRelated = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'TrackingFactorItemRelated' })
], TrackingFactorItemRelated);
//# sourceMappingURL=tracking-factor-item-related.entity.js.map