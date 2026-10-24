import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ClosingTemporaryAccountItem } from './closing-temporary-account-item.entity';
import { ClosingTemporaryAccountSelected } from './closing-temporary-account-selected.entity';
export declare class ClosingTemporaryAccount extends AppBaseEntity {
    id: number;
    description: string;
    toDate: string;
    type: string;
    status: string;
    voucherRef: number | null;
    items: ClosingTemporaryAccountItem[];
    selectedAccounts: ClosingTemporaryAccountSelected[];
}
