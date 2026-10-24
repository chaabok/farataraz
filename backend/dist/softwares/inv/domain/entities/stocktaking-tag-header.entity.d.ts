import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { StocktakingSetting } from './stocktaking-setting.entity';
import { Party } from '../../../common/domain/entities/party.entity';
import { StocktakingTagDetail } from './stocktaking-tag-detail.entity';
export declare class StocktakingTagHeader extends AppBaseEntity {
    StocktakingTagHeaderID: number;
    StocktakingPeriod?: string;
    StocktakingSettingRef: number;
    stocktakingSetting?: StocktakingSetting;
    StocktakingDate: string;
    StocktakingNumber: number;
    OfficerPartyRef: number;
    Description?: string;
    FiscalYearRef?: number;
    officerParty?: Party;
    details?: StocktakingTagDetail[];
}
