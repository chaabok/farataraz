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
exports.BusinessStructure = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const business_structure_enum_1 = require("./business-structure.enum");
let BusinessStructure = class BusinessStructure extends app_base_entity_1.AppBaseEntity {
};
exports.BusinessStructure = BusinessStructure;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'BusinessStructureID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], BusinessStructure.prototype, "businessStructureId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'ParentRef',
        type: 'bigint',
        nullable: false,
        default: 0,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], BusinessStructure.prototype, "parentRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Code', type: 'varchar', length: 100, nullable: false }),
    __metadata("design:type", String)
], BusinessStructure.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title', type: 'varchar', length: 255, nullable: false }),
    __metadata("design:type", String)
], BusinessStructure.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title_En', type: 'varchar', length: 255, nullable: false }),
    __metadata("design:type", String)
], BusinessStructure.prototype, "title_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BusinessStructure', type: 'int', nullable: false }),
    __metadata("design:type", Number)
], BusinessStructure.prototype, "businessStructure", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BusinessStructureName', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], BusinessStructure.prototype, "businessStructureName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Manager', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], BusinessStructure.prototype, "manager", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsActive', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], BusinessStructure.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsSystem', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], BusinessStructure.prototype, "isSystem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LogoUrl', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BusinessStructure.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsBasicInfoShared', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], BusinessStructure.prototype, "isBasicInfoShared", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ActiveStructureTypes', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], BusinessStructure.prototype, "activeStructureTypes", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('BusinessStructure', { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'BusinessStructureRef', referencedColumnName: 'businessStructureId' }),
    __metadata("design:type", Object)
], BusinessStructure.prototype, "businessStructureEntity", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('BusinessStructure', { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'CompanyRef', referencedColumnName: 'businessStructureId' }),
    __metadata("design:type", Object)
], BusinessStructure.prototype, "companyEntity", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('BusinessStructure', { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'BranchRef', referencedColumnName: 'businessStructureId' }),
    __metadata("design:type", Object)
], BusinessStructure.prototype, "branchEntity", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('BusinessStructure', { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'AgencyRef', referencedColumnName: 'businessStructureId' }),
    __metadata("design:type", Object)
], BusinessStructure.prototype, "agencyEntity", void 0);
exports.BusinessStructure = BusinessStructure = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Gnr', name: 'BusinessStructure' })
], BusinessStructure);
//# sourceMappingURL=business-structure.entity.js.map