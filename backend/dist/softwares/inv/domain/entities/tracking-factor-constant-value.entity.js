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
exports.TrackingFactorConstantValue = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const tracking_factor_entity_1 = require("./tracking-factor.entity");
let TrackingFactorConstantValue = class TrackingFactorConstantValue extends app_base_entity_1.AppBaseEntity {
};
exports.TrackingFactorConstantValue = TrackingFactorConstantValue;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], TrackingFactorConstantValue.prototype, "TrackingFactorConstantValueID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], TrackingFactorConstantValue.prototype, "TrackingFactorRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], TrackingFactorConstantValue.prototype, "RowNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: false }),
    __metadata("design:type", String)
], TrackingFactorConstantValue.prototype, "ConstantValue", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tracking_factor_entity_1.TrackingFactor, (tf) => tf.constantValues, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'TrackingFactorRef', referencedColumnName: 'TrackingFactorID' }),
    __metadata("design:type", tracking_factor_entity_1.TrackingFactor)
], TrackingFactorConstantValue.prototype, "trackingFactor", void 0);
exports.TrackingFactorConstantValue = TrackingFactorConstantValue = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'TrackingFactorConstantValue' })
], TrackingFactorConstantValue);
//# sourceMappingURL=tracking-factor-constant-value.entity.js.map