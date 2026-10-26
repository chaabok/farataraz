import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Party } from './party.entity';
export declare class PartyAddress extends AppBaseEntity {
    partyAddressId: number;
    partyRef: number;
    party: Party;
    addressType: string;
    city: string;
    fullAddress: string;
    postalCode: string;
    longitude: string;
    latitude: string;
}
