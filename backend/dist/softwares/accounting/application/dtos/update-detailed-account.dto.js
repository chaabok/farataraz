"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDetailedAccountDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_detailed_account_dto_1 = require("./create-detailed-account.dto");
class UpdateDetailedAccountDto extends (0, mapped_types_1.PartialType)(create_detailed_account_dto_1.CreateDetailedAccountDto) {
}
exports.UpdateDetailedAccountDto = UpdateDetailedAccountDto;
//# sourceMappingURL=update-detailed-account.dto.js.map