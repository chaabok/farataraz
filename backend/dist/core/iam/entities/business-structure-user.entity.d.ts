import { AppBaseEntity } from '../../entities/app-base.entity';
import { User } from './user.entity';
export declare class BusinessStructureUsers extends AppBaseEntity {
    businessStructureUsersId: number;
    userRef: number;
    businessStructureRef: number;
    user: User;
}
