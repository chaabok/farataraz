"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBankReconciliationDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_bank_reconciliation_dto_1 = require("./create-bank-reconciliation.dto");
class UpdateBankReconciliationDto extends (0, mapped_types_1.PartialType)(create_bank_reconciliation_dto_1.CreateBankReconciliationDto) {
}
exports.UpdateBankReconciliationDto = UpdateBankReconciliationDto;
//# sourceMappingURL=update-bank-reconciliation.dto.js.map