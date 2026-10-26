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
exports.StocktakingTagHeader = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const stocktaking_setting_entity_1 = require("./stocktaking-setting.entity");
const party_entity_1 = require("../../../common/domain/entities/party.entity");
const stocktaking_tag_detail_entity_1 = require("./stocktaking-tag-detail.entity");
let StocktakingTagHeader = class StocktakingTagHeader extends app_base_entity_1.AppBaseEntity {
};
exports.StocktakingTagHeader = StocktakingTagHeader;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingTagHeader.prototype, "StocktakingTagHeaderID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], StocktakingTagHeader.prototype, "StocktakingPeriod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingTagHeader.prototype, "StocktakingSettingRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => stocktaking_setting_entity_1.StocktakingSetting, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'StocktakingSettingRef' }),
    __metadata("design:type", stocktaking_setting_entity_1.StocktakingSetting)
], StocktakingTagHeader.prototype, "stocktakingSetting", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], StocktakingTagHeader.prototype, "StocktakingDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], StocktakingTagHeader.prototype, "StocktakingNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], StocktakingTagHeader.prototype, "OfficerPartyRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StocktakingTagHeader.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], StocktakingTagHeader.prototype, "FiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => party_entity_1.Party, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'OfficerPartyRef' }),
    __metadata("design:type", party_entity_1.Party)
], StocktakingTagHeader.prototype, "officerParty", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => stocktaking_tag_detail_entity_1.StocktakingTagDetail, (d) => d.header, { cascade: true }),
    __metadata("design:type", Array)
], StocktakingTagHeader.prototype, "details", void 0);
exports.StocktakingTagHeader = StocktakingTagHeader = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'StocktakingTagHeaders' })
], StocktakingTagHeader);
//# sourceMappingURL=stocktaking-tag-header.entity.js.map