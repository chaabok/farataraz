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
exports.UsageCheckController = void 0;
const common_1 = require("@nestjs/common");
const usage_check_service_1 = require("../services/usage-check.service");
let UsageCheckController = class UsageCheckController {
    constructor(usageCheckService) {
        this.usageCheckService = usageCheckService;
    }
    async checkUsage(tableName, id) {
        if (!tableName || !id) {
            throw new common_1.BadRequestException('tableName and id are required');
        }
        const result = await this.usageCheckService.isRecordUsed(tableName, id);
        return result;
    }
};
exports.UsageCheckController = UsageCheckController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('tableName')),
    __param(1, (0, common_1.Query)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], UsageCheckController.prototype, "checkUsage", null);
exports.UsageCheckController = UsageCheckController = __decorate([
    (0, common_1.Controller)('core/usage-check'),
    __metadata("design:paramtypes", [usage_check_service_1.UsageCheckService])
], UsageCheckController);
//# sourceMappingURL=usage-check.controller.js.map