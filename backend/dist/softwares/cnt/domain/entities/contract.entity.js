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
exports.Contract = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const detailed_account_entity_1 = require("../../../accounting/domain/entities/detailed-account.entity");
const project_entity_1 = require("./project.entity");
const party_entity_1 = require("../../../common/domain/entities/party.entity");
let Contract = class Contract extends app_base_entity_1.AppBaseEntity {
};
exports.Contract = Contract;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        name: 'ContractID',
        type: 'bigint',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], Contract.prototype, "contractId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DocumentNumber', type: 'varchar', length: 100, nullable: false }),
    __metadata("design:type", String)
], Contract.prototype, "documentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Date', type: 'varchar', length: 20, nullable: false }),
    __metadata("design:type", String)
], Contract.prototype, "date", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'ProjectID', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], Contract.prototype, "projectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.Project, { eager: true, nullable: true, onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'ProjectID', referencedColumnName: 'projectId' }),
    __metadata("design:type", project_entity_1.Project)
], Contract.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'WorkLocation', type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "workLocation", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'PartyID', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], Contract.prototype, "partyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => party_entity_1.Party, { eager: true, onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'PartyID', referencedColumnName: 'partyId' }),
    __metadata("design:type", party_entity_1.Party)
], Contract.prototype, "party", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountCode', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "detailedAccountCode", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: 'DetailedAccountID', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], Contract.prototype, "detailedAccountId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => detailed_account_entity_1.DetailedAccount, { eager: true, onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'DetailedAccountID', referencedColumnName: 'detailedAccountId' }),
    __metadata("design:type", detailed_account_entity_1.DetailedAccount)
], Contract.prototype, "detailedAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Subject1', type: 'varchar', length: 200, nullable: false }),
    __metadata("design:type", String)
], Contract.prototype, "subject1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Subject2', type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "subject2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountTitle', type: 'varchar', length: 200, nullable: false }),
    __metadata("design:type", String)
], Contract.prototype, "detailedAccountTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedAccountTitle2', type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "detailedAccountTitle2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'StartDate', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'EndDate', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DurationDays', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Contract.prototype, "durationDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Amount', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], Contract.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description1', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "description1", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description2', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Contract.prototype, "description2", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsActive', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Contract.prototype, "isActive", void 0);
exports.Contract = Contract = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Cnt', name: 'Contracts' })
], Contract);
//# sourceMappingURL=contract.entity.js.map