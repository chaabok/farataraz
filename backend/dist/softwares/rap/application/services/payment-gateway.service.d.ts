import { IPaymentGatewayRepository } from '../../domain/repositories/payment-gateway.repository.interface';
import { CreatePaymentGatewayDto } from '../dtos/create-payment-gateway.dto';
import { UpdatePaymentGatewayDto } from '../dtos/update-payment-gateway.dto';
import { PaymentGateway } from '../../domain/entities/payment-gateway.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { DetailedAccountService } from '../../../accounting/application/services/detailed-account.service';
import { DetailedTypeService } from '../../../accounting/application/services/detailed-type.service';
import { DetailedAccountsNumberingService } from '../../../common/application/services/detailed-accounts-numbering.service';
import { PartyService } from '../../../common/application/services/party.service';
export declare class PaymentGatewayService {
    private readonly repository;
    private readonly idGenService;
    private readonly detailedAccountService;
    private readonly detailedTypeService;
    private readonly detailedAccountsNumberingService;
    private readonly partyService;
    constructor(repository: IPaymentGatewayRepository, idGenService: IdGenerationService, detailedAccountService: DetailedAccountService, detailedTypeService: DetailedTypeService, detailedAccountsNumberingService: DetailedAccountsNumberingService, partyService: PartyService);
    findAll(companyId?: number, businessStructureId?: number, isActive?: boolean): Promise<PaymentGateway[]>;
    findOne(id: number): Promise<PaymentGateway>;
    create(data: CreatePaymentGatewayDto): Promise<PaymentGateway>;
    update(id: number, data: UpdatePaymentGatewayDto): Promise<PaymentGateway>;
    remove(id: number): Promise<void>;
}
