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
exports.CostCenterController = void 0;
const common_1 = require("@nestjs/common");
const cost_center_service_1 = require("../../application/services/cost-center.service");
const create_cost_center_dto_1 = require("../../application/dtos/create-cost-center.dto");
const update_cost_center_dto_1 = require("../../application/dtos/update-cost-center.dto");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
const detailed_accounts_numbering_service_1 = require("../../../common/application/services/detailed-accounts-numbering.service");
let CostCenterController = class CostCenterController {
    constructor(costCenterService, detailedAccountsNumberingService) {
        this.costCenterService = costCenterService;
        this.detailedAccountsNumberingService = detailedAccountsNumberingService;
    }
    create(createDto) {
        return this.costCenterService.create(createDto);
    }
    update(id, updateDto) {
        return this.costCenterService.update(+id, updateDto);
    }
    remove(id) {
        return this.costCenterService.remove(+id);
    }
    bulkRemove(ids) {
        return this.costCenterService.bulkRemove(ids);
    }
    findAll() {
        return this.costCenterService.findAll();
    }
    findAdvanced(query) {
        return this.costCenterService.findWithPagination({
            pageIndex: parseInt(query.pageIndex || '0', 10),
            pageSize: parseInt(query.pageSize || '10', 10),
            sorting: query.sorting,
            columnFilters: query.columnFilters,
            globalFilter: query.globalFilter,
            advancedFilters: query.advancedFilters,
        });
    }
    async getInitData() {
        const nextCode = await this.costCenterService.getNextCode();
        let detailedNumber = '';
        const { detailedTypeService } = this.detailedAccountsNumberingService;
        if (detailedTypeService) {
            const types = await detailedTypeService.findAll();
            const typeCostCenter = types.find((t) => t.code === '15');
            if (typeCostCenter) {
                detailedNumber = await this.detailedAccountsNumberingService.getNextCode(typeCostCenter.detailedTypesId);
            }
        }
        return {
            nextCode: String(nextCode),
            detailedNumber: detailedNumber
        };
    }
    findOne(id) {
        return this.costCenterService.findOne(+id);
    }
};
exports.CostCenterController = CostCenterController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('ACC_COST_CENTER_CREATE'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_cost_center_dto_1.CreateCostCenterDto]),
    __metadata("design:returntype", void 0)
], CostCenterController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('ACC_COST_CENTER_UPDATE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_cost_center_dto_1.UpdateCostCenterDto]),
    __metadata("design:returntype", void 0)
], CostCenterController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('ACC_COST_CENTER_DELETE'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CostCenterController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('bulk-delete'),
    (0, permissions_decorator_1.Permissions)('ACC_COST_CENTER_DELETE'),
    __param(0, (0, common_1.Body)('ids')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], CostCenterController.prototype, "bulkRemove", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('ACC_COST_CENTER_VIEW'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CostCenterController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('advanced'),
    (0, permissions_decorator_1.Permissions)('ACC_COST_CENTER_VIEW'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CostCenterController.prototype, "findAdvanced", null);
__decorate([
    (0, common_1.Get)('init'),
    (0, permissions_decorator_1.Permissions)('ACC_COST_CENTER_VIEW'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CostCenterController.prototype, "getInitData", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('ACC_COST_CENTER_VIEW'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CostCenterController.prototype, "findOne", null);
exports.CostCenterController = CostCenterController = __decorate([
    (0, common_1.Controller)('accounting/cost-center'),
    __metadata("design:paramtypes", [cost_center_service_1.CostCenterService,
        detailed_accounts_numbering_service_1.DetailedAccountsNumberingService])
], CostCenterController);
//# sourceMappingURL=cost-center.controller.js.map