import { PaymentGatewayService } from '../../application/services/payment-gateway.service';
import { CreatePaymentGatewayDto } from '../../application/dtos/create-payment-gateway.dto';
import { UpdatePaymentGatewayDto } from '../../application/dtos/update-payment-gateway.dto';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class PaymentGatewayController {
    private readonly paymentGatewayService;
    private readonly requestContextService;
    constructor(paymentGatewayService: PaymentGatewayService, requestContextService: RequestContextService);
    findAll(isActive?: string): Promise<import("../../domain/entities/payment-gateway.entity").PaymentGateway[]>;
    findOne(id: string): Promise<import("../../domain/entities/payment-gateway.entity").PaymentGateway>;
    create(createDto: CreatePaymentGatewayDto): Promise<import("../../domain/entities/payment-gateway.entity").PaymentGateway>;
    update(id: string, updateDto: UpdatePaymentGatewayDto): Promise<import("../../domain/entities/payment-gateway.entity").PaymentGateway>;
    remove(id: string): Promise<void>;
}
