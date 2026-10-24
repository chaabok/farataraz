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
exports.AppBaseEntity = void 0;
const typeorm_1 = require("typeorm");
class AppBaseEntity {
    setCreateTime() {
        const now = new Date();
        const timeString = now.toTimeString().split(' ')[0];
        this.createTime = timeString;
        this.lastModificationTime = timeString;
    }
    setUpdateTime() {
        const now = new Date();
        this.lastModificationTime = now.toTimeString().split(' ')[0];
    }
}
exports.AppBaseEntity = AppBaseEntity;
__decorate([
    (0, typeorm_1.VersionColumn)({
        name: 'Version',
        type: 'bigint',
        default: 1,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 1
        }
    }),
    __metadata("design:type", Number)
], AppBaseEntity.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'Creator',
        type: 'bigint',
        nullable: false,
        default: 1,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 1
        }
    }),
    __metadata("design:type", Number)
], AppBaseEntity.prototype, "creator", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'CreationDate', nullable: false }),
    __metadata("design:type", Date)
], AppBaseEntity.prototype, "creationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CreateTime', type: 'varchar', length: 8, nullable: false, default: '00:00:00' }),
    __metadata("design:type", String)
], AppBaseEntity.prototype, "createTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'LastModifier',
        type: 'bigint',
        nullable: false,
        default: 1,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 1
        }
    }),
    __metadata("design:type", Number)
], AppBaseEntity.prototype, "lastModifier", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'LastModificationDate', nullable: false }),
    __metadata("design:type", Date)
], AppBaseEntity.prototype, "lastModificationDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LastModificationTime', type: 'varchar', length: 8, nullable: false, default: '00:00:00' }),
    __metadata("design:type", String)
], AppBaseEntity.prototype, "lastModificationTime", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'BusinessStructureRef',
        type: 'bigint',
        nullable: false,
        default: 2,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 2
        }
    }),
    __metadata("design:type", Number)
], AppBaseEntity.prototype, "businessStructureRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('BusinessStructure', { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'BusinessStructureRef', referencedColumnName: 'businessStructureId' }),
    __metadata("design:type", Object)
], AppBaseEntity.prototype, "businessStructureEntity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'CompanyRef',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        }
    }),
    __metadata("design:type", Number)
], AppBaseEntity.prototype, "companyRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('BusinessStructure', { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'CompanyRef', referencedColumnName: 'businessStructureId' }),
    __metadata("design:type", Object)
], AppBaseEntity.prototype, "companyEntity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'BranchRef',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        }
    }),
    __metadata("design:type", Number)
], AppBaseEntity.prototype, "branchRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('BusinessStructure', { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'BranchRef', referencedColumnName: 'businessStructureId' }),
    __metadata("design:type", Object)
], AppBaseEntity.prototype, "branchEntity", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'AgencyRef',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        }
    }),
    __metadata("design:type", Number)
], AppBaseEntity.prototype, "agencyRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)('BusinessStructure', { createForeignKeyConstraints: false }),
    (0, typeorm_1.JoinColumn)({ name: 'AgencyRef', referencedColumnName: 'businessStructureId' }),
    __metadata("design:type", Object)
], AppBaseEntity.prototype, "agencyEntity", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppBaseEntity.prototype, "setCreateTime", null);
__decorate([
    (0, typeorm_1.BeforeUpdate)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppBaseEntity.prototype, "setUpdateTime", null);
//# sourceMappingURL=app-base.entity.js.map