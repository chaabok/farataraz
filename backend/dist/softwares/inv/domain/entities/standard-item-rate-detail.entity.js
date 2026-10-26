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
exports.StandardItemRateDetail = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let StandardItemRateDetail = class StandardItemRateDetail extends app_base_entity_1.AppBaseEntity {
};
exports.StandardItemRateDetail = StandardItemRateDetail;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StandardItemRateDetail.prototype, "StandardItemRateDetailID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StandardItemRateDetail.prototype, "StandardItemRateRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StandardItemRateDetail.prototype, "ItemRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], StandardItemRateDetail.prototype, "UnitRate", void 0);
exports.StandardItemRateDetail = StandardItemRateDetail = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'StandardItemRateDetails' })
], StandardItemRateDetail);
//# sourceMappingURL=standard-item-rate-detail.entity.js.map