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
exports.DocumentAccountingInfo = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let DocumentAccountingInfo = class DocumentAccountingInfo extends app_base_entity_1.AppBaseEntity {
};
exports.DocumentAccountingInfo = DocumentAccountingInfo;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'DocumentAccountingInfoID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], DocumentAccountingInfo.prototype, "documentAccountingInfoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DocumentType', type: 'varchar', length: 100, nullable: false }),
    __metadata("design:type", String)
], DocumentAccountingInfo.prototype, "documentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DocumentRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => parseInt(value.toString(), 10)
        } }),
    __metadata("design:type", Number)
], DocumentAccountingInfo.prototype, "documentRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RowType', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], DocumentAccountingInfo.prototype, "rowType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'RowRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => value ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], DocumentAccountingInfo.prototype, "rowRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'OpDetail1Ref', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], DocumentAccountingInfo.prototype, "opDetail1Ref", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'OpDetail2Ref', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], DocumentAccountingInfo.prototype, "opDetail2Ref", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'OpDetail3Ref', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], DocumentAccountingInfo.prototype, "opDetail3Ref", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'OpDetail4Ref', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], DocumentAccountingInfo.prototype, "opDetail4Ref", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'OpDetail5Ref', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], DocumentAccountingInfo.prototype, "opDetail5Ref", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'OpDetail6Ref', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], DocumentAccountingInfo.prototype, "opDetail6Ref", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ForDetail1Ref', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], DocumentAccountingInfo.prototype, "forDetail1Ref", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ForDetail2Ref', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], DocumentAccountingInfo.prototype, "forDetail2Ref", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ForDetail3Ref', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], DocumentAccountingInfo.prototype, "forDetail3Ref", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ForDetail4Ref', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], DocumentAccountingInfo.prototype, "forDetail4Ref", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ForDetail5Ref', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], DocumentAccountingInfo.prototype, "forDetail5Ref", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ForDetail6Ref', type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], DocumentAccountingInfo.prototype, "forDetail6Ref", void 0);
exports.DocumentAccountingInfo = DocumentAccountingInfo = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'DocumentAccountingInfo' })
], DocumentAccountingInfo);
//# sourceMappingURL=document-accounting-info.entity.js.map