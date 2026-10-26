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
exports.ServiceRequestDetail = void 0;
const typeorm_1 = require("typeorm");
const service_request_entity_1 = require("./service-request.entity");
const item_entity_1 = require("./item.entity");
let ServiceRequestDetail = class ServiceRequestDetail {
};
exports.ServiceRequestDetail = ServiceRequestDetail;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ServiceRequestDetail.prototype, "ServiceRequestDetailID", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ServiceRequestDetail.prototype, "ServiceRequestRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], ServiceRequestDetail.prototype, "RowNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], ServiceRequestDetail.prototype, "ItemRef", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], ServiceRequestDetail.prototype, "RequestQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 4, default: 0 }),
    __metadata("design:type", Number)
], ServiceRequestDetail.prototype, "ApprovedQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], ServiceRequestDetail.prototype, "DeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], ServiceRequestDetail.prototype, "Description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_request_entity_1.ServiceRequest, (req) => req.details, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'ServiceRequestRef' }),
    __metadata("design:type", service_request_entity_1.ServiceRequest)
], ServiceRequestDetail.prototype, "serviceRequest", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => item_entity_1.Item, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'ItemRef' }),
    __metadata("design:type", item_entity_1.Item)
], ServiceRequestDetail.prototype, "item", void 0);
exports.ServiceRequestDetail = ServiceRequestDetail = __decorate([
    (0, typeorm_1.Entity)({ schema: 'Inv', name: 'ServiceRequestDetails' })
], ServiceRequestDetail);
//# sourceMappingURL=service-request-detail.entity.js.map