export declare class CreateItemServiceGroupFieldDto {
    _id?: string;
    field_title?: string;
    field_title2?: string;
    field_type?: any;
    is_required?: boolean;
    options?: string;
    RowNo?: any;
}
export declare class CreateItemServiceGroupRelatedProductDto {
    _id?: string;
    product_code?: string;
    product_name?: string;
    unit?: string;
    is_active?: boolean;
    description?: string;
}
export declare class CreateItemServiceGroupDto {
    code?: string;
    name?: string;
    name2?: string;
    description?: string;
    isMandatory?: boolean;
    parentId?: any;
    additionalFields?: CreateItemServiceGroupFieldDto[];
    relatedProducts?: CreateItemServiceGroupRelatedProductDto[];
    companyRef?: number;
    businessStructureRef?: number;
}
export declare class UpdateItemServiceGroupDto extends CreateItemServiceGroupDto {
    id?: number | string;
}
export declare class SaveTreeDto {
    treeData?: any;
}
