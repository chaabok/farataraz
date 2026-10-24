import { PaymentGateway } from '../entities/payment-gateway.entity';
export declare const IPaymentGatewayRepositoryToken: unique symbol;
export interface IPaymentGatewayRepository {
    findById(id: number): Promise<PaymentGateway | null>;
    findAll(where?: any): Promise<PaymentGateway[]>;
    create(data: Partial<PaymentGateway>): Promise<PaymentGateway>;
    update(id: number, data: Partial<PaymentGateway>): Promise<PaymentGateway>;
    delete(id: number): Promise<void>;
}
