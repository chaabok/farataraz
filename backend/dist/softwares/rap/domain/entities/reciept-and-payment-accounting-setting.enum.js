"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermType = exports.RapDetailedType = exports.RapOperationType = exports.UsedEntryType = void 0;
var UsedEntryType;
(function (UsedEntryType) {
    UsedEntryType[UsedEntryType["Cheque"] = 1] = "Cheque";
    UsedEntryType[UsedEntryType["PromissoryNote"] = 2] = "PromissoryNote";
    UsedEntryType[UsedEntryType["Cash"] = 3] = "Cash";
    UsedEntryType[UsedEntryType["Credit"] = 4] = "Credit";
    UsedEntryType[UsedEntryType["DepositNotification"] = 5] = "DepositNotification";
    UsedEntryType[UsedEntryType["POS"] = 6] = "POS";
    UsedEntryType[UsedEntryType["Withdrawal"] = 7] = "Withdrawal";
    UsedEntryType[UsedEntryType["Guarantee"] = 8] = "Guarantee";
})(UsedEntryType || (exports.UsedEntryType = UsedEntryType = {}));
var RapOperationType;
(function (RapOperationType) {
    RapOperationType[RapOperationType["Receipt"] = 1] = "Receipt";
    RapOperationType[RapOperationType["Payment"] = 2] = "Payment";
    RapOperationType[RapOperationType["Legalize"] = 3] = "Legalize";
    RapOperationType[RapOperationType["ProtestWithoutAction"] = 4] = "ProtestWithoutAction";
    RapOperationType[RapOperationType["CashToCash"] = 5] = "CashToCash";
    RapOperationType[RapOperationType["AssignToBank"] = 6] = "AssignToBank";
    RapOperationType[RapOperationType["Collection"] = 7] = "Collection";
    RapOperationType[RapOperationType["Protest"] = 8] = "Protest";
    RapOperationType[RapOperationType["ChangeTerm"] = 9] = "ChangeTerm";
    RapOperationType[RapOperationType["Guarantee"] = 10] = "Guarantee";
    RapOperationType[RapOperationType["Cashing"] = 11] = "Cashing";
})(RapOperationType || (exports.RapOperationType = RapOperationType = {}));
var RapDetailedType;
(function (RapDetailedType) {
    RapDetailedType[RapDetailedType["Party"] = 1] = "Party";
    RapDetailedType[RapDetailedType["CashRegister"] = 2] = "CashRegister";
    RapDetailedType[RapDetailedType["BankAccount"] = 3] = "BankAccount";
})(RapDetailedType || (exports.RapDetailedType = RapDetailedType = {}));
var TermType;
(function (TermType) {
    TermType[TermType["Current"] = 1] = "Current";
    TermType[TermType["ShortTerm"] = 2] = "ShortTerm";
    TermType[TermType["LongTerm"] = 3] = "LongTerm";
    TermType[TermType["None"] = 4] = "None";
})(TermType || (exports.TermType = TermType = {}));
//# sourceMappingURL=reciept-and-payment-accounting-setting.enum.js.map