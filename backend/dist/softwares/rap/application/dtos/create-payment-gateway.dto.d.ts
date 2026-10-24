import { PaymentGatewayType } from '../../domain/entities/payment-gateway-type.enum';
export declare class PaymentGatewayContactDto {
    title?: string;
    title2?: string;
    phoneNumber?: string;
    description?: string;
}
export declare class CreatePaymentGatewayDto {
    gatewayType: PaymentGatewayType;
    partiesRef: number;
    detailedAccountCode?: string;
    bankAccountRef: number;
    gatewayIdString?: string;
    isActive?: boolean;
    companyRef?: number;
    businessStructureRef?: number;
    contacts?: PaymentGatewayContactDto[];
}
