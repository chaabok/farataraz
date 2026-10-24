import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { VoucherItem } from './voucher-item.entity';
export declare class Voucher extends AppBaseEntity {
    voucherId: number;
    voucherTypeId: number;
    voucherNumber: number;
    voucherDate: Date;
    description: string;
    referenceNumber: string;
    subNumber: string;
    voucherNature: string;
    description2: string;
    sourceDocDate: Date;
    dailyNumber: number;
    totalDebit: number;
    totalCredit: number;
    status: number;
    previousStatus: number;
    fiscalYearRef: number;
    items: VoucherItem[];
    voucherType?: any;
    creatorName?: string;
    voucherTypeTitle?: string;
}
