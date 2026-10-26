export declare class CreateWalletDto {
    WalletID?: number;
    Code: number;
    Title: string;
    Title2?: string;
    Nature: number;
    IsActive?: boolean;
    Description?: string;
    CompanyRef?: number;
    BusinessStructureRef?: number;
}
export declare class UpdateWalletDto {
    Code?: number;
    Title?: string;
    Title2?: string;
    Nature?: number;
    IsActive?: boolean;
    Description?: string;
}
