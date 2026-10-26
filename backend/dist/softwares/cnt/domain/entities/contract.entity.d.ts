import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';
import { Project } from './project.entity';
import { Party } from '../../../common/domain/entities/party.entity';
export declare class Contract extends AppBaseEntity {
    contractId: number;
    documentNumber: string;
    date: string;
    projectId: number;
    project: Project;
    workLocation: string;
    partyId: number;
    party: Party;
    detailedAccountCode: string;
    detailedAccountId: number;
    detailedAccount: DetailedAccount;
    subject1: string;
    subject2: string;
    detailedAccountTitle: string;
    detailedAccountTitle2: string;
    startDate: string;
    endDate: string;
    durationDays: number;
    amount: number;
    description1: string;
    description2: string;
    isActive: boolean;
}
