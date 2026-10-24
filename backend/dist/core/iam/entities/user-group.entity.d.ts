import { AppBaseEntity } from '../../entities/app-base.entity';
import { UserGroupPermission } from './user-group-permission.entity';
import { User } from './user.entity';
export declare class UserGroup extends AppBaseEntity {
    id: number;
    code: string;
    title: string;
    titleEn: string;
    isActive: boolean;
    permissions: UserGroupPermission[];
    users: User[];
}
