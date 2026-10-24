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
exports.Cashier = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const cash_entity_1 = require("./cash.entity");
const user_entity_1 = require("../../../../core/iam/entities/user.entity");
let Cashier = class Cashier extends app_base_entity_1.AppBaseEntity {
};
exports.Cashier = Cashier;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'CashierID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], Cashier.prototype, "cashierId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'CashID', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], Cashier.prototype, "cashId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cash_entity_1.Cash, cash => cash.cashiers, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'CashID', referencedColumnName: 'cashId' }),
    __metadata("design:type", cash_entity_1.Cash)
], Cashier.prototype, "cash", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'UserID', type: 'bigint', nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], Cashier.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'UserID', referencedColumnName: 'id' }),
    __metadata("design:type", user_entity_1.User)
], Cashier.prototype, "user", void 0);
exports.Cashier = Cashier = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'Cashiers' })
], Cashier);
//# sourceMappingURL=cashier.entity.js.map