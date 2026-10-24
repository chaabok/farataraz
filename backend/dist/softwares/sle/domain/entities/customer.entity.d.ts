import { Party } from '../../../common/domain/entities/party.entity';
import { CustomerGroup } from './customer-group.entity';
import { Currency } from '../../../common/domain/entities/currency.entity';
export declare class Customer {
    CustomerID: number;
    Code: string;
    CustomerType: number;
    PartyRef?: number;
    party?: Party;
    CustomerGroupRef?: number;
    customerGroup?: CustomerGroup;
    SalesChannels?: string;
    SalesStatus: number;
    SalesIntermediaryRef?: number;
    salesIntermediary?: Party;
    SalesTypes?: string;
    CurrencyRef?: number;
    currency?: Currency;
    IsActive: boolean;
    BusinessStructureRef?: number;
    CompanyRef?: number;
    FiscalYearRef?: number;
    CreatorRef?: number;
    CreationDate?: Date;
    LastModifierRef?: number;
    LastModificationDate?: Date;
}
