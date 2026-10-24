import { IamService } from '../services/iam.service';
export declare class IamController {
    private readonly iamService;
    constructor(iamService: IamService);
    syncPermissions(body: {
        resources: {
            resource: string;
            actions: string[];
        }[];
    }): Promise<{
        success: boolean;
    }>;
    getPermissions(): Promise<import("../entities/permission.entity").Permission[]>;
    getRoles(): Promise<import("../entities/role.entity").Role[]>;
    createRole(body: any, companyId?: string): Promise<import("../entities/role.entity").Role>;
    updateRolePermissions(id: string, body: {
        permissionIds: string[];
        conditions?: any;
    }): Promise<import("../entities/role.entity").Role>;
    getUsers(pageIndex?: string, pageSize?: string, sorting?: string, columnFilters?: string, globalFilter?: string, advancedFilters?: string): Promise<any[] | {
        items: any[];
        total: number;
    }>;
    checkTwoFactorInUse(): Promise<boolean>;
    getUser(id: string): Promise<any>;
    createUser(body: any, companyId?: string): Promise<import("../entities/user.entity").User>;
    updateUser(id: string, body: any, companyId?: string): Promise<import("../entities/user.entity").User>;
    deleteUser(id: string): Promise<{
        success: boolean;
    }>;
    getUserGroups(pageIndex?: string, pageSize?: string, sorting?: string, columnFilters?: string, globalFilter?: string, advancedFilters?: string): Promise<import("../entities/user-group.entity").UserGroup[] | {
        items: import("../entities/user-group.entity").UserGroup[];
        total: number;
    }>;
    getUserGroup(id: string): Promise<{
        permissions: string[];
        id: number;
        code: string;
        title: string;
        titleEn: string;
        isActive: boolean;
        users: import("../entities/user.entity").User[];
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
    }>;
    createUserGroup(body: any, companyId?: string): Promise<import("../entities/user-group.entity").UserGroup>;
    updateUserGroup(id: string, body: any, companyId?: string): Promise<import("../entities/user-group.entity").UserGroup>;
    deleteUserGroup(id: string): Promise<{
        success: boolean;
    }>;
    getMyBusinessStructures(req: any): Promise<{
        isAdmin: boolean;
        allowedIds: number[];
    }>;
    getBusinessStructureUsers(id: string): Promise<{
        businessStructureUsersId: number;
        businessStructureRef: number;
        userRef: number;
        username: string;
        firstName: string;
        lastName: string;
    }[]>;
    addBusinessStructureUser(id: string, body: {
        userRef: number;
    }): Promise<import("../entities/business-structure-user.entity").BusinessStructureUsers>;
    deleteBusinessStructureUser(id: string): Promise<import("typeorm").DeleteResult>;
}
