export declare class SalesDocumentSettings {
    SalesDocumentSettingsID: number;
    SalesDocumentType: number;
    HasBaseDocument: boolean;
    BaseDocumentTypes?: string;
    ShowWarehouse: boolean;
    DefaultWarehouseRef?: number;
    ShowSalesCenter: boolean;
    DefaultSalesCenterRef?: number;
    ShowSalesType: boolean;
    DefaultSalesTypeRef?: number;
    ShowDeliveryLocations: boolean;
    DefaultDeliveryLocationRef?: number;
    ShowSettlementMethod: boolean;
    DefaultSettlementMethodRef?: number;
    HasAccountingDocument: boolean;
    ShowPurchaseSalesParameters: boolean;
    IsActive: boolean;
    BusinessStructureRef?: number;
    CompanyRef?: number;
    CreatorRef?: number;
    CreationDate?: Date;
    LastModifierRef?: number;
    LastModificationDate?: Date;
}
