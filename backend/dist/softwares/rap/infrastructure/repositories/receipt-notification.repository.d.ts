import { Repository } from 'typeorm';
import { ReceiptNotification } from '../../domain/entities/receipt-notification.entity';
import { IReceiptNotificationRepository } from '../../domain/repositories/receipt-notification.repository.interface';
import { CreateReceiptNotificationDto } from '../../application/dtos/create-receipt-notification.dto';
import { UpdateReceiptNotificationDto } from '../../application/dtos/update-receipt-notification.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
export declare class ReceiptNotificationRepository implements IReceiptNotificationRepository {
    private readonly typeOrmRepo;
    private readonly idGenService;
    constructor(typeOrmRepo: Repository<ReceiptNotification>, idGenService: IdGenerationService);
    findAll(businessStructureId: number, companyId: number): Promise<ReceiptNotification[]>;
    findById(id: number, businessStructureId: number, companyId: number): Promise<ReceiptNotification | null>;
    calculateNextDocumentNumber(dateStr: string, businessStructureId: number, companyId: number): Promise<{
        numberingMethod: string;
        nextValue: string;
        error?: string;
    }>;
    getAssignedCheques(businessStructureId: number, companyId: number, partyRef?: string): Promise<any[]>;
    getAvailableCheques(businessStructureId: number, companyId: number, operationType?: string, bankAccountRef?: number): Promise<any[]>;
    getAvailableChequesForAssignment(businessStructureId: number, companyId: number): Promise<any[]>;
    getReturnableCheques(businessStructureId: number, companyId: number, partyRef?: string, excludeIds?: string): Promise<any[]>;
    getReturnablePromissoryNotes(businessStructureId: number, companyId: number, partyRef?: string, excludeIds?: string): Promise<any[]>;
    getPaidChequesByParty(businessStructureId: number, companyId: number, partyRef?: string): Promise<any[]>;
    getPaidPromissoryNotesByParty(businessStructureId: number, companyId: number, partyRef?: string): Promise<any[]>;
    create(data: CreateReceiptNotificationDto, businessStructureId: number, companyId: number): Promise<ReceiptNotification>;
    update(id: number, data: UpdateReceiptNotificationDto, businessStructureId: number, companyId: number): Promise<ReceiptNotification>;
    remove(id: number, businessStructureId: number, companyId: number): Promise<void>;
}
