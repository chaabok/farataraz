import { PaymentNotification } from '../../domain/entities/payment-notification.entity';
import { CreatePaymentNotificationDto } from '../../application/dtos/create-payment-notification.dto';
import { UpdatePaymentNotificationDto } from '../../application/dtos/update-payment-notification.dto';
export declare const IPaymentNotificationRepositoryToken: unique symbol;
export interface IPaymentNotificationRepository {
    findAll(businessStructureId: number, companyId: number): Promise<PaymentNotification[]>;
    findById(id: number, businessStructureId: number, companyId: number): Promise<PaymentNotification | null>;
    findPayableCheques(businessStructureId: number, companyId: number): Promise<any[]>;
    findPayablePromissoryNotes(businessStructureId: number, companyId: number): Promise<any[]>;
    calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
    create(data: CreatePaymentNotificationDto, businessStructureId: number, companyId: number): Promise<PaymentNotification>;
    update(id: number, data: UpdatePaymentNotificationDto, businessStructureId: number, companyId: number): Promise<PaymentNotification>;
    remove(id: number, businessStructureId: number, companyId: number): Promise<void>;
}
