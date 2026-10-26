import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { StocktakingTagHeader } from './stocktaking-tag-header.entity';
import { Warehouse } from './warehouse.entity';
import { StocktakingCountDetail } from './stocktaking-count-detail.entity';
export declare class StocktakingCount extends AppBaseEntity {
    StocktakingCountID: number;
    StocktakingTagHeaderRef: number;
    tagHeader?: StocktakingTagHeader;
    WarehouseRef: number;
    warehouse?: Warehouse;
    StocktakingDate: string;
    StocktakingNumber: number;
    CountRound: number;
    Status: number;
    Description?: string;
    FiscalYearRef?: number;
    details?: StocktakingCountDetail[];
}
