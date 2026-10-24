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
exports.RapReason = exports.RapReasonNature = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const business_structure_entity_1 = require("../../../common/domain/entities/business-structure.entity");
var RapReasonNature;
(function (RapReasonNature) {
    RapReasonNature[RapReasonNature["SOURCE"] = 1] = "SOURCE";
    RapReasonNature[RapReasonNature["USE"] = 2] = "USE";
    RapReasonNature[RapReasonNature["NEUTRAL"] = 3] = "NEUTRAL";
})(RapReasonNature || (exports.RapReasonNature = RapReasonNature = {}));
let RapReason = class RapReason extends app_base_entity_1.AppBaseEntity {
};
exports.RapReason = RapReason;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], RapReason.prototype, "RapReasonID", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true }),
    __metadata("design:type", String)
], RapReason.prototype, "Code", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], RapReason.prototype, "Title", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], RapReason.prototype, "Title_En", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], RapReason.prototype, "AccountRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: RapReasonNature.NEUTRAL }),
    __metadata("design:type", Number)
], RapReason.prototype, "Nature", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 1000, nullable: true }),
    __metadata("design:type", String)
], RapReason.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], RapReason.prototype, "IsActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], RapReason.prototype, "ParentRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => RapReason, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ParentRef' }),
    __metadata("design:type", RapReason)
], RapReason.prototype, "Parent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => RapReason, reason => reason.Parent),
    __metadata("design:type", Array)
], RapReason.prototype, "Children", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_structure_entity_1.BusinessStructure),
    (0, typeorm_1.JoinColumn)({ name: 'BusinessStructureRef' }),
    __metadata("design:type", business_structure_entity_1.BusinessStructure)
], RapReason.prototype, "BusinessStructure", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => business_structure_entity_1.BusinessStructure),
    (0, typeorm_1.JoinColumn)({ name: 'CompanyRef' }),
    __metadata("design:type", business_structure_entity_1.BusinessStructure)
], RapReason.prototype, "Company", void 0);
exports.RapReason = RapReason = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'Reasons' })
], RapReason);
//# sourceMappingURL=rap-reason.entity.js.map