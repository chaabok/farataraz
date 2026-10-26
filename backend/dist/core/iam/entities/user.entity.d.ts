import { AppBaseEntity } from '../../entities/app-base.entity';
import { BusinessStructure } from '../../../softwares/common/domain/entities/business-structure.entity';
import { UserRole } from './user-role.entity';
import { UserGroup } from './user-group.entity';
export declare class User extends AppBaseEntity {
    id: number;
    username: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
    repeatChangePassword: number;
    businessStructure: BusinessStructure;
    businessStructureId: number;
    roles: UserRole[];
    userGroup: UserGroup;
    userGroupRef: number;
    refreshToken: string;
    lastSeen: Date;
    twoFactorSecret: string;
    isTwoFactorEnabled: boolean;
}
