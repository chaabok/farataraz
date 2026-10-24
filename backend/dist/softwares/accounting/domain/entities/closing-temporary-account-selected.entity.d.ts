import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ClosingTemporaryAccount } from './closing-temporary-account.entity';
export declare class ClosingTemporaryAccountSelected extends AppBaseEntity {
    id: number;
    closingTemporaryAccountRef: number;
    parent: ClosingTemporaryAccount;
    accountRef: number | null;
    accountCode: string;
    accountTitle: string;
    detailedAccountRef: number | null;
}
