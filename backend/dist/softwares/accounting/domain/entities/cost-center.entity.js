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
exports.CostCenter = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const detailed_account_entity_1 = require("./detailed-account.entity");
const cost_center_enum_1 = require("./cost-center.enum");
let CostCenter = class CostCenter extends app_base_entity_1.AppBaseEntity {
};
exports.CostCenter = CostCenter;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'CostCenterID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], CostCenter.prototype, "costCenterId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Code', type: 'varchar', length: 20, nullable: false }),
    __metadata("design:type", String)
], CostCenter.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title', type: 'varchar', length: 100, nullable: false }),
    __metadata("design:type", String)
], CostCenter.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title_En', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], CostCenter.prototype, "title_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CostCenterType', type: 'int', enum: cost_center_enum_1.CostCenterType, nullable: false }),
    __metadata("design:type", Number)
], CostCenter.prototype, "costCenterType", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'DetailedAccountID', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], CostCenter.prototype, "detailedAccountId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => detailed_account_entity_1.DetailedAccount, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'DetailedAccountID' }),
    __metadata("design:type", detailed_account_entity_1.DetailedAccount)
], CostCenter.prototype, "detailedAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'isActive', type: 'boolean', default: true, nullable: false }),
    __metadata("design:type", Boolean)
], CostCenter.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], CostCenter.prototype, "description", void 0);
exports.CostCenter = CostCenter = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Acc', name: 'CostCenter' }),
    (0, typeorm_1.Check)('length("Code") > 0')
], CostCenter);
//# sourceMappingURL=cost-center.entity.js.map