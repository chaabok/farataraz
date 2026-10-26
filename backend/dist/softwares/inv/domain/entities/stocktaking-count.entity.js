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
exports.StocktakingCount = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const stocktaking_tag_header_entity_1 = require("./stocktaking-tag-header.entity");
const warehouse_entity_1 = require("./warehouse.entity");
const stocktaking_count_detail_entity_1 = require("./stocktaking-count-detail.entity");
let StocktakingCount = class StocktakingCount extends app_base_entity_1.AppBaseEntity {
};
exports.StocktakingCount = StocktakingCount;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingCount.prototype, "StocktakingCountID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingCount.prototype, "StocktakingTagHeaderRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => stocktaking_tag_header_entity_1.StocktakingTagHeader, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'StocktakingTagHeaderRef' }),
    __metadata("design:type", stocktaking_tag_header_entity_1.StocktakingTagHeader)
], StocktakingCount.prototype, "tagHeader", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingCount.prototype, "WarehouseRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_entity_1.Warehouse, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'WarehouseRef' }),
    __metadata("design:type", warehouse_entity_1.Warehouse)
], StocktakingCount.prototype, "warehouse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], StocktakingCount.prototype, "StocktakingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingCount.prototype, "StocktakingNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], StocktakingCount.prototype, "CountRound", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], StocktakingCount.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], StocktakingCount.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], StocktakingCount.prototype, "FiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => stocktaking_count_detail_entity_1.StocktakingCountDetail, (d) => d.count, { cascade: true }),
    __metadata("design:type", Array)
], StocktakingCount.prototype, "details", void 0);
exports.StocktakingCount = StocktakingCount = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'StocktakingCounts' })
], StocktakingCount);
//# sourceMappingURL=stocktaking-count.entity.js.map