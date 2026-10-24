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
exports.VoucherController = void 0;
const common_1 = require("@nestjs/common");
const voucher_service_1 = require("../../application/services/voucher.service");
const create_voucher_dto_1 = require("../../application/dtos/create-voucher.dto");
const update_voucher_dto_1 = require("../../application/dtos/update-voucher.dto");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
let VoucherController = class VoucherController {
    constructor(voucherService) {
        this.voucherService = voucherService;
    }
    create(createVoucherDto) {
        return this.voucherService.create(createVoucherDto);
    }
    getNextNumbers(date) {
        return this.voucherService.getNextNumbers(date);
    }
    getLastVoucherDate(fiscalYearId) {
        return this.voucherService.getLastVoucherDate(fiscalYearId);
    }
    getFinalizeInitialValues(fiscalYearId) {
        return this.voucherService.getFinalizeInitialValues(fiscalYearId);
    }
    finalizeVouchers(body) {
        return this.voucherService.finalizeVouchers(body);
    }
    getReverseFinalizeInitialValues(fiscalYearId) {
        return this.voucherService.getReverseFinalizeInitialValues(fiscalYearId);
    }
    reverseFinalizeVouchers(body) {
        return this.voucherService.reverseFinalizeVouchers(body);
    }
    getNumberRangeByDate(fromDate, toDate, fiscalYearId) {
        return this.voucherService.getNumberRangeByDate(fromDate, toDate, fiscalYearId);
    }
    findAll() {
        return this.voucherService.findAll();
    }
    findOne(id) {
        return this.voucherService.findOne(+id);
    }
    updatePut(id, updateVoucherDto) {
        return this.voucherService.update(+id, updateVoucherDto);
    }
    updatePatch(id, updateVoucherDto) {
        return this.voucherService.update(+id, updateVoucherDto);
    }
    remove(id) {
        return this.voucherService.remove(+id);
    }
    renumber(body) {
        return this.voucherService.renumber(body);
    }
};
exports.VoucherController = VoucherController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_voucher_dto_1.CreateVoucherDto]),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('next-numbers'),
    __param(0, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "getNextNumbers", null);
__decorate([
    (0, common_1.Get)('last-date'),
    __param(0, (0, common_1.Query)('fiscalYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "getLastVoucherDate", null);
__decorate([
    (0, common_1.Get)('finalize-initial-values'),
    __param(0, (0, common_1.Query)('fiscalYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "getFinalizeInitialValues", null);
__decorate([
    (0, common_1.Post)('finalize'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "finalizeVouchers", null);
__decorate([
    (0, common_1.Get)('reverse-finalize-initial-values'),
    __param(0, (0, common_1.Query)('fiscalYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "getReverseFinalizeInitialValues", null);
__decorate([
    (0, common_1.Post)('reverse-finalize'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "reverseFinalizeVouchers", null);
__decorate([
    (0, common_1.Get)('number-range-by-date'),
    __param(0, (0, common_1.Query)('fromDate')),
    __param(1, (0, common_1.Query)('toDate')),
    __param(2, (0, common_1.Query)('fiscalYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "getNumberRangeByDate", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_voucher_dto_1.UpdateVoucherDto]),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "updatePut", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_voucher_dto_1.UpdateVoucherDto]),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "updatePatch", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('renumber'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], VoucherController.prototype, "renumber", null);
exports.VoucherController = VoucherController = __decorate([
    (0, common_1.Controller)('accounting/vouchers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [voucher_service_1.VoucherService])
], VoucherController);
//# sourceMappingURL=voucher.controller.js.map