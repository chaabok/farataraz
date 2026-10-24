import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { DetailedAccount } from './detailed-account.entity';
import { CostCenterType } from './cost-center.enum';
export declare class CostCenter extends AppBaseEntity {
    costCenterId: number;
    code: string;
    title: string;
    title_en: string;
    costCenterType: CostCenterType;
    detailedAccountId: number;
    detailedAccount: DetailedAccount;
    isActive: boolean;
    description: string;
}
