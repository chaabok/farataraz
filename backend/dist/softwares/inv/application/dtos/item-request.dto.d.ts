export declare class CreateItemRequestDetailDto {
    RowNo?: number;
    ItemRef?: any;
    RequestQuantity?: any;
    ApprovedQuantity?: any;
    DeliveryDate?: string;
    Description?: string;
    trackingFactorValues?: any;
    TrackingFactorValues?: any;
}
export declare class CreateItemRequestDto {
    BasisType?: any;
    RequestNumber?: any;
    RequestDate?: any;
    RequestType?: any;
    Priority?: any;
    Status?: any;
    Requester?: any;
    RequesterRef?: any;
    WarehouseRef?: any;
    Description?: any;
    details?: CreateItemRequestDetailDto[];
}
export declare class UpdateItemRequestDto extends CreateItemRequestDto {
}
