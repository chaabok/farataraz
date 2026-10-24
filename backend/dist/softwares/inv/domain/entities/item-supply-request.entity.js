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
exports.ItemSupplyRequest = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const item_supply_request_detail_entity_1 = require("./item-supply-request-detail.entity");
const detailed_account_entity_1 = require("../../../accounting/domain/entities/detailed-account.entity");
let ItemSupplyRequest = class ItemSupplyRequest extends app_base_entity_1.AppBaseEntity {
};
exports.ItemSupplyRequest = ItemSupplyRequest;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemSupplyRequest.prototype, "ItemSupplyRequestID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ItemSupplyRequest.prototype, "BasisType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ItemSupplyRequest.prototype, "RequestNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], ItemSupplyRequest.prototype, "RequestDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1, nullable: true }),
    __metadata("design:type", Number)
], ItemSupplyRequest.prototype, "RequestType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ItemSupplyRequest.prototype, "Priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ItemSupplyRequest.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], ItemSupplyRequest.prototype, "Requester", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemSupplyRequest.prototype, "RequesterRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => detailed_account_entity_1.DetailedAccount, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'RequesterRef' }),
    __metadata("design:type", detailed_account_entity_1.DetailedAccount)
], ItemSupplyRequest.prototype, "requesterAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemSupplyRequest.prototype, "WarehouseRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", String)
], ItemSupplyRequest.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ItemSupplyRequest.prototype, "FiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => item_supply_request_detail_entity_1.ItemSupplyRequestDetail, (detail) => detail.itemSupplyRequest, { cascade: true }),
    __metadata("design:type", Array)
], ItemSupplyRequest.prototype, "details", void 0);
exports.ItemSupplyRequest = ItemSupplyRequest = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'ItemSupplyRequests' })
], ItemSupplyRequest);
//# sourceMappingURL=item-supply-request.entity.js.map