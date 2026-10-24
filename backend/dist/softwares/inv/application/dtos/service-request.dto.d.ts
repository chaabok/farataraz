export declare class CreateServiceRequestDetailDto {
    RowNo?: number;
    ItemRef?: any;
    RequestQuantity?: any;
    ApprovedQuantity?: any;
    DeliveryDate?: string;
    Description?: string;
}
export declare class CreateServiceRequestDto {
    BaseSource?: any;
    RequestNumber?: any;
    RequestDate?: any;
    Priority?: any;
    Status?: any;
    Requester?: any;
    RequesterRef?: any;
    Description?: any;
    details?: CreateServiceRequestDetailDto[];
}
export declare class UpdateServiceRequestDto extends CreateServiceRequestDto {
}
