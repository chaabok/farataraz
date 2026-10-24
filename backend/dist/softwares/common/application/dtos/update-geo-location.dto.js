"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateGeoLocationDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_geo_location_dto_1 = require("./create-geo-location.dto");
class UpdateGeoLocationDto extends (0, mapped_types_1.PartialType)(create_geo_location_dto_1.CreateGeoLocationDto) {
}
exports.UpdateGeoLocationDto = UpdateGeoLocationDto;
//# sourceMappingURL=update-geo-location.dto.js.map