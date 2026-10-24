import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class SalesChannel extends AppBaseEntity {
    SalesChannelID: number;
    Code: number;
    Title: string;
    Title2: string;
    Type: number;
    IsActive: boolean;
    Description: string;
}
