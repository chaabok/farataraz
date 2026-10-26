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
exports.PaidDocumentClearingItem = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const paid_document_clearing_entity_1 = require("./paid-document-clearing.entity");
let PaidDocumentClearingItem = class PaidDocumentClearingItem extends app_base_entity_1.AppBaseEntity {
};
exports.PaidDocumentClearingItem = PaidDocumentClearingItem;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'PaidDocumentClearingItemID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PaidDocumentClearingItem.prototype, "paidDocumentClearingItemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'PaidDocumentClearingRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PaidDocumentClearingItem.prototype, "paidDocumentClearingRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => paid_document_clearing_entity_1.PaidDocumentClearing, p => p.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'PaidDocumentClearingRef', referencedColumnName: 'paidDocumentClearingId' }),
    __metadata("design:type", paid_document_clearing_entity_1.PaidDocumentClearing)
], PaidDocumentClearingItem.prototype, "paidDocumentClearing", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DocumentType', type: 'varchar', length: 50, nullable: false }),
    __metadata("design:type", String)
], PaidDocumentClearingItem.prototype, "documentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DocumentId', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], PaidDocumentClearingItem.prototype, "documentId", void 0);
exports.PaidDocumentClearingItem = PaidDocumentClearingItem = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'PaidDocumentClearingItem' })
], PaidDocumentClearingItem);
//# sourceMappingURL=paid-document-clearing-item.entity.js.map