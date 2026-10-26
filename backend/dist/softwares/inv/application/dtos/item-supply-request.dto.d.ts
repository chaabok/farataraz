export declare class CreateItemSupplyRequestDetailDto {
    ItemRef?: number;
    RequestQuantity?: number;
    ApprovedQuantity?: number;
    DeliveryDate?: string;
    Description?: string;
    trackingFactorValues?: any;
    TrackingFactorValues?: any;
}
export declare class CreateItemSupplyRequestDto {
    BasisType?: number;
    BaseSource?: number;
    RequestNumber?: number;
    RequestDate?: string;
    RequestType?: number;
    Priority?: number;
    Status?: number;
    Requester?: string;
    RequesterRef?: number;
    WarehouseRef?: number;
    Description?: string;
    details?: CreateItemSupplyRequestDetailDto[];
}
export declare class UpdateItemSupplyRequestDto extends CreateItemSupplyRequestDto {
}
