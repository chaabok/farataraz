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
exports.DetailedAccount = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const detailed_type_entity_1 = require("./detailed-type.entity");
let DetailedAccount = class DetailedAccount extends app_base_entity_1.AppBaseEntity {
};
exports.DetailedAccount = DetailedAccount;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'DetailedAccountID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], DetailedAccount.prototype, "detailedAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Code', type: 'varchar', length: 20, nullable: false }),
    __metadata("design:type", String)
], DetailedAccount.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title', type: 'varchar', length: 100, nullable: false }),
    __metadata("design:type", String)
], DetailedAccount.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title_En', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], DetailedAccount.prototype, "title_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'DetailedTypesID', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], DetailedAccount.prototype, "detailedTypesId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => detailed_type_entity_1.DetailedType, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'DetailedTypesID' }),
    __metadata("design:type", detailed_type_entity_1.DetailedType)
], DetailedAccount.prototype, "detailedType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], DetailedAccount.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'isActive', type: 'boolean', default: true, nullable: false }),
    __metadata("design:type", Boolean)
], DetailedAccount.prototype, "isActive", void 0);
exports.DetailedAccount = DetailedAccount = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Acc', name: 'DetailedAccounts' }),
    (0, typeorm_1.Check)('length("Code") > 0')
], DetailedAccount);
//# sourceMappingURL=detailed-account.entity.js.map