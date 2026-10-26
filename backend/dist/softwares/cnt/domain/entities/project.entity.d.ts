import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';
export declare class Project extends AppBaseEntity {
    projectId: number;
    code: string;
    title: string;
    titleEn: string;
    detailedAccountCode: string;
    detailedAccountId: number;
    detailedAccount: DetailedAccount;
    isActive: boolean;
}
