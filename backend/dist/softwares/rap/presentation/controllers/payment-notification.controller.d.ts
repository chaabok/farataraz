import { PaymentNotificationService } from '../../application/services/payment-notification.service';
import { CreatePaymentNotificationDto } from '../../application/dtos/create-payment-notification.dto';
import { UpdatePaymentNotificationDto } from '../../application/dtos/update-payment-notification.dto';
export declare class PaymentNotificationController {
    private readonly paymentNotificationService;
    constructor(paymentNotificationService: PaymentNotificationService);
    create(createPaymentNotificationDto: CreatePaymentNotificationDto): Promise<import("../../domain/entities/payment-notification.entity").PaymentNotification>;
    findAll(): Promise<import("../../domain/entities/payment-notification.entity").PaymentNotification[]>;
    getNextNumbers(date: string): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error: string;
    }>;
    getPayableCheques(): Promise<any[]>;
    getPayablePromissoryNotes(): Promise<any[]>;
    findOne(id: number): Promise<import("../../domain/entities/payment-notification.entity").PaymentNotification>;
    update(id: number, updatePaymentNotificationDto: UpdatePaymentNotificationDto): Promise<import("../../domain/entities/payment-notification.entity").PaymentNotification>;
    remove(id: number): Promise<void>;
}
