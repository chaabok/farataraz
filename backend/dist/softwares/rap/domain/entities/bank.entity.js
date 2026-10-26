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
exports.Bank = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const bank_type_enum_1 = require("./bank-type.enum");
let Bank = class Bank extends app_base_entity_1.AppBaseEntity {
};
exports.Bank = Bank;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'BankID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], Bank.prototype, "bankId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Code', type: 'bigint', nullable: false, default: 0, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], Bank.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title', type: 'varchar', length: 150, nullable: false }),
    __metadata("design:type", String)
], Bank.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LatinTitle', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], Bank.prototype, "latinTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'BankType', type: 'int', nullable: false, default: bank_type_enum_1.BankType.Government }),
    __metadata("design:type", Number)
], Bank.prototype, "bankType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'SwiftCode', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], Bank.prototype, "swiftCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'NationalityRef', type: 'bigint', nullable: true, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        } }),
    __metadata("design:type", Number)
], Bank.prototype, "nationalityRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Phone', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], Bank.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Website', type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], Bank.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Description', type: 'text', nullable: true }),
    __metadata("design:type", String)
], Bank.prototype, "description", void 0);
exports.Bank = Bank = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'Banks' })
], Bank);
//# sourceMappingURL=bank.entity.js.map