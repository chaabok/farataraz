export declare class CreateItemPackageDetailDto {
    ItemPackageDetailID?: number;
    RowNo?: number;
    ItemRef: number;
    MeasurementUnitRef?: number;
    Quantity?: number;
    Description?: string;
}
export declare class CreateItemPackageDto {
    ItemType: number;
    PackageCode?: string;
    PackageTitle: string;
    PackageTitle2?: string;
    MeasurementUnitRef?: number;
    Quantity?: number;
    Description?: string;
    IsActive?: boolean;
    items?: CreateItemPackageDetailDto[];
}
declare const UpdateItemPackageDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateItemPackageDto>>;
export declare class UpdateItemPackageDto extends UpdateItemPackageDto_base {
}
export {};
