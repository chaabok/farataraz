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
exports.ServiceRequest = exports.SupplyRequestBaseType = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const service_request_detail_entity_1 = require("./service-request-detail.entity");
var SupplyRequestBaseType;
(function (SupplyRequestBaseType) {
    SupplyRequestBaseType[SupplyRequestBaseType["None"] = 1] = "None";
    SupplyRequestBaseType[SupplyRequestBaseType["InventoryControl"] = 2] = "InventoryControl";
    SupplyRequestBaseType[SupplyRequestBaseType["ItemRequest"] = 3] = "ItemRequest";
})(SupplyRequestBaseType || (exports.SupplyRequestBaseType = SupplyRequestBaseType = {}));
let ServiceRequest = class ServiceRequest extends app_base_entity_1.AppBaseEntity {
};
exports.ServiceRequest = ServiceRequest;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ServiceRequest.prototype, "ServiceRequestID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: SupplyRequestBaseType.None }),
    __metadata("design:type", Number)
], ServiceRequest.prototype, "BaseSource", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ServiceRequest.prototype, "RequestNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Object)
], ServiceRequest.prototype, "RequestDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ServiceRequest.prototype, "Priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], ServiceRequest.prototype, "Status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], ServiceRequest.prototype, "Requester", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ServiceRequest.prototype, "RequesterRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 1000, nullable: true }),
    __metadata("design:type", String)
], ServiceRequest.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint', nullable: true }),
    __metadata("design:type", Number)
], ServiceRequest.prototype, "FiscalYearRef", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => service_request_detail_entity_1.ServiceRequestDetail, (detail) => detail.serviceRequest, { cascade: true }),
    __metadata("design:type", Array)
], ServiceRequest.prototype, "details", void 0);
exports.ServiceRequest = ServiceRequest = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'ServiceRequests' })
], ServiceRequest);
//# sourceMappingURL=service-request.entity.js.map