import { DocumentAccountingInfoService } from './document-accounting-info.service';
import { IReceiptNotificationRepository } from '../../domain/repositories/receipt-notification.repository.interface';
import { CreateReceiptNotificationDto } from '../dtos/create-receipt-notification.dto';
import { UpdateReceiptNotificationDto } from '../dtos/update-receipt-notification.dto';
import { AutoVoucherService } from './auto-voucher.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class ReceiptNotificationService {
    private readonly repository;
    private readonly requestContextService;
    private readonly autoVoucherService;
    private readonly documentAccountingInfoService;
    constructor(repository: IReceiptNotificationRepository, requestContextService: RequestContextService, autoVoucherService: AutoVoucherService, documentAccountingInfoService: DocumentAccountingInfoService);
    private getScope;
    findAll(): Promise<import("../../domain/entities/receipt-notification.entity").ReceiptNotification[]>;
    findOne(id: number): Promise<import("../../domain/entities/receipt-notification.entity").ReceiptNotification>;
    getNextNumbers(jalaliDateStr: string): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error: string;
    }>;
    getAvailableCheques(operationType?: string, bankAccountRef?: number): Promise<any[]>;
    getAvailableChequesForAssignment(): Promise<any[]>;
    getAssignedCheques(partyRef?: string): Promise<any[]>;
    getPaidChequesByParty(partyRef?: string): Promise<any[]>;
    getPaidPromissoryNotesByParty(partyRef?: string): Promise<any[]>;
    getReturnableCheques(partyRef?: string, excludeIds?: string): Promise<any[]>;
    getReturnablePromissoryNotes(partyRef?: string, excludeIds?: string): Promise<any[]>;
    create(createReceiptNotificationDto: CreateReceiptNotificationDto): Promise<import("../../domain/entities/receipt-notification.entity").ReceiptNotification>;
    update(id: number, updateReceiptNotificationDto: UpdateReceiptNotificationDto): Promise<import("../../domain/entities/receipt-notification.entity").ReceiptNotification>;
    remove(id: number): Promise<void>;
}
