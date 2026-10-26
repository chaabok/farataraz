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
exports.ReportTemplate = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let ReportTemplate = class ReportTemplate extends app_base_entity_1.AppBaseEntity {
};
exports.ReportTemplate = ReportTemplate;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'ReportTemplateID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], ReportTemplate.prototype, "reportTemplateID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, name: 'Title' }),
    __metadata("design:type", String)
], ReportTemplate.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, name: 'Category', nullable: true }),
    __metadata("design:type", String)
], ReportTemplate.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', name: 'IsLocked', default: false }),
    __metadata("design:type", Boolean)
], ReportTemplate.prototype, "isLocked", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, name: 'UnlockPrice', default: 0 }),
    __metadata("design:type", Number)
], ReportTemplate.prototype, "unlockPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'LayoutConfig', nullable: true }),
    __metadata("design:type", String)
], ReportTemplate.prototype, "layoutConfig", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', name: 'QuerySql', nullable: true }),
    __metadata("design:type", String)
], ReportTemplate.prototype, "querySql", void 0);
exports.ReportTemplate = ReportTemplate = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Gnr', name: 'ReportTemplate' })
], ReportTemplate);
//# sourceMappingURL=report-template.entity.js.map