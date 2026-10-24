import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { RolePermission } from '../entities/role-permission.entity';
import { User } from '../entities/user.entity';
import { UserGroup } from '../entities/user-group.entity';
import { UserGroupPermission } from '../entities/user-group-permission.entity';
import { BusinessStructureUsers } from '../entities/business-structure-user.entity';
export declare class IamService implements OnModuleInit {
    private readonly roleRepository;
    private readonly permissionRepository;
    private readonly rolePermissionRepository;
    private readonly userRepository;
    private readonly userGroupRepository;
    private readonly userGroupPermissionRepository;
    private readonly businessStructureUsersRepository;
    constructor(roleRepository: Repository<Role>, permissionRepository: Repository<Permission>, rolePermissionRepository: Repository<RolePermission>, userRepository: Repository<User>, userGroupRepository: Repository<UserGroup>, userGroupPermissionRepository: Repository<UserGroupPermission>, businessStructureUsersRepository: Repository<BusinessStructureUsers>);
    onModuleInit(): Promise<void>;
    seedInit(): Promise<void>;
    syncPermissions(resources: {
        resource: string;
        actions: string[];
    }[]): Promise<void>;
    getAllPermissions(): Promise<Permission[]>;
    getAllRoles(): Promise<Role[]>;
    createRole(data: Partial<Role>): Promise<Role>;
    updateRolePermissions(roleIdStr: string | number, permissionIdsStr: (string | number)[], conditions?: Record<string, any>): Promise<Role>;
    private sanitizeUser;
    getUsers(params?: any): Promise<any[] | {
        items: any[];
        total: number;
    }>;
    getUserById(id: number): Promise<any>;
    createUser(data: any): Promise<User>;
    updateUser(id: number, data: any): Promise<User>;
    private syncUserPermissions;
    deleteUser(id: number): Promise<import("typeorm").DeleteResult>;
    isTwoFactorInUse(): Promise<boolean>;
    getUserGroups(params?: any): Promise<UserGroup[] | {
        items: UserGroup[];
        total: number;
    }>;
    getUserGroupById(id: number): Promise<{
        permissions: string[];
        id: number;
        code: string;
        title: string;
        titleEn: string;
        isActive: boolean;
        users: User[];
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
    createUserGroup(data: any): Promise<UserGroup>;
    updateUserGroup(id: number, data: any): Promise<UserGroup>;
    deleteUserGroup(id: number): Promise<import("typeorm").DeleteResult>;
    private syncGroupPermissions;
    getMyBusinessStructures(userId: number): Promise<{
        isAdmin: boolean;
        allowedIds: number[];
    }>;
    getBusinessStructureUsers(businessStructureRef: number): Promise<{
        businessStructureUsersId: number;
        businessStructureRef: number;
        userRef: number;
        username: string;
        firstName: string;
        lastName: string;
    }[]>;
    addBusinessStructureUser(data: {
        businessStructureRef: number;
        userRef: number;
    }): Promise<BusinessStructureUsers>;
    deleteBusinessStructureUser(id: number): Promise<import("typeorm").DeleteResult>;
}
