"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePettyCashDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_petty_cash_dto_1 = require("./create-petty-cash.dto");
class UpdatePettyCashDto extends (0, mapped_types_1.PartialType)(create_petty_cash_dto_1.CreatePettyCashDto) {
}
exports.UpdatePettyCashDto = UpdatePettyCashDto;
//# sourceMappingURL=update-petty-cash.dto.js.map