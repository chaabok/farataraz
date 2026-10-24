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
exports.DocumentAccountingInfoController = void 0;
const common_1 = require("@nestjs/common");
const document_accounting_info_service_1 = require("../../application/services/document-accounting-info.service");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
let DocumentAccountingInfoController = class DocumentAccountingInfoController {
    constructor(service) {
        this.service = service;
        console.log('DocumentAccountingInfoController instantiated!');
    }
    async getByDocument(documentType, documentRef) {
        if (!documentType || !documentRef) {
            return { success: false, message: 'Parameters required' };
        }
        const result = await this.service.getByDocumentWithAccounts(documentType, Number(documentRef));
        return { success: true, ...result };
    }
    async save(body) {
        if (Array.isArray(body)) {
            if (body.length === 0) {
                return { success: true, data: [] };
            }
            const documentType = body[0].documentType;
            const documentRef = body[0].documentRef;
            if (!documentType || !documentRef) {
                return { success: false, message: 'Parameters required in payload items' };
            }
            const saved = await this.service.save(documentType, Number(documentRef), body);
            return { success: true, data: saved };
        }
        else {
            const { documentType, documentRef, ...data } = body;
            if (!documentType || !documentRef) {
                return { success: false, message: 'Parameters required' };
            }
            const saved = await this.service.save(documentType, Number(documentRef), data);
            return { success: true, data: saved };
        }
    }
};
exports.DocumentAccountingInfoController = DocumentAccountingInfoController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('documentType')),
    __param(1, (0, common_1.Query)('documentRef')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], DocumentAccountingInfoController.prototype, "getByDocument", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DocumentAccountingInfoController.prototype, "save", null);
exports.DocumentAccountingInfoController = DocumentAccountingInfoController = __decorate([
    (0, common_1.Controller)('rap/document-accounting-info'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [document_accounting_info_service_1.DocumentAccountingInfoService])
], DocumentAccountingInfoController);
//# sourceMappingURL=document-accounting-info.controller.js.map