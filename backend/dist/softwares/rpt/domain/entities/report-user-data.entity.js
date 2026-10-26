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
exports.ReportUserData = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let ReportUserData = class ReportUserData extends app_base_entity_1.AppBaseEntity {
};
exports.ReportUserData = ReportUserData;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], ReportUserData.prototype, "reportUserDataID", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ReportName', type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], ReportUserData.prototype, "reportName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DynamicKey', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], ReportUserData.prototype, "dynamicKey", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Value', type: 'text', nullable: true }),
    __metadata("design:type", String)
], ReportUserData.prototype, "value", void 0);
exports.ReportUserData = ReportUserData = __decorate([
    (0, typeorm_1.Entity)({ name: 'ReportUserData', schema: 'Rpt' })
], ReportUserData);
//# sourceMappingURL=report-user-data.entity.js.map