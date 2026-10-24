import { ReceiptNotificationService } from '../../application/services/receipt-notification.service';
import { CreateReceiptNotificationDto } from '../../application/dtos/create-receipt-notification.dto';
import { UpdateReceiptNotificationDto } from '../../application/dtos/update-receipt-notification.dto';
export declare class ReceiptNotificationController {
    private readonly receiptNotificationService;
    constructor(receiptNotificationService: ReceiptNotificationService);
    create(createReceiptNotificationDto: CreateReceiptNotificationDto): Promise<import("../../domain/entities/receipt-notification.entity").ReceiptNotification>;
    findAll(): Promise<import("../../domain/entities/receipt-notification.entity").ReceiptNotification[]>;
    getNextNumbers(date: string): Promise<{
        documentNumber: string;
        isDocumentNumberAuto: boolean;
        error: string;
    }>;
    getAvailableCheques(operationType?: string, bankAccountRef?: string): Promise<any[]>;
    getAvailableChequesForTransfer(): Promise<any[]>;
    getAssignedCheques(partyRef?: string): Promise<any[]>;
    getPaidChequesByParty(partyRef?: string): Promise<any[]>;
    getPaidPromissoryNotesByParty(partyRef?: string): Promise<any[]>;
    getReturnableCheques(partyRef?: string, excludeIds?: string): Promise<any[]>;
    getReturnablePromissoryNotes(partyRef?: string, excludeIds?: string): Promise<any[]>;
    findOne(id: number): Promise<import("../../domain/entities/receipt-notification.entity").ReceiptNotification>;
    update(id: number, updateReceiptNotificationDto: UpdateReceiptNotificationDto): Promise<import("../../domain/entities/receipt-notification.entity").ReceiptNotification>;
    remove(id: number): Promise<void>;
}
