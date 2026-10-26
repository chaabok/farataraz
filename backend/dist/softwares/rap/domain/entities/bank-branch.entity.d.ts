import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Bank } from './bank.entity';
import { GeoLocation } from '../../../common/domain/entities/geo-location.entity';
export declare class BankBranch extends AppBaseEntity {
    bankBranchId: number;
    bankId: number;
    bank: Bank;
    branchCode: number | null;
    title: string;
    latinTitle: string;
    cityRef: number | null;
    city: GeoLocation;
    phone: string;
    address: string;
    contactName: string;
}
