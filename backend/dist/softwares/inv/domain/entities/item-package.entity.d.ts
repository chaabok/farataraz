import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { MeasurementUnit } from './measurement-unit.entity';
import { ItemPackageDetail } from './item-package-detail.entity';
export declare class ItemPackage extends AppBaseEntity {
    ItemPackageID: number;
    ItemType: number;
    PackageCode: string;
    PackageTitle: string;
    PackageTitle2: string;
    MeasurementUnitRef: number;
    MeasurementUnit?: MeasurementUnit;
    Quantity: number;
    Description: string;
    IsActive: boolean;
    FiscalYearRef?: number;
    Details?: ItemPackageDetail[];
}
