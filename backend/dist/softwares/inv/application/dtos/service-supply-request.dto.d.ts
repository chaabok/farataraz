export declare class CreateServiceSupplyRequestDetailDto {
    ItemRef?: number;
    RequestQuantity?: number;
    ApprovedQuantity?: number;
    DeliveryDate?: string;
    Description?: string;
}
export declare class CreateServiceSupplyRequestDto {
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
    details?: CreateServiceSupplyRequestDetailDto[];
}
export declare class UpdateServiceSupplyRequestDto extends CreateServiceSupplyRequestDto {
}
