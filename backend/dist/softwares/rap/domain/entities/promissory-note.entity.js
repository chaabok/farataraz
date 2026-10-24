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
exports.PromissoryNote = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const promissory_note_item_entity_1 = require("./promissory-note-item.entity");
const cash_entity_1 = require("./cash.entity");
let PromissoryNote = class PromissoryNote extends app_base_entity_1.AppBaseEntity {
};
exports.PromissoryNote = PromissoryNote;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'PromissoryNoteID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], PromissoryNote.prototype, "promissoryNoteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cash_entity_1.Cash),
    (0, typeorm_1.JoinColumn)({ name: "CashRef", referencedColumnName: "cashId" }),
    __metadata("design:type", cash_entity_1.Cash)
], PromissoryNote.prototype, "cash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "CashRef", type: "bigint", nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], PromissoryNote.prototype, "cashRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "Series", type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", String)
], PromissoryNote.prototype, "series", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "LeafCount", type: "int", nullable: false }),
    __metadata("design:type", Number)
], PromissoryNote.prototype, "leafCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Status', type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PromissoryNote.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "StartSerial", type: "bigint", nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], PromissoryNote.prototype, "startSerial", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "ValueEach", type: "decimal", precision: 18, scale: 2, nullable: false }),
    __metadata("design:type", Number)
], PromissoryNote.prototype, "valueEach", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => promissory_note_item_entity_1.PromissoryNoteItem, (item) => item.promissoryNote, { cascade: ["insert", "update"] }),
    __metadata("design:type", Array)
], PromissoryNote.prototype, "items", void 0);
exports.PromissoryNote = PromissoryNote = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'PromissoryNotes' })
], PromissoryNote);
//# sourceMappingURL=promissory-note.entity.js.map