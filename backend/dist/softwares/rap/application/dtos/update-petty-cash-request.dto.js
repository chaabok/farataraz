"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePettyCashRequestDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_petty_cash_request_dto_1 = require("./create-petty-cash-request.dto");
class UpdatePettyCashRequestDto extends (0, mapped_types_1.PartialType)(create_petty_cash_request_dto_1.CreatePettyCashRequestDto) {
}
exports.UpdatePettyCashRequestDto = UpdatePettyCashRequestDto;
//# sourceMappingURL=update-petty-cash-request.dto.js.map