import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { PettyCash } from './petty-cash.entity';
import { PettyCashSummary } from './petty-cash-summary.entity';
export declare class PettyCashRequest extends AppBaseEntity {
    pettyCashRequestId: number;
    pettyCashRef: number;
    pettyCash: PettyCash;
    requestNumber: string;
    requestDate: Date;
    basis: number;
    pettyCashSummaryRef: number;
    pettyCashSummary: PettyCashSummary;
    status: number;
    requestedAmount: number;
    description: string;
    fiscalYearRef: number;
}
