"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChequebookItemDto = exports.UpdateChequebookDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_chequebook_dto_1 = require("./create-chequebook.dto");
Object.defineProperty(exports, "ChequebookItemDto", { enumerable: true, get: function () { return create_chequebook_dto_1.ChequebookItemDto; } });
class UpdateChequebookDto extends (0, mapped_types_1.PartialType)(create_chequebook_dto_1.CreateChequebookDto) {
}
exports.UpdateChequebookDto = UpdateChequebookDto;
//# sourceMappingURL=update-chequebook.dto.js.map