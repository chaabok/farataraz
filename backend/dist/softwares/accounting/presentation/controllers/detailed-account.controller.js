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
exports.DetailedAccountController = void 0;
const common_1 = require("@nestjs/common");
const detailed_account_service_1 = require("../../application/services/detailed-account.service");
const create_detailed_account_dto_1 = require("../../application/dtos/create-detailed-account.dto");
const update_detailed_account_dto_1 = require("../../application/dtos/update-detailed-account.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let DetailedAccountController = class DetailedAccountController {
    constructor(detailedAccountService) {
        this.detailedAccountService = detailedAccountService;
    }
    async create(createDetailedAccountDto) {
        const isDuplicate = await this.detailedAccountService.checkDuplicate('code', createDetailedAccountDto.code);
        if (isDuplicate) {
            throw new common_1.BadRequestException('کد وارد شده تکراری است');
        }
        if (createDetailedAccountDto.title) {
            const isDuplicateTitle = await this.detailedAccountService.checkDuplicate('title', createDetailedAccountDto.title);
            if (isDuplicateTitle) {
                throw new common_1.BadRequestException('حسابی با این عنوان از قبل وجود دارد');
            }
        }
        const result = await this.detailedAccountService.create(createDetailedAccountDto);
        return { message: 'با موفقیت ثبت شد', data: result };
    }
    async findAll(pageIndex, pageSize, sorting, columnFilters, globalFilter, advancedFilters) {
        if (pageIndex !== undefined) {
            return await this.detailedAccountService.findWithPagination({
                pageIndex: parseInt(pageIndex, 10),
                pageSize: parseInt(pageSize || '50', 10),
                sorting,
                columnFilters,
                globalFilter,
                advancedFilters,
            });
        }
        const items = await this.detailedAccountService.findAll();
        return { items, total: items.length };
    }
    async findOne(id) {
        return this.detailedAccountService.findOne(id);
    }
    async update(id, updateDetailedAccountDto) {
        if (updateDetailedAccountDto.code) {
            const isDuplicate = await this.detailedAccountService.checkDuplicate('code', updateDetailedAccountDto.code, id);
            if (isDuplicate) {
                throw new common_1.BadRequestException('کد وارد شده تکراری است');
            }
        }
        if (updateDetailedAccountDto.title) {
            const isDuplicateTitle = await this.detailedAccountService.checkDuplicate('title', updateDetailedAccountDto.title, id);
            if (isDuplicateTitle) {
                throw new common_1.BadRequestException('حسابی با این عنوان از قبل وجود دارد');
            }
        }
        const result = await this.detailedAccountService.update(id, updateDetailedAccountDto);
        return { message: 'با موفقیت ویرایش شد', data: result };
    }
    async remove(id) {
        await this.detailedAccountService.remove(id);
        return { message: 'با موفقیت حذف شد' };
    }
    async bulkDelete(body) {
        if (!body.ids || !Array.isArray(body.ids)) {
            throw new common_1.BadRequestException('لیست شناسه‌ها نامعتبر است');
        }
        await this.detailedAccountService.removeMany(body.ids);
        return { message: 'موارد انتخاب شده با موفقیت حذف شدند' };
    }
};
exports.DetailedAccountController = DetailedAccountController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('DetailedAccount:Create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_detailed_account_dto_1.CreateDetailedAccountDto]),
    __metadata("design:returntype", Promise)
], DetailedAccountController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('DetailedAccount:Read'),
    __param(0, (0, common_1.Query)('pageIndex')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('sorting')),
    __param(3, (0, common_1.Query)('columnFilters')),
    __param(4, (0, common_1.Query)('globalFilter')),
    __param(5, (0, common_1.Query)('advancedFilters')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], DetailedAccountController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('DetailedAccount:Read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DetailedAccountController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('DetailedAccount:Update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_detailed_account_dto_1.UpdateDetailedAccountDto]),
    __metadata("design:returntype", Promise)
], DetailedAccountController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('DetailedAccount:Delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DetailedAccountController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('bulk-delete'),
    (0, permissions_decorator_1.Permissions)('DetailedAccount:Delete'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DetailedAccountController.prototype, "bulkDelete", null);
exports.DetailedAccountController = DetailedAccountController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('accounting/detailed-accounts'),
    __metadata("design:paramtypes", [detailed_account_service_1.DetailedAccountService])
], DetailedAccountController);
//# sourceMappingURL=detailed-account.controller.js.map