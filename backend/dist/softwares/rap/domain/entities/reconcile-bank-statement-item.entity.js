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
exports.ReconcileBankStatementItem = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const reconcile_bank_statement_entity_1 = require("./reconcile-bank-statement.entity");
let ReconcileBankStatementItem = class ReconcileBankStatementItem extends app_base_entity_1.AppBaseEntity {
};
exports.ReconcileBankStatementItem = ReconcileBankStatementItem;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ReconcileBankStatementItem.prototype, "ReconcileBankStatementItemID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ReconcileBankStatementItem.prototype, "ReconcileBankStatementRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => reconcile_bank_statement_entity_1.ReconcileBankStatement, statement => statement.items, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ReconcileBankStatementRef' }),
    __metadata("design:type", reconcile_bank_statement_entity_1.ReconcileBankStatement)
], ReconcileBankStatementItem.prototype, "statement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], ReconcileBankStatementItem.prototype, "documentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], ReconcileBankStatementItem.prototype, "documentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, nullable: true, default: 0 }),
    __metadata("design:type", Number)
], ReconcileBankStatementItem.prototype, "debit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, nullable: true, default: 0 }),
    __metadata("design:type", Number)
], ReconcileBankStatementItem.prototype, "credit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ReconcileBankStatementItem.prototype, "description", void 0);
exports.ReconcileBankStatementItem = ReconcileBankStatementItem = __decorate([
    (0, typeorm_1.Entity)('ReconcileBankStatementItem', { schema: 'Rap' })
], ReconcileBankStatementItem);
//# sourceMappingURL=reconcile-bank-statement-item.entity.js.map