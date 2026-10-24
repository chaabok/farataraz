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
exports.DetailedAccountsNumbering = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let DetailedAccountsNumbering = class DetailedAccountsNumbering extends app_base_entity_1.AppBaseEntity {
};
exports.DetailedAccountsNumbering = DetailedAccountsNumbering;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        name: 'DetailedAccountsNumberingID',
        type: 'bigint',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], DetailedAccountsNumbering.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'DetailedTypesID',
        type: 'bigint',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], DetailedAccountsNumbering.prototype, "detailedTypesId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsHeadquarterSelected', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], DetailedAccountsNumbering.prototype, "isHeadquarterSelected", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsCompanySelected', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], DetailedAccountsNumbering.prototype, "isCompanySelected", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'StartNumber',
        type: 'bigint',
        default: 1,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 1
        }
    }),
    __metadata("design:type", Number)
], DetailedAccountsNumbering.prototype, "startNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'EndNumber',
        type: 'bigint',
        default: 1000,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 1000
        }
    }),
    __metadata("design:type", Number)
], DetailedAccountsNumbering.prototype, "endNumber", void 0);
exports.DetailedAccountsNumbering = DetailedAccountsNumbering = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Gnr', name: 'DetailedAccountsNumbering' })
], DetailedAccountsNumbering);
//# sourceMappingURL=detailed-accounts-numbering.entity.js.map