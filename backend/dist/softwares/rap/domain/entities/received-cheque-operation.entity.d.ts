import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { BankAccount } from './bank-account.entity';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';
import { Voucher } from '../../../accounting/domain/entities/voucher.entity';
import { ReceivedChequeOperationItem } from './received-cheque-operation-item.entity';
export declare class ReceivedChequeOperation extends AppBaseEntity {
    receivedChequeOperationId: number;
    operationType: number;
    documentNumber: string;
    documentDate: string;
    assignmentNumber: string;
    status: number;
    bankAccountRef: number | null;
    bankAccount: BankAccount;
    realizerRef: number | null;
    realizer: DetailedAccount;
    voucherHeaderRef: number | null;
    voucherHeader: Voucher;
    items: ReceivedChequeOperationItem[];
    fiscalYearRef: number;
}
