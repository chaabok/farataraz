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
exports.BankAccountType = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
let BankAccountType = class BankAccountType extends app_base_entity_1.AppBaseEntity {
};
exports.BankAccountType = BankAccountType;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'BankAccountTypeID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], BankAccountType.prototype, "bankAccountTypeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Code', type: 'bigint', nullable: false, default: 0, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], BankAccountType.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title', type: 'varchar', length: 150, nullable: false }),
    __metadata("design:type", String)
], BankAccountType.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'LatinTitle', type: 'varchar', length: 150, nullable: true }),
    __metadata("design:type", String)
], BankAccountType.prototype, "latinTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'IsActive', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], BankAccountType.prototype, "isActive", void 0);
exports.BankAccountType = BankAccountType = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'BankAccountTypes' })
], BankAccountType);
//# sourceMappingURL=bank-account-type.entity.js.map