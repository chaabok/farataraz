"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBankBranchDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_bank_branch_dto_1 = require("./create-bank-branch.dto");
class UpdateBankBranchDto extends (0, mapped_types_1.PartialType)(create_bank_branch_dto_1.CreateBankBranchDto) {
}
exports.UpdateBankBranchDto = UpdateBankBranchDto;
//# sourceMappingURL=update-bank-branch.dto.js.map