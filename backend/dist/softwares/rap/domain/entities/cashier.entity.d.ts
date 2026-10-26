import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Cash } from './cash.entity';
import { User } from '../../../../core/iam/entities/user.entity';
export declare class Cashier extends AppBaseEntity {
    cashierId: number;
    cashId: number;
    cash: Cash;
    userId: number;
    user: User;
}
