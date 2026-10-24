import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class WarehouseDocumentType extends AppBaseEntity {
    WarehouseDocumentTypeID: number;
    WarehouseDocumentTypeCode: number;
    WarehouseDocumentTypeTitle: string;
    WarehouseDocumentTypeTitle2: string;
    WarehouseDocumentNature: number;
    HasBaseDocument: boolean;
    BaseDocumentTypeRefs: any;
    WarehouseName: string;
    DetailedName: string;
    RelatedDetailedTypeRefs: any;
    DisplayableItemNatures: any;
    ShowPurchaseSalesParameters: boolean;
    HasAccountingDocument: boolean;
    IsActive: boolean;
}
