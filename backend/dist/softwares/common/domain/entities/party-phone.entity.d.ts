import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Party } from './party.entity';
export declare class PartyPhone extends AppBaseEntity {
    partyPhoneId: number;
    partyRef: number;
    party: Party;
    phoneType: string;
    phoneNumber: string;
    internal: string;
    description: string;
}
