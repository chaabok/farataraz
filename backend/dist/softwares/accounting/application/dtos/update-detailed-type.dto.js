"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDetailedTypeDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_detailed_type_dto_1 = require("./create-detailed-type.dto");
class UpdateDetailedTypeDto extends (0, mapped_types_1.PartialType)(create_detailed_type_dto_1.CreateDetailedTypeDto) {
}
exports.UpdateDetailedTypeDto = UpdateDetailedTypeDto;
//# sourceMappingURL=update-detailed-type.dto.js.map