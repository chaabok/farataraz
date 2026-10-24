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
exports.ChequePrintTemplate = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let ChequePrintTemplate = class ChequePrintTemplate extends app_base_entity_1.AppBaseEntity {
};
exports.ChequePrintTemplate = ChequePrintTemplate;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'ChequePrintTemplateID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], ChequePrintTemplate.prototype, "chequePrintTemplateId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BankRef', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], ChequePrintTemplate.prototype, "bankRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title', type: 'varchar', length: 150, nullable: false }),
    __metadata("design:type", String)
], ChequePrintTemplate.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ImageBlob', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ChequePrintTemplate.prototype, "imageBlob", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Config', type: 'jsonb', nullable: false, default: {} }),
    __metadata("design:type", Object)
], ChequePrintTemplate.prototype, "config", void 0);
exports.ChequePrintTemplate = ChequePrintTemplate = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'ChequePrintTemplates' })
], ChequePrintTemplate);
//# sourceMappingURL=cheque-print-template.entity.js.map