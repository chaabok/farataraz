import { PartialType } from '@nestjs/mapped-types';
import { CreateReceiptNotificationDto } from './create-receipt-notification.dto';

export class UpdateReceiptNotificationDto extends PartialType(CreateReceiptNotificationDto) {}
