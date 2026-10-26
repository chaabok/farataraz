export declare class WarehouseProductDto {
    WarehouseProductID?: number;
    ProductCode?: string;
    ProductTitle?: string;
    MeasurementUnitRef?: number;
}
export declare class WarehouseUserDto {
    WarehouseUserID?: number;
    UserRef?: number;
}
export declare class WarehouseAddressDto {
    WarehouseAddressID?: number;
    AddressState?: string;
    AddressCity?: string;
    AddressTitle?: string;
    AddressTitle2?: string;
    PostalCode?: string;
    Longitude?: string;
    Latitude?: string;
}
export declare class WarehouseKeeperDto {
    WarehouseKeeperID?: number;
    WarehouseKeeperRef?: number;
    Address?: string;
    MobilePhone?: string;
    Phone?: string;
}
export declare class CreateWarehouseDto {
    WarehouseType?: number;
    WarehouseCode?: string;
    WarehouseTitle?: string;
    WarehouseTitle2?: string;
    WarehouseNature?: number;
    Phone?: string;
    DetailedAccountRef?: number;
    IsActive?: boolean;
    ParentRef?: number;
    AddressState?: string;
    AddressCity?: string;
    AddressTitle?: string;
    AddressTitle2?: string;
    PostalCode?: string;
    Longitude?: string;
    Latitude?: string;
    WarehouseKeeperRef?: number;
    WarehouseProducts?: WarehouseProductDto[];
    WarehouseUsers?: WarehouseUserDto[];
    WarehouseAddresses?: WarehouseAddressDto[];
    WarehouseKeepers?: WarehouseKeeperDto[];
}
