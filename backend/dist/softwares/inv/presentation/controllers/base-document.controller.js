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
exports.BaseDocumentController = void 0;
const common_1 = require("@nestjs/common");
const base_document_service_1 = require("../../application/services/base-document.service");
let BaseDocumentController = class BaseDocumentController {
    constructor(baseDocumentService) {
        this.baseDocumentService = baseDocumentService;
    }
    async getAvailableBaseDocuments(docType, targetDocType) {
        if (!docType)
            return [];
        return this.baseDocumentService.getAvailableBaseDocuments(docType, targetDocType);
    }
    async getBaseDocumentDetails(docType, idStr, currentDocIdStr, targetDocTypeQuery) {
        const id = Number(idStr);
        const currentDocId = currentDocIdStr ? Number(currentDocIdStr) : undefined;
        if (!docType || !id)
            return null;
        const targetDocType = targetDocTypeQuery || 'WarehouseReceipt';
        return this.baseDocumentService.getBaseDocumentDetails(docType, id, currentDocId, targetDocType);
    }
};
exports.BaseDocumentController = BaseDocumentController;
__decorate([
    (0, common_1.Get)('available'),
    __param(0, (0, common_1.Query)('docType')),
    __param(1, (0, common_1.Query)('targetDocType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], BaseDocumentController.prototype, "getAvailableBaseDocuments", null);
__decorate([
    (0, common_1.Get)('details'),
    __param(0, (0, common_1.Query)('docType')),
    __param(1, (0, common_1.Query)('id')),
    __param(2, (0, common_1.Query)('currentDocId')),
    __param(3, (0, common_1.Query)('targetDocType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], BaseDocumentController.prototype, "getBaseDocumentDetails", null);
exports.BaseDocumentController = BaseDocumentController = __decorate([
    (0, common_1.Controller)('inv/base-documents'),
    __metadata("design:paramtypes", [base_document_service_1.BaseDocumentService])
], BaseDocumentController);
//# sourceMappingURL=base-document.controller.js.map