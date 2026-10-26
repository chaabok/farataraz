import { AppBaseEntity } from '../../entities/app-base.entity';
import { RolePermission } from './role-permission.entity';
import { UserRole } from './user-role.entity';
export declare class Role extends AppBaseEntity {
    id: number;
    name: string;
    description: string;
    level: string;
    permissions: RolePermission[];
    userRoles: UserRole[];
}
