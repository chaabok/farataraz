import { AppBaseEntity } from '../../entities/app-base.entity';
import { RolePermission } from './role-permission.entity';
export declare class Permission extends AppBaseEntity {
    id: number;
    resource: string;
    action: string;
    description: string;
    isAutoDiscovered: boolean;
    rolePermissions: RolePermission[];
}
