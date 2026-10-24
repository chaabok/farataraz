import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class PurchaseSalesParameterValue extends AppBaseEntity {
    PurchaseSalesParameterValueID: number;
    PurchaseSalesParameterRef: number;
    RowNo: number;
    StartDate: string;
    EndDate: string;
    ParameterValue: number;
    Description: string;
    ProductServiceRef?: number | null;
    ProductServiceCode?: string | null;
    ProductServiceName?: string | null;
    MeasurementUnitName?: string | null;
}
