import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { BankAccount } from './bank-account.entity';
import { DetailedAccount } from '../../../accounting/domain/entities/detailed-account.entity';
import { Party } from '../../../common/domain/entities/party.entity';
import { PaymentGatewayContact } from './payment-gateway-contact.entity';
import { PaymentGatewayType } from './payment-gateway-type.enum';
export declare class PaymentGateway extends AppBaseEntity {
    paymentGatewayId: number;
    gatewayType: PaymentGatewayType;
    partiesRef: number;
    party: Party;
    detailedAccountRef: number;
    detailedAccount: DetailedAccount;
    bankAccountRef: number;
    bankAccount: BankAccount;
    gatewayIdString: string;
    isActive: boolean;
    contacts: PaymentGatewayContact[];
}
