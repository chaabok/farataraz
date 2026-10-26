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
exports.TrackingFactor = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const tracking_factor_item_related_entity_1 = require("./tracking-factor-item-related.entity");
const tracking_factor_constant_value_entity_1 = require("./tracking-factor-constant-value.entity");
let TrackingFactor = class TrackingFactor extends app_base_entity_1.AppBaseEntity {
};
exports.TrackingFactor = TrackingFactor;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], TrackingFactor.prototype, "TrackingFactorID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], TrackingFactor.prototype, "TrackingFactorCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: false }),
    __metadata("design:type", String)
], TrackingFactor.prototype, "TrackingFactorName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], TrackingFactor.prototype, "TrackingFactorName2", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], TrackingFactor.prototype, "TrackingFactorType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], TrackingFactor.prototype, "StartValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 250, nullable: true }),
    __metadata("design:type", String)
], TrackingFactor.prototype, "EndValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], TrackingFactor.prototype, "IsConstantValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], TrackingFactor.prototype, "DisplayPriority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], TrackingFactor.prototype, "IsActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tracking_factor_item_related_entity_1.TrackingFactorItemRelated, (related) => related.trackingFactor, {
        cascade: true,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], TrackingFactor.prototype, "relatedItems", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tracking_factor_constant_value_entity_1.TrackingFactorConstantValue, (cv) => cv.trackingFactor, {
        cascade: true,
        onDelete: 'CASCADE',
    }),
    __metadata("design:type", Array)
], TrackingFactor.prototype, "constantValues", void 0);
exports.TrackingFactor = TrackingFactor = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'TrackingFactors' })
], TrackingFactor);
//# sourceMappingURL=tracking-factor.entity.js.map