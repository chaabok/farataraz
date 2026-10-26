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
exports.FiscalYearController = void 0;
const common_1 = require("@nestjs/common");
const fiscal_year_service_1 = require("../../application/services/fiscal-year.service");
const create_fiscal_year_dto_1 = require("../../application/dtos/create-fiscal-year.dto");
const update_fiscal_year_dto_1 = require("../../application/dtos/update-fiscal-year.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let FiscalYearController = class FiscalYearController {
    constructor(service) {
        this.service = service;
    }
    create(createDto, companyId, branchId, agencyId) {
        const compId = companyId ? parseInt(companyId, 10) : 1;
        const brId = branchId ? parseInt(branchId, 10) : undefined;
        const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
        return this.service.create(createDto, compId, brId, agnId);
    }
    checkTitle(title, id) {
        return this.service.checkDuplicateTitle(title, id ? +id : undefined);
    }
    findAll(pageIndex, pageSize, sorting, columnFilters, globalFilter, advancedFilters) {
        if (pageIndex !== undefined && pageSize !== undefined) {
            return this.service.findWithPagination({
                pageIndex: parseInt(pageIndex, 10),
                pageSize: parseInt(pageSize, 10),
                sorting,
                columnFilters,
                globalFilter,
                advancedFilters,
            });
        }
        return this.service.findAll();
    }
    findOne(id) {
        return this.service.findOne(+id);
    }
    update(id, updateDto, companyId, branchId, agencyId) {
        const compId = companyId ? parseInt(companyId, 10) : 1;
        const brId = branchId ? parseInt(branchId, 10) : undefined;
        const agnId = agencyId ? parseInt(agencyId, 10) : undefined;
        return this.service.update(+id, updateDto, compId, brId, agnId);
    }
    remove(id) {
        return this.service.remove(+id);
    }
};
exports.FiscalYearController = FiscalYearController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('FiscalYear:Create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __param(2, (0, common_1.Headers)('x-branch-id')),
    __param(3, (0, common_1.Headers)('x-agency-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_fiscal_year_dto_1.CreateFiscalYearDto, String, String, String]),
    __metadata("design:returntype", void 0)
], FiscalYearController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('check-title'),
    (0, permissions_decorator_1.Permissions)('FiscalYear:Read'),
    __param(0, (0, common_1.Query)('title')),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], FiscalYearController.prototype, "checkTitle", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('FiscalYear:Read'),
    __param(0, (0, common_1.Query)('pageIndex')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('sorting')),
    __param(3, (0, common_1.Query)('columnFilters')),
    __param(4, (0, common_1.Query)('globalFilter')),
    __param(5, (0, common_1.Query)('advancedFilters')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], FiscalYearController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('FiscalYear:Read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FiscalYearController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.Patch)(':id'),
    (0, permissions_decorator_1.Permissions)('FiscalYear:Update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __param(3, (0, common_1.Headers)('x-branch-id')),
    __param(4, (0, common_1.Headers)('x-agency-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_fiscal_year_dto_1.UpdateFiscalYearDto, String, String, String]),
    __metadata("design:returntype", void 0)
], FiscalYearController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('FiscalYear:Delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], FiscalYearController.prototype, "remove", null);
exports.FiscalYearController = FiscalYearController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('common/fiscalyear'),
    __metadata("design:paramtypes", [fiscal_year_service_1.FiscalYearService])
], FiscalYearController);
//# sourceMappingURL=fiscal-year.controller.js.map