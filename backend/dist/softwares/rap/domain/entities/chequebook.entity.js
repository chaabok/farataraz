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
exports.Chequebook = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const bank_account_entity_1 = require("./bank-account.entity");
const chequebook_item_entity_1 = require("./chequebook-item.entity");
let Chequebook = class Chequebook extends app_base_entity_1.AppBaseEntity {
};
exports.Chequebook = Chequebook;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        type: 'bigint',
        name: 'ChequebookID',
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        }
    }),
    __metadata("design:type", Number)
], Chequebook.prototype, "chequebookId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => bank_account_entity_1.BankAccount),
    (0, typeorm_1.JoinColumn)({ name: "BankAccountRef", referencedColumnName: "bankAccountId" }),
    __metadata("design:type", bank_account_entity_1.BankAccount)
], Chequebook.prototype, "bankAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "BankAccountRef", type: "bigint", nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], Chequebook.prototype, "bankAccountRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "Series", type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", String)
], Chequebook.prototype, "series", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "LeafCount", type: "int", nullable: false }),
    __metadata("design:type", Number)
], Chequebook.prototype, "leafCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "StartSerial", type: "bigint", nullable: false, transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : 0
        } }),
    __metadata("design:type", Number)
], Chequebook.prototype, "startSerial", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "IsActive", type: "boolean", default: true }),
    __metadata("design:type", Boolean)
], Chequebook.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => chequebook_item_entity_1.ChequebookItem, (item) => item.chequebook, { cascade: ["insert", "update", "remove"], eager: true }),
    __metadata("design:type", Array)
], Chequebook.prototype, "items", void 0);
exports.Chequebook = Chequebook = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Rap', name: 'Chequebooks' })
], Chequebook);
//# sourceMappingURL=chequebook.entity.js.map