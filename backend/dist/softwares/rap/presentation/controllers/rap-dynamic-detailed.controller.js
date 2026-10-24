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
exports.RapDynamicDetailedController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rap_reason_entity_1 = require("../../domain/entities/rap-reason.entity");
const reciept_and_payment_accounting_setting_entity_1 = require("../../domain/entities/reciept-and-payment-accounting-setting.entity");
const account_entity_1 = require("../../../accounting/domain/entities/account.entity");
let RapDynamicDetailedController = class RapDynamicDetailedController {
    constructor(reasonRepository, settingRepository, accountRepository) {
        this.reasonRepository = reasonRepository;
        this.settingRepository = settingRepository;
        this.accountRepository = accountRepository;
    }
    async getRequiredDetailedTypes(reasonId, accountingSettingId) {
        try {
            let accountRef = null;
            if (accountingSettingId) {
                const setting = await this.settingRepository.findOne({ where: { recieptAndPaymentAccountingSettingId: Number(accountingSettingId) } });
                if (setting && setting.accountRef) {
                    accountRef = setting.accountRef;
                }
            }
            else if (reasonId) {
                const reason = await this.reasonRepository.findOne({ where: { RapReasonID: Number(reasonId) } });
                if (reason && reason.AccountRef) {
                    accountRef = reason.AccountRef;
                }
            }
            if (!accountRef) {
                return { success: true, detailedTypes: [] };
            }
            const account = await this.accountRepository.findOne({
                where: { id: accountRef },
                relations: ['relatedDetailedAccounts', 'relatedDetailedAccounts.detailedType'],
            });
            if (!account || !account.relatedDetailedAccounts) {
                return { success: true, detailedTypes: [] };
            }
            const detailedTypes = account.relatedDetailedAccounts.map(rd => ({
                detailedLevel: rd.detailedLevel,
                detailedTypeId: rd.detailedType?.detailedTypesId,
                code: rd.detailedType?.code,
                title: rd.detailedType?.title,
            })).sort((a, b) => a.detailedLevel - b.detailedLevel);
            return { success: true, detailedTypes };
        }
        catch (error) {
            throw new common_1.HttpException(error.message || 'Error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.RapDynamicDetailedController = RapDynamicDetailedController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('reasonId')),
    __param(1, (0, common_1.Query)('accountingSettingId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], RapDynamicDetailedController.prototype, "getRequiredDetailedTypes", null);
exports.RapDynamicDetailedController = RapDynamicDetailedController = __decorate([
    (0, common_1.Controller)('rap/dynamic-detailed-types'),
    __param(0, (0, typeorm_1.InjectRepository)(rap_reason_entity_1.RapReason)),
    __param(1, (0, typeorm_1.InjectRepository)(reciept_and_payment_accounting_setting_entity_1.RecieptAndPaymentAccountingSetting)),
    __param(2, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RapDynamicDetailedController);
//# sourceMappingURL=rap-dynamic-detailed.controller.js.map