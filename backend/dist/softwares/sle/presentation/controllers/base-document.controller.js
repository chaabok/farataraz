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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SleBaseDocumentController = void 0;
const common_1 = require("@nestjs/common");
const base_document_service_1 = require("../../application/services/base-document.service");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
let SleBaseDocumentController = class SleBaseDocumentController {
    constructor(service) {
        this.service = service;
    }
    async getAvailable(type, excludeProformaId, customerRef) {
        const hasCustomerFilter = customerRef !== undefined && customerRef !== '';
        const data = await this.service.getAvailableBaseDocuments(Number(type) || 0, Number(excludeProformaId) > 0 ? Number(excludeProformaId) : undefined, hasCustomerFilter ? Number(customerRef) || 0 : undefined);
        return { success: true, data };
    }
    async getDetail(type, id) {
        const data = await this.service.getBaseDocumentDetail(Number(type) || 0, Number(id) || 0);
        return { success: true, data };
    }
};
exports.SleBaseDocumentController = SleBaseDocumentController;
__decorate([
    (0, common_1.Get)('available'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('excludeProformaId')),
    __param(2, (0, common_1.Query)('customerRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], SleBaseDocumentController.prototype, "getAvailable", null);
__decorate([
    (0, common_1.Get)('detail'),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], SleBaseDocumentController.prototype, "getDetail", null);
exports.SleBaseDocumentController = SleBaseDocumentController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('sle/base-documents'),
    __metadata("design:paramtypes", [base_document_service_1.SleBaseDocumentService])
], SleBaseDocumentController);
//# sourceMappingURL=base-document.controller.js.map