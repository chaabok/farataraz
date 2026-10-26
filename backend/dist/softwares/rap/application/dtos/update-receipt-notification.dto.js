"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateReceiptNotificationDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_receipt_notification_dto_1 = require("./create-receipt-notification.dto");
class UpdateReceiptNotificationDto extends (0, mapped_types_1.PartialType)(create_receipt_notification_dto_1.CreateReceiptNotificationDto) {
}
exports.UpdateReceiptNotificationDto = UpdateReceiptNotificationDto;
//# sourceMappingURL=update-receipt-notification.dto.js.map