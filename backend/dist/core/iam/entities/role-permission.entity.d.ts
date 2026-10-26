import { AppBaseEntity } from '../../entities/app-base.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';
export declare class RolePermission extends AppBaseEntity {
    id: number;
    role: Role;
    roleId: number;
    permission: Permission;
    permissionId: number;
    conditions: Record<string, any>;
}
