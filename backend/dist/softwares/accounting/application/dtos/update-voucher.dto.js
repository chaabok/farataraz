"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateVoucherDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_voucher_dto_1 = require("./create-voucher.dto");
class UpdateVoucherDto extends (0, mapped_types_1.PartialType)(create_voucher_dto_1.CreateVoucherDto) {
}
exports.UpdateVoucherDto = UpdateVoucherDto;
//# sourceMappingURL=update-voucher.dto.js.map