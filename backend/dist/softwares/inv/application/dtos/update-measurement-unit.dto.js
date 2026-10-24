"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateMeasurementUnitDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_measurement_unit_dto_1 = require("./create-measurement-unit.dto");
class UpdateMeasurementUnitDto extends (0, mapped_types_1.PartialType)(create_measurement_unit_dto_1.CreateMeasurementUnitDto) {
}
exports.UpdateMeasurementUnitDto = UpdateMeasurementUnitDto;
//# sourceMappingURL=update-measurement-unit.dto.js.map