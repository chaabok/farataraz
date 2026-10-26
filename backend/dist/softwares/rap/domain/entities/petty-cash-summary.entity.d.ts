import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PettyCash } from './petty-cash.entity';
import { PettyCashSummaryState } from './petty-cash-summary.enum';
import { PettyCashSummaryItem } from './petty-cash-summary-item.entity';
import { Voucher } from '../../../accounting/domain/entities/voucher.entity';
export declare class PettyCashSummary extends AppBaseEntity {
    pettyCashSummaryId: number;
    pettyCashRef: number;
    pettyCash: PettyCash;
    number: number;
    date: Date;
    description: string;
    fiscalYearRef: number;
    state: PettyCashSummaryState;
    voucherHeaderRef: number | null;
    voucherHeader?: Voucher;
    items: PettyCashSummaryItem[];
}
