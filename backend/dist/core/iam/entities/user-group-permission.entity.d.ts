import { AppBaseEntity } from '../../entities/app-base.entity';
import { UserGroup } from './user-group.entity';
export declare class UserGroupPermission extends AppBaseEntity {
    id: number;
    userGroup: UserGroup;
    userGroupRef: number;
    permissionKey: string;
    value: boolean;
}
