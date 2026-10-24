export declare class CreateSalesItemGroupDto {
    code?: string;
    name: string;
    name2?: string;
    description?: string;
    isMandatory?: boolean;
    parentId?: number | null;
    relatedProducts?: any[];
    companyRef?: number;
    businessStructureRef?: number;
}
export declare class UpdateSalesItemGroupDto extends CreateSalesItemGroupDto {
}
export declare class SaveTreeDto {
    treeData: any;
}
