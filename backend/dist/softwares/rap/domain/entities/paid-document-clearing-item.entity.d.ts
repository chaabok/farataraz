import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PaidDocumentClearing } from './paid-document-clearing.entity';
export declare class PaidDocumentClearingItem extends AppBaseEntity {
    paidDocumentClearingItemId: number;
    paidDocumentClearingRef: number;
    paidDocumentClearing: PaidDocumentClearing;
    documentType: string;
    documentId: number;
}
