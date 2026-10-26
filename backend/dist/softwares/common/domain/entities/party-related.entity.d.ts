import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Party } from './party.entity';
export declare class PartyRelated extends AppBaseEntity {
    partyRelatedId: number;
    partyRef: number;
    party: Party;
    firstName: string;
    lastName: string;
    relation: string;
    nationalCode: string;
    phone: string;
    description: string;
}
