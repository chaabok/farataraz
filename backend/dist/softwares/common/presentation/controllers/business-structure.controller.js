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
exports.BusinessStructureController = void 0;
const common_1 = require("@nestjs/common");
const business_structure_service_1 = require("../../application/services/business-structure.service");
const iam_service_1 = require("../../../../core/iam/services/iam.service");
const create_business_structure_dto_1 = require("../../application/dtos/create-business-structure.dto");
const update_business_structure_dto_1 = require("../../application/dtos/update-business-structure.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let BusinessStructureController = class BusinessStructureController {
    constructor(service, iamService) {
        this.service = service;
        this.iamService = iamService;
    }
    async create(createDto, companyId) {
        try {
            const compId = companyId ? parseInt(companyId, 10) : 1;
            const result = await this.service.create(createDto, compId);
            return { statusCode: common_1.HttpStatus.CREATED, data: result };
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    mapStructureName(item) {
        if (item.businessStructureName) {
            return item;
        }
        let name = '';
        switch (Number(item.businessStructure)) {
            case 1:
                name = 'دفتر مرکزی';
                break;
            case 2:
                name = 'شرکت';
                break;
            case 3:
                name = 'شعبه';
                break;
            case 4:
                name = 'نمایندگی';
                break;
            default: name = 'نامشخص';
        }
        return { ...item, businessStructureName: name };
    }
    async findAll(req) {
        try {
            const result = await this.service.findAll();
            const mappedResult = result.map(this.mapStructureName.bind(this));
            const authData = await this.iamService.getMyBusinessStructures(req.user.userId);
            if (authData.isAdmin) {
                return { statusCode: common_1.HttpStatus.OK, data: mappedResult };
            }
            const getAncestors = (items, allowedIds) => {
                const ancestors = new Set();
                const itemMap = new Map(items.map(item => [item.businessStructureId, item]));
                allowedIds.forEach(id => {
                    let current = itemMap.get(id);
                    while (current && current.parentRef) {
                        ancestors.add(current.parentRef);
                        current = itemMap.get(current.parentRef);
                    }
                });
                return Array.from(ancestors);
            };
            const ancestorIds = getAncestors(mappedResult, authData.allowedIds);
            const filtered = mappedResult.filter((c) => c.code === '01' ||
                authData.allowedIds.includes(c.businessStructureId) ||
                ancestorIds.includes(c.businessStructureId));
            return { statusCode: common_1.HttpStatus.OK, data: filtered };
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const result = await this.service.findById(id);
            if (!result) {
                throw new common_1.HttpException('Item not found', common_1.HttpStatus.NOT_FOUND);
            }
            return { statusCode: common_1.HttpStatus.OK, data: this.mapStructureName(result) };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, updateDto, companyId) {
        try {
            const compId = companyId ? parseInt(companyId, 10) : 1;
            const result = await this.service.update(id, updateDto, compId);
            return { statusCode: common_1.HttpStatus.OK, data: result };
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async remove(id) {
        try {
            await this.service.delete(id);
            return { statusCode: common_1.HttpStatus.OK, message: 'Item deleted successfully' };
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.BusinessStructureController = BusinessStructureController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('BusinessStructure:Create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_business_structure_dto_1.CreateBusinessStructureDto, String]),
    __metadata("design:returntype", Promise)
], BusinessStructureController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('BusinessStructure:Read'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BusinessStructureController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('BusinessStructure:Read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BusinessStructureController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('BusinessStructure:Update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_business_structure_dto_1.UpdateBusinessStructureDto, String]),
    __metadata("design:returntype", Promise)
], BusinessStructureController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('BusinessStructure:Delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], BusinessStructureController.prototype, "remove", null);
exports.BusinessStructureController = BusinessStructureController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('business-structure'),
    __metadata("design:paramtypes", [business_structure_service_1.BusinessStructureService,
        iam_service_1.IamService])
], BusinessStructureController);
//# sourceMappingURL=business-structure.controller.js.map