import { PaymentGateway } from './payment-gateway.entity';
import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class PaymentGatewayContact extends AppBaseEntity {
    paymentGatewayContactId: number;
    paymentGatewayRef: number;
    paymentGateway: PaymentGateway;
    title: string;
    title2: string;
    phoneNumber: string;
    description: string;
}
