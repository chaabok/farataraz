import { ReceiptNotification } from '../../domain/entities/receipt-notification.entity';
import { CreateReceiptNotificationDto } from '../../application/dtos/create-receipt-notification.dto';
import { UpdateReceiptNotificationDto } from '../../application/dtos/update-receipt-notification.dto';
export declare const IReceiptNotificationRepositoryToken: unique symbol;
export interface IReceiptNotificationRepository {
    findAll(businessStructureId: number, companyId: number): Promise<ReceiptNotification[]>;
    findById(id: number, businessStructureId: number, companyId: number): Promise<ReceiptNotification | null>;
    calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
    getAvailableCheques(businessStructureId: number, companyId: number, operationType?: string, bankAccountRef?: number): Promise<any[]>;
    getAvailableChequesForAssignment(businessStructureId: number, companyId: number): Promise<any[]>;
    getAssignedCheques(businessStructureId: number, companyId: number, partyRef?: string): Promise<any[]>;
    getPaidChequesByParty(businessStructureId: number, companyId: number, partyRef?: string): Promise<any[]>;
    getPaidPromissoryNotesByParty(businessStructureId: number, companyId: number, partyRef?: string): Promise<any[]>;
    getReturnableCheques(businessStructureId: number, companyId: number, partyRef?: string, excludeIds?: string): Promise<any[]>;
    getReturnablePromissoryNotes(businessStructureId: number, companyId: number, partyRef?: string, excludeIds?: string): Promise<any[]>;
    create(data: CreateReceiptNotificationDto, businessStructureId: number, companyId: number): Promise<ReceiptNotification>;
    update(id: number, data: UpdateReceiptNotificationDto, businessStructureId: number, companyId: number): Promise<ReceiptNotification>;
    remove(id: number, businessStructureId: number, companyId: number): Promise<void>;
}
