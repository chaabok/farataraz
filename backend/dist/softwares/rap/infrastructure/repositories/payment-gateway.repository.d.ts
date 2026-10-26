import { Repository } from 'typeorm';
import { PaymentGateway } from '../../domain/entities/payment-gateway.entity';
import { IPaymentGatewayRepository } from '../../domain/repositories/payment-gateway.repository.interface';
import { PaymentGatewayContact } from '../../domain/entities/payment-gateway-contact.entity';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class PaymentGatewayRepository implements IPaymentGatewayRepository {
    private readonly repository;
    private readonly contactRepository;
    private readonly requestContextService;
    constructor(repository: Repository<PaymentGateway>, contactRepository: Repository<PaymentGatewayContact>, requestContextService: RequestContextService);
    private getScope;
    findById(id: number): Promise<PaymentGateway | null>;
    findAll(where?: any): Promise<PaymentGateway[]>;
    create(data: Partial<PaymentGateway>): Promise<PaymentGateway>;
    update(id: number, data: Partial<PaymentGateway>): Promise<PaymentGateway>;
    delete(id: number): Promise<void>;
}
