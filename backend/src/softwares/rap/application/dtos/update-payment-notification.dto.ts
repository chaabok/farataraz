import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentNotificationDto } from './create-payment-notification.dto';

export class UpdatePaymentNotificationDto extends PartialType(CreatePaymentNotificationDto) {}
