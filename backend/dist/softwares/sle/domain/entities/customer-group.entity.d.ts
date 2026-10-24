import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';
export declare class CustomerGroup extends AppBaseEntity {
    CustomerGroupID: number;
    Code: string;
    Title: string;
    Title2: string;
    DetailedAccountRef: number | null;
    detailedAccount?: DetailedAccount;
    Description: string;
    IsMandatory: boolean;
    ParentRef: number | null;
    parent?: CustomerGroup;
    children?: CustomerGroup[];
}
