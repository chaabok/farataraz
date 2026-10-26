"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePartyDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_party_dto_1 = require("./create-party.dto");
class UpdatePartyDto extends (0, mapped_types_1.PartialType)(create_party_dto_1.CreatePartyDto) {
}
exports.UpdatePartyDto = UpdatePartyDto;
//# sourceMappingURL=update-party.dto.js.map