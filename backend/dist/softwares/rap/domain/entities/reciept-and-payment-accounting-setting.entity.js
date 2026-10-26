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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecieptAndPaymentAccountingSetting = void 0;
const typeorm_1 = require("typeorm");
const app_base_entity_1 = require("../../../../core/entities/app-base.entity");
const account_entity_1 = require("../../../accounting/domain/entities/account.entity");
const reciept_and_payment_accounting_setting_enum_1 = require("./reciept-and-payment-accounting-setting.enum");
let RecieptAndPaymentAccountingSetting = class RecieptAndPaymentAccountingSetting extends app_base_entity_1.AppBaseEntity {
};
exports.RecieptAndPaymentAccountingSetting = RecieptAndPaymentAccountingSetting;
__decorate([
    (0, typeorm_1.PrimaryColumn)({
        name: 'RecieptAndPaymentAccountingSettingID',
        type: 'bigint',
        transformer: {
            to: (value) => value,
            from: (value) => parseInt(value, 10),
        }
    }),
    __metadata("design:type", Number)
], RecieptAndPaymentAccountingSetting.prototype, "recieptAndPaymentAccountingSettingId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Code', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], RecieptAndPaymentAccountingSetting.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], RecieptAndPaymentAccountingSetting.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'Title_En', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], RecieptAndPaymentAccountingSetting.prototype, "title_en", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'AccountRef',
        type: 'bigint',
        nullable: true,
        transformer: {
            to: (value) => value,
            from: (value) => (value !== null && value !== undefined) ? parseInt(value.toString(), 10) : null
        }
    }),
    __metadata("design:type", Number)
], RecieptAndPaymentAccountingSetting.prototype, "accountRef", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => account_entity_1.Account),
    (0, typeorm_1.JoinColumn)({ name: 'AccountRef' }),
    __metadata("design:type", account_entity_1.Account)
], RecieptAndPaymentAccountingSetting.prototype, "account", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usedEntryType', type: 'int', default: reciept_and_payment_accounting_setting_enum_1.UsedEntryType.Cheque }),
    __metadata("design:type", Number)
], RecieptAndPaymentAccountingSetting.prototype, "usedEntryType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'operationType', type: 'int', default: reciept_and_payment_accounting_setting_enum_1.RapOperationType.Receipt }),
    __metadata("design:type", Number)
], RecieptAndPaymentAccountingSetting.prototype, "operationType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'detailedType', type: 'int', default: reciept_and_payment_accounting_setting_enum_1.RapDetailedType.Party }),
    __metadata("design:type", Number)
], RecieptAndPaymentAccountingSetting.prototype, "detailedType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'termType', type: 'int', default: reciept_and_payment_accounting_setting_enum_1.TermType.LongTerm }),
    __metadata("design:type", Number)
], RecieptAndPaymentAccountingSetting.prototype, "termType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'isDefault', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], RecieptAndPaymentAccountingSetting.prototype, "isDefault", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'isActive', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], RecieptAndPaymentAccountingSetting.prototype, "isActive", void 0);
exports.RecieptAndPaymentAccountingSetting = RecieptAndPaymentAccountingSetting = __decorate([
    (0, typeorm_1.Entity)('RecieptAndPaymentAccountingSetting', { schema: 'Rap' })
], RecieptAndPaymentAccountingSetting);
//# sourceMappingURL=reciept-and-payment-accounting-setting.entity.js.map