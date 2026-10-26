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
exports.Project = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const detailed_account_entity_1 = require("../../../accounting/domain/entities/detailed-account.entity");
let Project = class Project extends app_base_entity_1.AppBaseEntity {
};
exports.Project = Project;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        name: 'ProjectID',
        type: 'bigint',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], Project.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Code', type: 'varchar', length: 20, nullable: false }),
    __metadata("design:type", String)
], Project.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title', type: 'varchar', length: 200, nullable: false }),
    __metadata("design:type", String)
], Project.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title_En', type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], Project.prototype, "titleEn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountCode', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Project.prototype, "detailedAccountCode", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'DetailedAccountID', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], Project.prototype, "detailedAccountId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => detailed_account_entity_1.DetailedAccount, { eager: true, onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'DetailedAccountID', referencedColumnName: 'detailedAccountId' }),
    __metadata("design:type", detailed_account_entity_1.DetailedAccount)
], Project.prototype, "detailedAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsActive', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Project.prototype, "isActive", void 0);
exports.Project = Project = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Cnt', name: 'Projects' })
], Project);
//# sourceMappingURL=project.entity.js.map