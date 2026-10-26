import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ClosingTemporaryAccount } from './closing-temporary-account.entity';
export declare class ClosingTemporaryAccountItem extends AppBaseEntity {
    id: number;
    closingTemporaryAccountRef: number;
    parent: ClosingTemporaryAccount;
    intermediaryAccountRef: number | null;
    intermediaryCode: string;
    percentage: number;
    detailedAccountRef1: number | null;
    detailedAccountRef2: number | null;
    detailedAccountRef3: number | null;
}
