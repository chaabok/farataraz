export declare abstract class AppBaseEntity {
    version: number;
    creator: number;
    creationDate: Date;
    createTime: string;
    lastModifier: number;
    lastModificationDate: Date;
    lastModificationTime: string;
    businessStructureRef: number;
    businessStructureEntity?: any;
    companyRef?: number;
    companyEntity?: any;
    branchRef?: number;
    branchEntity?: any;
    agencyRef?: number;
    agencyEntity?: any;
    setCreateTime(): void;
    setUpdateTime(): void;
}
