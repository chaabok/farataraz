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
exports.DynamicFormController = void 0;
const common_1 = require("@nestjs/common");
const dynamic_form_service_1 = require("../../application/services/dynamic-form.service");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
const permissions_guard_1 = require("../../../../auth/permissions.guard");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
let DynamicFormController = class DynamicFormController {
    constructor(service) {
        this.service = service;
    }
    async create(dto, companyId) {
        const compId = companyId ? parseInt(companyId, 10) : 2;
        const data = await this.service.create(dto, compId);
        return { data, message: 'فرم پویا با موفقیت ایجاد شد.' };
    }
    async findAll() {
        const data = await this.service.findAll();
        return { data };
    }
    async findByCode(code, companyId) {
        const compId = companyId ? parseInt(companyId, 10) : 2;
        const data = await this.service.findByCode(code, compId);
        return { data };
    }
    async findOne(id) {
        const data = await this.service.findOne(id);
        return { data };
    }
    async update(id, dto, companyId) {
        const compId = companyId ? parseInt(companyId, 10) : 2;
        const data = await this.service.update(id, dto, compId);
        return { data, message: 'فرم پویا با موفقیت بروزرسانی شد.' };
    }
    async remove(id) {
        await this.service.remove(id);
        return { message: 'فرم پویا با موفقیت حذف شد.' };
    }
    async createRecord(formId, dataDto, companyId) {
        const compId = companyId ? parseInt(companyId, 10) : 2;
        const data = await this.service.createRecord(formId, dataDto, compId);
        return { data, message: 'رکورد جدید با موفقیت ثبت شد.' };
    }
    async findAllRecords(formId, companyId) {
        const compId = companyId ? parseInt(companyId, 10) : 2;
        const data = await this.service.findAllRecordsByForm(formId, compId);
        return { data };
    }
    async findRecordOne(recordId) {
        const data = await this.service.findRecordOne(recordId);
        return { data };
    }
    async updateRecord(recordId, dataDto, companyId) {
        const compId = companyId ? parseInt(companyId, 10) : 2;
        const data = await this.service.updateRecord(recordId, dataDto, compId);
        return { data, message: 'رکورد با موفقیت بروزرسانی شد.' };
    }
    async removeRecord(recordId) {
        await this.service.removeRecord(recordId);
        return { message: 'رکورد با موفقیت حذف شد.' };
    }
};
exports.DynamicFormController = DynamicFormController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('DynamicForm:Create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], DynamicFormController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('DynamicForm:Read'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DynamicFormController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('code/:code'),
    (0, permissions_decorator_1.Permissions)('DynamicForm:Read'),
    __param(0, (0, common_1.Param)('code')),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], DynamicFormController.prototype, "findByCode", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('DynamicForm:Read'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DynamicFormController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('DynamicForm:Update'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String]),
    __metadata("design:returntype", Promise)
], DynamicFormController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('DynamicForm:Delete'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DynamicFormController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':formId/records'),
    (0, permissions_decorator_1.Permissions)('DynamicForm:Create'),
    __param(0, (0, common_1.Param)('formId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String]),
    __metadata("design:returntype", Promise)
], DynamicFormController.prototype, "createRecord", null);
__decorate([
    (0, common_1.Get)(':formId/records'),
    (0, permissions_decorator_1.Permissions)('DynamicForm:Read'),
    __param(0, (0, common_1.Param)('formId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], DynamicFormController.prototype, "findAllRecords", null);
__decorate([
    (0, common_1.Get)('records/:recordId'),
    (0, permissions_decorator_1.Permissions)('DynamicForm:Read'),
    __param(0, (0, common_1.Param)('recordId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DynamicFormController.prototype, "findRecordOne", null);
__decorate([
    (0, common_1.Put)('records/:recordId'),
    (0, permissions_decorator_1.Permissions)('DynamicForm:Update'),
    __param(0, (0, common_1.Param)('recordId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Headers)('x-company-id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String]),
    __metadata("design:returntype", Promise)
], DynamicFormController.prototype, "updateRecord", null);
__decorate([
    (0, common_1.Delete)('records/:recordId'),
    (0, permissions_decorator_1.Permissions)('DynamicForm:Delete'),
    __param(0, (0, common_1.Param)('recordId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], DynamicFormController.prototype, "removeRecord", null);
exports.DynamicFormController = DynamicFormController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, permissions_guard_1.PermissionsGuard),
    (0, common_1.Controller)('dfb/forms'),
    __metadata("design:paramtypes", [dynamic_form_service_1.DynamicFormService])
], DynamicFormController);
//# sourceMappingURL=dynamic-form.controller.js.map