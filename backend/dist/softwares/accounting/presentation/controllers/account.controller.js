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
exports.AccountController = void 0;
const common_1 = require("@nestjs/common");
const account_service_1 = require("../../application/services/account.service");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let AccountController = class AccountController {
    constructor(accountService) {
        this.accountService = accountService;
    }
    async seedDefaultAccounts(body) {
        await this.accountService.seedDefaultTree(body.type || 1, {
            group: body.group || 1,
            total: body.total || 2,
            specific: body.specific || 2
        });
        return { success: true, message: 'کدینگ پیش فرض با موفقیت ایجاد شد' };
    }
    async create(createDto) {
        if (createDto.title) {
            const isDuplicateTitle = await this.accountService.checkDuplicate('title', createDto.title);
            if (isDuplicateTitle) {
                throw new common_1.BadRequestException('حسابی با این عنوان از قبل وجود دارد');
            }
        }
        const result = await this.accountService.create(createDto);
        return { success: true, data: result };
    }
    async checkDuplicate(field, value, excludeId) {
        const isDuplicate = await this.accountService.checkDuplicate(field, value, excludeId ? parseInt(excludeId, 10) : undefined);
        return { isDuplicate };
    }
    async findAll(query) {
        const search = query.search;
        const levelNum = query.level ? parseInt(query.level, 10) : undefined;
        const items = await this.accountService.findAll(search, levelNum, query);
        return { success: true, data: items };
    }
    async findOne(id) {
        const result = await this.accountService.findOne(id);
        return { success: true, data: result };
    }
    async update(id, updateDto) {
        if (updateDto.title) {
            const isDuplicateTitle = await this.accountService.checkDuplicate('title', updateDto.title, id);
            if (isDuplicateTitle) {
                throw new common_1.BadRequestException('حسابی با این عنوان از قبل وجود دارد');
            }
        }
        const result = await this.accountService.update(id, updateDto);
        return { success: true, message: 'Account updated successfully', data: result };
    }
    async remove(id) {
        await this.accountService.remove(id);
        return { success: true, message: 'Account deleted successfully' };
    }
};
exports.AccountController = AccountController;
__decorate([
    (0, permissions_decorator_1.Permissions)('Account:Create'),
    (0, common_1.Post)('seed-default'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "seedDefaultAccounts", null);
__decorate([
    (0, permissions_decorator_1.Permissions)('Account:Create'),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "create", null);
__decorate([
    (0, permissions_decorator_1.Permissions)('Account:Read'),
    (0, common_1.Get)('check-duplicate'),
    __param(0, (0, common_1.Query)('field')),
    __param(1, (0, common_1.Query)('value')),
    __param(2, (0, common_1.Query)('excludeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "checkDuplicate", null);
__decorate([
    (0, permissions_decorator_1.Permissions)('Account:Read'),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "findAll", null);
__decorate([
    (0, permissions_decorator_1.Permissions)('Account:Read'),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "findOne", null);
__decorate([
    (0, permissions_decorator_1.Permissions)('Account:Update'),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "update", null);
__decorate([
    (0, permissions_decorator_1.Permissions)('Account:Delete'),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AccountController.prototype, "remove", null);
exports.AccountController = AccountController = __decorate([
    (0, common_1.Controller)('accounting/accounts'),
    __metadata("design:paramtypes", [account_service_1.AccountService])
], AccountController);
//# sourceMappingURL=account.controller.js.map