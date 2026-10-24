import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PaidDocumentClearingItem } from './paid-document-clearing-item.entity';
import { BankAccount } from './bank-account.entity';
import { Voucher } from '../../../accounting/domain/entities/voucher.entity';
export declare class PaidDocumentClearing extends AppBaseEntity {
    paidDocumentClearingId: number;
    number: string;
    date: string;
    description: string;
    status: number;
    fiscalYearRef: number;
    bankAccountRef: number;
    bankAccount: BankAccount;
    voucherHeaderRef: number | null;
    voucherHeader: Voucher;
    items: PaidDocumentClearingItem[];
}
