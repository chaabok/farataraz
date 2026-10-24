import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PettyCashSummary } from './petty-cash-summary.entity';
import { RapReason } from './rap-reason.entity';
export declare class PettyCashSummaryItem extends AppBaseEntity {
    pettyCashSummaryItemId: number;
    pettyCashSummaryRef: number;
    pettyCashSummary: PettyCashSummary;
    reasonRef: number;
    reason: RapReason;
    paymentReceiptNumber: string;
    paymentReceiptDate: Date;
    amount: number;
    description: string;
}
