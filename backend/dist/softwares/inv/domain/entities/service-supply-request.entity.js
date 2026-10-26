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
exports.ServiceSupplyRequest = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const service_supply_request_detail_entity_1 = require("./service-supply-request-detail.entity");
const detailed_account_entity_1 = require("../../../accounting/domain/entities/detailed-account.entity");
let ServiceSupplyRequest = class ServiceSupplyRequest extends app_base_entity_1.AppBaseEntity {
};
exports.ServiceSupplyRequest = ServiceSupplyRequest;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ServiceSupplyRequest.prototype, "ServiceSupplyRequestID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ServiceSupplyRequest.prototype, "BasisType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ServiceSupplyRequest.prototype, "RequestNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], ServiceSupplyRequest.prototype, "RequestDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1, nullable: true }),
    __metadata("design:type", Number)
], ServiceSupplyRequest.prototype, "RequestType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ServiceSupplyRequest.prototype, "Priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ServiceSupplyRequest.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], ServiceSupplyRequest.prototype, "Requester", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ServiceSupplyRequest.prototype, "RequesterRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => detailed_account_entity_1.DetailedAccount, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'RequesterRef' }),
    __metadata("design:type", detailed_account_entity_1.DetailedAccount)
], ServiceSupplyRequest.prototype, "requesterAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ServiceSupplyRequest.prototype, "WarehouseRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", String)
], ServiceSupplyRequest.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ServiceSupplyRequest.prototype, "FiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => service_supply_request_detail_entity_1.ServiceSupplyRequestDetail, (detail) => detail.serviceSupplyRequest, { cascade: true }),
    __metadata("design:type", Array)
], ServiceSupplyRequest.prototype, "details", void 0);
exports.ServiceSupplyRequest = ServiceSupplyRequest = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'ServiceSupplyRequests' })
], ServiceSupplyRequest);
//# sourceMappingURL=service-supply-request.entity.js.map