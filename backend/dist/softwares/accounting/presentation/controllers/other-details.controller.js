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
exports.OtherDetailsController = void 0;
const common_1 = require("@nestjs/common");
const other_details_service_1 = require("../../application/services/other-details.service");
const create_other_details_dto_1 = require("../../application/dtos/create-other-details.dto");
const update_other_details_dto_1 = require("../../application/dtos/update-other-details.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let OtherDetailsController = class OtherDetailsController {
    constructor(otherDetailsService) {
        this.otherDetailsService = otherDetailsService;
    }
    async checkDuplicate(field, value, excludeId) {
        const isDuplicate = await this.otherDetailsService.checkDuplicate(field, value, excludeId ? parseInt(excludeId, 10) : undefined);
        return { isDuplicate };
    }
    async create(createDto, companyId, branchId, agencyId) {
        if (createDto.title) {
            const isDupTitle = await this.otherDetailsService.checkDuplicate('title', createDto.title);
            if (isDupTitle)
                throw new common_1.BadRequestException('حسابی با این عنوان از قبل وجود دارد');
        }
        const compId = companyId ? parseInt(companyId, 10) : 1;
        const brId = branchId ? parseInt(branchId, 10) : undefined;
        const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
        return this.otherDetailsService.create(createDto, compId, brId, agnId);
    }
    async update(id, updateDto, companyId, branchId, agencyId) {
        if (updateDto.title) {
            const isDupTitle = await this.otherDetailsService.checkDuplicate('title', updateDto.title, id);
            if (isDupTitle)
                throw new common_1.BadRequestException('حسابی با این عنوان از قبل وجود دارد');
        }
        const compId = companyId ? parseInt(companyId, 10) : 1;
        const brId = branchId ? parseInt(branchId, 10) : undefined;
        const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
        return this.otherDetailsService.update(id, updateDto, compId, brId, agnId);
    }
    async findAll(pageIndex, pageSize, sorting, columnFilters, globalFilter, advancedFilters) {
        if (pageIndex !== undefined) {
            return this.otherDetailsService.findWithPagination({
                pageIndex: parseInt(pageIndex, 10),
                pageSize: parseInt(pageSize || '50', 10),
                sorting,
                columnFilters,
                globalFilter,
                advancedFilters,
            });
        }
        return this.otherDetailsService.findAll();
    }
    async findOne(id) {
        return this.otherDetailsService.findOne(id);
    }
    async remove(id) {
        return this.otherDetailsService.remove(id);
    }
};
exports.OtherDetailsController = OtherDetailsController;
__decorate([
    (0, common_1.Get)('check-duplicate'),
    (0, permissions_decorator_1.Permissions)('OtherDetails:Read'),
    __param(0, (0, common_1.Query)('field')),
    __param(1, (0, common_1.Query)('value')),
    __param(2, (0, common_1.Query)('excludeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OtherDetailsController.prototype, "checkDuplicate", null);
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('OtherDetails:Create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Headers)('x-branch-id')),
    __param(3, (0, common_1.Headers)('x-agency-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_other_details_dto_1.CreateOtherDetailsDto, String, String, String]),
    __metadata("design:returntype", Promise)
], OtherDetailsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('OtherDetails:Update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('x-branch-id')),
    __param(4, (0, common_1.Headers)('x-agency-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_other_details_dto_1.UpdateOtherDetailsDto, String, String, String]),
    __metadata("design:returntype", Promise)
], OtherDetailsController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('OtherDetails:Read'),
    __param(0, (0, common_1.Query)('pageIndex')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('sorting')),
    __param(3, (0, common_1.Query)('columnFilters')),
    __param(4, (0, common_1.Query)('globalFilter')),
    __param(5, (0, common_1.Query)('advancedFilters')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OtherDetailsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('OtherDetails:Read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OtherDetailsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('OtherDetails:Delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], OtherDetailsController.prototype, "remove", null);
exports.OtherDetailsController = OtherDetailsController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('accounting/other-details'),
    __metadata("design:paramtypes", [other_details_service_1.OtherDetailsService])
], OtherDetailsController);
//# sourceMappingURL=other-details.controller.js.map