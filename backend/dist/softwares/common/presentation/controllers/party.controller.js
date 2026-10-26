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
exports.PartyController = void 0;
const common_1 = require("@nestjs/common");
const party_service_1 = require("../../application/services/party.service");
const create_party_dto_1 = require("../../application/dtos/create-party.dto");
const update_party_dto_1 = require("../../application/dtos/update-party.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let PartyController = class PartyController {
    constructor(partyService) {
        this.partyService = partyService;
    }
    async create(createDto) {
        try {
            const data = await this.partyService.create(createDto);
            return { statusCode: common_1.HttpStatus.CREATED, data, message: 'Party created successfully' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async update(id, updateDto) {
        try {
            const data = await this.partyService.update(id, updateDto);
            return { statusCode: common_1.HttpStatus.OK, data, message: 'Party updated successfully' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findAll(query) {
        try {
            if (query.pageIndex !== undefined) {
                let filters = query.columnFilters ? JSON.parse(query.columnFilters) : [];
                if (query.nature) {
                    filters.push({ id: 'nature', value: { op: 'equals', value: query.nature } });
                }
                if (query.isActive !== undefined && query.isActive !== '') {
                    const isAct = query.isActive === 'true' || query.isActive === true;
                    filters.push({ id: 'isActive', value: { op: 'equals', value: isAct } });
                }
                if (query.isSupplier !== undefined && query.isSupplier !== '') {
                    const isSupp = query.isSupplier === 'true' || query.isSupplier === true;
                    filters.push({ id: 'isSupplier', value: { op: 'equals', value: isSupp } });
                }
                if (query.isCustomer !== undefined && query.isCustomer !== '') {
                    const isCust = query.isCustomer === 'true' || query.isCustomer === true;
                    filters.push({ id: 'isCustomer', value: { op: 'equals', value: isCust } });
                }
                const data = await this.partyService.findWithPagination({
                    pageIndex: parseInt(query.pageIndex, 10),
                    pageSize: parseInt(query.pageSize, 10),
                    sorting: query.sorting ? JSON.parse(query.sorting) : [],
                    columnFilters: filters,
                    globalFilter: query.globalFilter,
                    excludeAssignedCustomers: query.excludeAssignedCustomers === 'true' || query.excludeAssignedCustomers === true,
                    excludeCustomerId: query.excludeCustomerId,
                });
                return { statusCode: common_1.HttpStatus.OK, data: { items: data.items, total: data.total } };
            }
            let options = { where: {} };
            if (query.nature) {
                options.where.nature = query.nature;
            }
            if (query.isActive !== undefined && query.isActive !== '') {
                options.where.isActive = query.isActive === 'true' || query.isActive === true;
            }
            if (query.isSupplier !== undefined && query.isSupplier !== '') {
                options.where.isSupplier = query.isSupplier === 'true' || query.isSupplier === true;
            }
            if (query.isCustomer !== undefined && query.isCustomer !== '') {
                options.where.isCustomer = query.isCustomer === 'true' || query.isCustomer === true;
            }
            options.excludeAssignedCustomers = query.excludeAssignedCustomers === 'true' || query.excludeAssignedCustomers === true;
            options.excludeCustomerId = query.excludeCustomerId;
            const data = await this.partyService.findAll(options);
            return { statusCode: common_1.HttpStatus.OK, data: { items: data, total: data.length } };
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async checkDuplicate(field, value, excludeId) {
        try {
            if (!field || !value) {
                return { statusCode: common_1.HttpStatus.OK, data: { isDuplicate: false } };
            }
            const isDuplicate = await this.partyService.checkDuplicate(field, value, excludeId ? parseInt(excludeId, 10) : undefined);
            return { statusCode: common_1.HttpStatus.OK, data: { isDuplicate } };
        }
        catch (error) {
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async findOne(id) {
        try {
            const data = await this.partyService.findOne(id);
            return { statusCode: common_1.HttpStatus.OK, data };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async remove(id) {
        try {
            await this.partyService.remove(id);
            return { statusCode: common_1.HttpStatus.OK, message: 'Party deleted successfully' };
        }
        catch (error) {
            if (error instanceof common_1.HttpException)
                throw error;
            throw new common_1.HttpException(error.message, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.PartyController = PartyController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('Party.Create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_party_dto_1.CreatePartyDto]),
    __metadata("design:returntype", Promise)
], PartyController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('Party.Update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_party_dto_1.UpdatePartyDto]),
    __metadata("design:returntype", Promise)
], PartyController.prototype, "update", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('Party.View'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PartyController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('check-duplicate'),
    (0, permissions_decorator_1.Permissions)('Party.View'),
    __param(0, (0, common_1.Query)('field')),
    __param(1, (0, common_1.Query)('value')),
    __param(2, (0, common_1.Query)('excludeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PartyController.prototype, "checkDuplicate", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('Party.View'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PartyController.prototype, "findOne", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('Party.Delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], PartyController.prototype, "remove", null);
exports.PartyController = PartyController = __decorate([
    (0, common_1.Controller)('common/parties'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    __metadata("design:paramtypes", [party_service_1.PartyService])
], PartyController);
//# sourceMappingURL=party.controller.js.map