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
exports.PromissoryNoteItem = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const promissory_note_entity_1 = require("./promissory-note.entity");
let PromissoryNoteItem = class PromissoryNoteItem extends app_base_entity_1.AppBaseEntity {
};
exports.PromissoryNoteItem = PromissoryNoteItem;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'PromissoryNoteItemID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PromissoryNoteItem.prototype, "promissoryNoteItemId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => promissory_note_entity_1.PromissoryNote, (note) => note.items),
    (0, typeorm_1.JoinColumn)({ name: "PromissoryNoteRef", referencedColumnName: "promissoryNoteId" }),
    __metadata("design:type", promissory_note_entity_1.PromissoryNote)
], PromissoryNoteItem.prototype, "promissoryNote", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "PromissoryNoteRef", type: "bigint", nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], PromissoryNoteItem.prototype, "promissoryNoteRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "PromissoryNoteNumber", type: "bigint", nullable: false }),
    __metadata("design:type", Number)
], PromissoryNoteItem.prototype, "promissoryNoteNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "Value", type: "decimal", precision: 18, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], PromissoryNoteItem.prototype, "value", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "Status", type: "int", default: 1 }),
    __metadata("design:type", Number)
], PromissoryNoteItem.prototype, "status", void 0);
exports.PromissoryNoteItem = PromissoryNoteItem = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'PromissoryNoteItems' })
], PromissoryNoteItem);
//# sourceMappingURL=promissory-note-item.entity.js.map