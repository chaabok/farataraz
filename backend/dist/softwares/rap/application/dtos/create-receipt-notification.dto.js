"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptGuaranteeDto = exports.CreateReceiptNotificationDto = exports.ReceiptReturnedPaymentPromissoryNoteDto = exports.ReceiptReturnedPaymentAssignmentDto = exports.ReceiptPromissoryNoteDto = exports.ReceiptReturnedPaidChequeDto = exports.ReceiptDepositDto = exports.ReceiptChequeDto = exports.ReceiptCashDto = void 0;
exports.toEnglishDigits = toEnglishDigits;
exports.parseDateString = parseDateString;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const moment_jalaali_1 = __importDefault(require("moment-jalaali"));
const moment_hijri_1 = __importDefault(require("moment-hijri"));
const fs = __importStar(require("fs"));
function toEnglishDigits(str) {
    if (typeof str !== 'string')
        return str;
    const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
    const arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
    for (let i = 0; i < 10; i++) {
        str = str.replace(persianNumbers[i], String(i)).replace(arabicNumbers[i], String(i));
    }
    return str;
}
function parseDateString({ value }) {
    try {
        fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] parseDateString received: ${JSON.stringify(value)} (type: ${typeof value})\n`);
    }
    catch (e) { }
    if (!value) {
        try {
            fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] returning falsy value: ${JSON.stringify(value)}\n`);
        }
        catch (e) { }
        return value;
    }
    if (value instanceof Date) {
        try {
            fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] returning Date instance: ${value.toISOString()}\n`);
        }
        catch (e) { }
        return value;
    }
    if (typeof value === 'string') {
        value = toEnglishDigits(value);
        if (value.includes('T') && value.endsWith('Z')) {
            const d = new Date(value);
            try {
                fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] ISO String returning: ${d.toISOString()}\n`);
            }
            catch (e) { }
            return d;
        }
        const match = value.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
        if (match) {
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10);
            const day = parseInt(match[3], 10);
            if (year >= 1300 && year <= 1499) {
                if (year > 1415 && year <= 1499) {
                    const hDate = (0, moment_hijri_1.default)(`${year}/${month}/${day}`, 'iYYYY/iM/iD');
                    if (hDate.isValid()) {
                        const d = hDate.toDate();
                        try {
                            fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] Hijri returning: ${d.toISOString()}\n`);
                        }
                        catch (e) { }
                        return d;
                    }
                }
                else {
                    const jDate = (0, moment_jalaali_1.default)(`${year}/${month}/${day}`, 'jYYYY/jM/jD');
                    if (jDate.isValid()) {
                        const d = jDate.toDate();
                        try {
                            fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] Jalaali returning: ${d.toISOString()}\n`);
                        }
                        catch (e) { }
                        return d;
                    }
                }
            }
            else {
                const d = new Date(value);
                if (!isNaN(d.getTime())) {
                    try {
                        fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] standard date returning: ${d.toISOString()}\n`);
                    }
                    catch (e) { }
                    return d;
                }
            }
        }
        const fallBack = new Date(value);
        if (!isNaN(fallBack.getTime())) {
            try {
                fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] fallback date returning: ${fallBack.toISOString()}\n`);
            }
            catch (e) { }
            return fallBack;
        }
    }
    try {
        fs.appendFileSync('/app/applet/backend_debug.log', `[RECEIPT DTO] fallback original returning: ${JSON.stringify(value)}\n`);
    }
    catch (e) { }
    return value;
}
class ReceiptCashDto {
}
exports.ReceiptCashDto = ReceiptCashDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptCashDto.prototype, "receiptCashId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptCashDto.prototype, "receiptNotificationRef", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptCashDto.prototype, "cashRef", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptCashDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptCashDto.prototype, "accountingSettingRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptCashDto.prototype, "equivalentAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptCashDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ReceiptCashDto.prototype, "dynamicDetailedData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptCashDto.prototype, "reasonRef", void 0);
class ReceiptChequeDto {
}
exports.ReceiptChequeDto = ReceiptChequeDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptChequeDto.prototype, "receiptChequeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptChequeDto.prototype, "receiptNotificationRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptChequeDto.prototype, "accountingSettingRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptChequeDto.prototype, "bankRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptChequeDto.prototype, "cashRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptChequeDto.prototype, "branchName", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptChequeDto.prototype, "accountNumber", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptChequeDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptChequeDto.prototype, "chequeNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Object)
], ReceiptChequeDto.prototype, "dueDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptChequeDto.prototype, "sayyadNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptChequeDto.prototype, "endorsementNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptChequeDto.prototype, "currency", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptChequeDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ReceiptChequeDto.prototype, "dynamicDetailedData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptChequeDto.prototype, "reasonRef", void 0);
class ReceiptDepositDto {
}
exports.ReceiptDepositDto = ReceiptDepositDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptDepositDto.prototype, "receiptDepositId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptDepositDto.prototype, "receiptNotificationRef", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptDepositDto.prototype, "bankAccountRef", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptDepositDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptDepositDto.prototype, "trackingNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptDepositDto.prototype, "equivalentAmount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptDepositDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ReceiptDepositDto.prototype, "dynamicDetailedData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptDepositDto.prototype, "reasonRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptDepositDto.prototype, "accountingSettingRef", void 0);
class ReceiptReturnedPaidChequeDto {
}
exports.ReceiptReturnedPaidChequeDto = ReceiptReturnedPaidChequeDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptReturnedPaidChequeDto.prototype, "receiptReturnedPaidChequeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptReturnedPaidChequeDto.prototype, "paymentChequeRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptReturnedPaidChequeDto.prototype, "cashRef", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptReturnedPaidChequeDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptReturnedPaidChequeDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ReceiptReturnedPaidChequeDto.prototype, "dynamicDetailedData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptReturnedPaidChequeDto.prototype, "reasonRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptReturnedPaidChequeDto.prototype, "accountingSettingRef", void 0);
class ReceiptPromissoryNoteDto {
}
exports.ReceiptPromissoryNoteDto = ReceiptPromissoryNoteDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptPromissoryNoteDto.prototype, "receiptPromissoryNoteId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptPromissoryNoteDto.prototype, "receiptNotificationRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptPromissoryNoteDto.prototype, "accountingSettingRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptPromissoryNoteDto.prototype, "cashRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptPromissoryNoteDto.prototype, "reasonRef", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptPromissoryNoteDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptPromissoryNoteDto.prototype, "promissoryNoteNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptPromissoryNoteDto.prototype, "promissoryNoteValue", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptPromissoryNoteDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ReceiptPromissoryNoteDto.prototype, "dynamicDetailedData", void 0);
class ReceiptReturnedPaymentAssignmentDto {
}
exports.ReceiptReturnedPaymentAssignmentDto = ReceiptReturnedPaymentAssignmentDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptReturnedPaymentAssignmentDto.prototype, "receiptReturnedPaymentAssignmentId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptReturnedPaymentAssignmentDto.prototype, "paymentAssignmentRef", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptReturnedPaymentAssignmentDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptReturnedPaymentAssignmentDto.prototype, "cashRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptReturnedPaymentAssignmentDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ReceiptReturnedPaymentAssignmentDto.prototype, "dynamicDetailedData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptReturnedPaymentAssignmentDto.prototype, "reasonRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptReturnedPaymentAssignmentDto.prototype, "accountingSettingRef", void 0);
class ReceiptReturnedPaymentPromissoryNoteDto {
}
exports.ReceiptReturnedPaymentPromissoryNoteDto = ReceiptReturnedPaymentPromissoryNoteDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptReturnedPaymentPromissoryNoteDto.prototype, "receiptReturnedPaymentPromissoryNoteId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptReturnedPaymentPromissoryNoteDto.prototype, "paymentPromissoryNoteRef", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptReturnedPaymentPromissoryNoteDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptReturnedPaymentPromissoryNoteDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ReceiptReturnedPaymentPromissoryNoteDto.prototype, "dynamicDetailedData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptReturnedPaymentPromissoryNoteDto.prototype, "reasonRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptReturnedPaymentPromissoryNoteDto.prototype, "accountingSettingRef", void 0);
class CreateReceiptNotificationDto {
}
exports.CreateReceiptNotificationDto = CreateReceiptNotificationDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReceiptNotificationDto.prototype, "baseType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReceiptNotificationDto.prototype, "baseNumber", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReceiptNotificationDto.prototype, "receiptType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReceiptNotificationDto.prototype, "documentNumber", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_transformer_1.Transform)(parseDateString),
    (0, class_validator_1.IsDate)(),
    __metadata("design:type", Date)
], CreateReceiptNotificationDto.prototype, "documentDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateReceiptNotificationDto.prototype, "partyRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateReceiptNotificationDto.prototype, "voucherHeaderRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateReceiptNotificationDto.prototype, "currencyRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateReceiptNotificationDto.prototype, "exchangeRate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateReceiptNotificationDto.prototype, "reasonRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateReceiptNotificationDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateReceiptNotificationDto.prototype, "dynamicDetailedData", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateReceiptNotificationDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateReceiptNotificationDto.prototype, "fiscalYearRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReceiptCashDto),
    __metadata("design:type", Array)
], CreateReceiptNotificationDto.prototype, "cashItems", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReceiptChequeDto),
    __metadata("design:type", Array)
], CreateReceiptNotificationDto.prototype, "chequeItems", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReceiptDepositDto),
    __metadata("design:type", Array)
], CreateReceiptNotificationDto.prototype, "depositItems", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReceiptReturnedPaidChequeDto),
    __metadata("design:type", Array)
], CreateReceiptNotificationDto.prototype, "returnedPaymentChequesItems", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReceiptReturnedPaymentAssignmentDto),
    __metadata("design:type", Array)
], CreateReceiptNotificationDto.prototype, "returnedPaymentAssignments", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReceiptReturnedPaymentPromissoryNoteDto),
    __metadata("design:type", Array)
], CreateReceiptNotificationDto.prototype, "returnedPaymentPromissoryNotes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReceiptPromissoryNoteDto),
    __metadata("design:type", Array)
], CreateReceiptNotificationDto.prototype, "promissoryNoteItems", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ReceiptGuaranteeDto),
    __metadata("design:type", Array)
], CreateReceiptNotificationDto.prototype, "guaranteeItems", void 0);
class ReceiptGuaranteeDto {
}
exports.ReceiptGuaranteeDto = ReceiptGuaranteeDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptGuaranteeDto.prototype, "receiptGuaranteeId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptGuaranteeDto.prototype, "receiptNotificationRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptGuaranteeDto.prototype, "accountingSettingRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptGuaranteeDto.prototype, "cashRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptGuaranteeDto.prototype, "reasonRef", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptGuaranteeDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptGuaranteeDto.prototype, "guaranteeNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptGuaranteeDto.prototype, "guaranteeType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptGuaranteeDto.prototype, "baseDocument", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptGuaranteeDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], ReceiptGuaranteeDto.prototype, "bankRef", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReceiptGuaranteeDto.prototype, "accountNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], ReceiptGuaranteeDto.prototype, "notificationDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], ReceiptGuaranteeDto.prototype, "dynamicDetailedData", void 0);
//# sourceMappingURL=create-receipt-notification.dto.js.map