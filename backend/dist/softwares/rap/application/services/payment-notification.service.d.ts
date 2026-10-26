import { DocumentAccountingInfoService } from './document-accounting-info.service';
import { IPaymentNotificationRepository } from '../../domain/repositories/payment-notification.repository.interface';
import { CreatePaymentNotificationDto } from '../dtos/create-payment-notification.dto';
import { UpdatePaymentNotificationDto } from '../dtos/update-payment-notification.dto';
import { AutoVoucherService } from './auto-voucher.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class PaymentNotificationService {
    private readonly repository;
    private readonly requestContextService;
    private readonly autoVoucherService;
    private readonly documentAccountingInfoService;
    constructor(repository: IPaymentNotificationRepository, requestContextService: RequestContextService, autoVoucherService: AutoVoucherService, documentAccountingInfoService: DocumentAccountingInfoService);
    private getScope;
    findAll(): Promise<import("../../domain/entities/payment-notification.entity").PaymentNotification[]>;
    findOne(id: number): Promise<import("../../domain/entities/payment-notification.entity").PaymentNotification>;
    getNextNumbers(jalaliDateStr: string): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error: string;
    }>;
    getPayableCheques(): Promise<any[]>;
    getPayablePromissoryNotes(): Promise<any[]>;
    create(createPaymentNotificationDto: CreatePaymentNotificationDto): Promise<import("../../domain/entities/payment-notification.entity").PaymentNotification>;
    update(id: number, updatePaymentNotificationDto: UpdatePaymentNotificationDto): Promise<import("../../domain/entities/payment-notification.entity").PaymentNotification>;
    remove(id: number): Promise<void>;
}
