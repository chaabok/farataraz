"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateFiscalYearDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_fiscal_year_dto_1 = require("./create-fiscal-year.dto");
class UpdateFiscalYearDto extends (0, mapped_types_1.PartialType)(create_fiscal_year_dto_1.CreateFiscalYearDto) {
}
exports.UpdateFiscalYearDto = UpdateFiscalYearDto;
//# sourceMappingURL=update-fiscal-year.dto.js.map