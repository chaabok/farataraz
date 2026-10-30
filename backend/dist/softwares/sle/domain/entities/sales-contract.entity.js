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
exports.SalesContract = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const sales_contract_item_entity_1 = require("./sales-contract-item.entity");
const sales_contract_factor_entity_1 = require("./sales-contract-factor.entity");
let SalesContract = class SalesContract extends app_base_entity_1.AppBaseEntity {
};
exports.SalesContract = SalesContract;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], SalesContract.prototype, "SalesContractID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], SalesContract.prototype, "ContractNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], SalesContract.prototype, "DocumentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], SalesContract.prototype, "ContractDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesContract.prototype, "CustomerRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], SalesContract.prototype, "CustomerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesContract.prototype, "SalesTypeRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesContract.prototype, "SalesCenterRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesContract.prototype, "DeliveryLocationRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesContract.prototype, "SettlementMethodRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], SalesContract.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", String)
], SalesContract.prototype, "ContractSubject", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], SalesContract.prototype, "BaseDocumentTypeRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesContract.prototype, "BaseDocumentRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], SalesContract.prototype, "FiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => sales_contract_item_entity_1.SalesContractItem, (item) => item.salesContract, { cascade: true }),
    __metadata("design:type", Array)
], SalesContract.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => sales_contract_factor_entity_1.SalesContractFactor, (factor) => factor.salesContract, { cascade: true }),
    __metadata("design:type", Array)
], SalesContract.prototype, "factors", void 0);
exports.SalesContract = SalesContract = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Sle', name: 'SalesContracts' })
], SalesContract);
//# sourceMappingURL=sales-contract.entity.js.map