import { AppBaseEntity } from '../../entities/app-base.entity';
import { User } from './user.entity';
import { Role } from './role.entity';
export declare class UserRole extends AppBaseEntity {
    id: number;
    user: User;
    userId: number;
    role: Role;
    roleId: number;
}
