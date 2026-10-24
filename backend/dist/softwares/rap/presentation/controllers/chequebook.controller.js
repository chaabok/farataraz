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
exports.ChequebookController = void 0;
const common_1 = require("@nestjs/common");
const chequebook_service_1 = require("../../application/services/chequebook.service");
const create_chequebook_dto_1 = require("../../application/dtos/create-chequebook.dto");
const update_chequebook_dto_1 = require("../../application/dtos/update-chequebook.dto");
const permissions_decorator_1 = require("../../../../auth/permissions.decorator");
const jwt_auth_guard_1 = require("../../../../auth/jwt-auth.guard");
let ChequebookController = class ChequebookController {
    constructor(chequebookService) {
        this.chequebookService = chequebookService;
    }
    async create(createDto) {
        return await this.chequebookService.create(createDto);
    }
    async findAll(query) {
        return await this.chequebookService.findAll(query);
    }
    async findOne(id) {
        return await this.chequebookService.findById(+id);
    }
    async update(id, updateDto) {
        return await this.chequebookService.update(+id, updateDto);
    }
    async remove(id) {
        await this.chequebookService.delete(+id);
        return { success: true, id };
    }
};
exports.ChequebookController = ChequebookController;
__decorate([
    (0, common_1.Post)(),
    (0, permissions_decorator_1.Permissions)('rap.chequebooks.create'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_chequebook_dto_1.CreateChequebookDto]),
    __metadata("design:returntype", Promise)
], ChequebookController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, permissions_decorator_1.Permissions)('rap.chequebooks.read'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChequebookController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, permissions_decorator_1.Permissions)('rap.chequebooks.read'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChequebookController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, permissions_decorator_1.Permissions)('rap.chequebooks.update'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_chequebook_dto_1.UpdateChequebookDto]),
    __metadata("design:returntype", Promise)
], ChequebookController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, permissions_decorator_1.Permissions)('rap.chequebooks.delete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ChequebookController.prototype, "remove", null);
exports.ChequebookController = ChequebookController = __decorate([
    (0, common_1.Controller)('rap/chequebooks'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [chequebook_service_1.ChequebookService])
], ChequebookController);
//# sourceMappingURL=chequebook.controller.js.map