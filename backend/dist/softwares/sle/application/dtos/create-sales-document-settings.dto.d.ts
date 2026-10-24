export declare class CreateSalesDocumentSettingsDto {
    SalesDocumentSettingsID?: number;
    SalesDocumentType: number;
    HasBaseDocument?: boolean;
    BaseDocumentTypes?: string | null;
    ShowWarehouse?: boolean;
    DefaultWarehouseRef?: number | null;
    ShowSalesCenter?: boolean;
    DefaultSalesCenterRef?: number | null;
    ShowSalesType?: boolean;
    DefaultSalesTypeRef?: number | null;
    ShowDeliveryLocations?: boolean;
    DefaultDeliveryLocationRef?: number | null;
    HasAccountingDocument?: boolean;
    ShowPurchaseSalesParameters?: boolean;
    IsActive?: boolean;
}
export declare class UpdateSalesDocumentSettingsDto extends CreateSalesDocumentSettingsDto {
}
export declare function assertValidSalesDocumentType(dto: CreateSalesDocumentSettingsDto): void;
