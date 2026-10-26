export declare class CreateSalesCenterDto {
    Code: number;
    Type: number;
    ReferenceRef?: number;
    Title: string;
    title?: string;
    Title2?: string;
    title2?: string;
    IsActive?: boolean;
    Description?: string;
    BusinessStructureRef?: number;
    CompanyRef?: number;
    FiscalYearRef?: number;
}
declare const UpdateSalesCenterDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateSalesCenterDto>>;
export declare class UpdateSalesCenterDto extends UpdateSalesCenterDto_base {
}
export {};
