"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePaymentGatewayDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_payment_gateway_dto_1 = require("./create-payment-gateway.dto");
class UpdatePaymentGatewayDto extends (0, mapped_types_1.PartialType)(create_payment_gateway_dto_1.CreatePaymentGatewayDto) {
}
exports.UpdatePaymentGatewayDto = UpdatePaymentGatewayDto;
//# sourceMappingURL=update-payment-gateway.dto.js.map