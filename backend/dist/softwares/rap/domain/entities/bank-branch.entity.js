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
exports.BankBranch = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const bank_entity_1 = require("./bank.entity");
const geo_location_entity_1 = require("../../../common/domain/entities/geo-location.entity");
let BankBranch = class BankBranch extends app_base_entity_1.AppBaseEntity {
};
exports.BankBranch = BankBranch;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'BankBranchID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], BankBranch.prototype, "bankBranchId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BankID', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], BankBranch.prototype, "bankId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_entity_1.Bank, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'BankID', referencedColumnName: 'bankId' }),
    __metadata("design:type", bank_entity_1.Bank)
], BankBranch.prototype, "bank", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BranchCode', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], BankBranch.prototype, "branchCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title', type: 'varchar', length: 150, nullable: false }),
    __metadata("design:type", String)
], BankBranch.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LatinTitle', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], BankBranch.prototype, "latinTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CityRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], BankBranch.prototype, "cityRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => geo_location_entity_1.GeoLocation, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'CityRef', referencedColumnName: 'geolocationId' }),
    __metadata("design:type", geo_location_entity_1.GeoLocation)
], BankBranch.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Phone', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], BankBranch.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Address', type: 'text', nullable: true }),
    __metadata("design:type", String)
], BankBranch.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ContactName', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], BankBranch.prototype, "contactName", void 0);
exports.BankBranch = BankBranch = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'BankBranchs' })
], BankBranch);
//# sourceMappingURL=bank-branch.entity.js.map