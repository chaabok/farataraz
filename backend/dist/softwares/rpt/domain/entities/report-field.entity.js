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
exports.ReportField = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const report_entity_1 = require("./report.entity");
let ReportField = class ReportField extends app_base_entity_1.AppBaseEntity {
};
exports.ReportField = ReportField;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], ReportField.prototype, "reportFieldID", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReportRef', type: 'bigint', nullable: false }),
    __metadata("design:type", String)
], ReportField.prototype, "reportRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => report_entity_1.Report, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'ReportRef', referencedColumnName: 'reportID' }),
    __metadata("design:type", report_entity_1.Report)
], ReportField.prototype, "reportEntity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], ReportField.prototype, "tableName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], ReportField.prototype, "fieldName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], ReportField.prototype, "alias", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ReportField.prototype, "orderIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true, nullable: true }),
    __metadata("design:type", Boolean)
], ReportField.prototype, "isVisible", void 0);
exports.ReportField = ReportField = __decorate([
    (0, typeorm_1.Entity)({ name: 'ReportField', schema: 'Rpt' })
], ReportField);
//# sourceMappingURL=report-field.entity.js.map