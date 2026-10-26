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
exports.ReportFormula = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const report_entity_1 = require("./report.entity");
let ReportFormula = class ReportFormula extends app_base_entity_1.AppBaseEntity {
};
exports.ReportFormula = ReportFormula;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], ReportFormula.prototype, "reportFormulaID", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReportRef', type: 'bigint', nullable: false }),
    __metadata("design:type", String)
], ReportFormula.prototype, "reportRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => report_entity_1.Report, { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'ReportRef', referencedColumnName: 'reportID' }),
    __metadata("design:type", report_entity_1.Report)
], ReportFormula.prototype, "reportEntity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], ReportFormula.prototype, "formulaName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ReportFormula.prototype, "expression", void 0);
exports.ReportFormula = ReportFormula = __decorate([
    (0, typeorm_1.Entity)({ name: 'ReportFormula', schema: 'Rpt' })
], ReportFormula);
//# sourceMappingURL=report-formula.entity.js.map