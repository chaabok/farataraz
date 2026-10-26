export declare class CreateCustomerGroupDto {
    CustomerGroupID?: number;
    Code: string;
    Title: string;
    Title2?: string;
    DetailedAccountRef?: number;
    detailedAccountCode?: string;
    Description?: string;
    IsMandatory?: boolean;
    ParentRef?: number;
    RelatedParties?: any[];
    CompanyRef?: number;
    BusinessStructureRef?: number;
}
export declare class UpdateCustomerGroupDto {
    Code?: string;
    Title?: string;
    Title2?: string;
    DetailedAccountRef?: number;
    detailedAccountCode?: string;
    Description?: string;
    IsMandatory?: boolean;
    ParentRef?: number;
    RelatedParties?: any[];
}
