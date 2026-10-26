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
exports.StocktakingTagDetail = void 0;
const typeorm_1 = require("typeorm");
const stocktaking_tag_header_entity_1 = require("./stocktaking-tag-header.entity");
const warehouse_entity_1 = require("./warehouse.entity");
const item_entity_1 = require("./item.entity");
let StocktakingTagDetail = class StocktakingTagDetail {
};
exports.StocktakingTagDetail = StocktakingTagDetail;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingTagDetail.prototype, "StocktakingTagDetailID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingTagDetail.prototype, "StocktakingTagHeaderRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => stocktaking_tag_header_entity_1.StocktakingTagHeader, (h) => h.details, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'StocktakingTagHeaderRef' }),
    __metadata("design:type", stocktaking_tag_header_entity_1.StocktakingTagHeader)
], StocktakingTagDetail.prototype, "header", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingTagDetail.prototype, "WarehouseRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => warehouse_entity_1.Warehouse, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'WarehouseRef' }),
    __metadata("design:type", warehouse_entity_1.Warehouse)
], StocktakingTagDetail.prototype, "warehouse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingTagDetail.prototype, "ItemRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_entity_1.Item, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemRef' }),
    __metadata("design:type", item_entity_1.Item)
], StocktakingTagDetail.prototype, "item", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], StocktakingTagDetail.prototype, "TagNumber", void 0);
exports.StocktakingTagDetail = StocktakingTagDetail = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'StocktakingTagDetails' })
], StocktakingTagDetail);
//# sourceMappingURL=stocktaking-tag-detail.entity.js.map