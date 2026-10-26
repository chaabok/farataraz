import { ICustomerRepository } from '../../domain/repositories/customer.repository.interface';
import { Customer } from '../../domain/entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from '../dtos/create-customer.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { PartyService } from '../../../common/application/services/party.service';
export declare class CustomerService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    private readonly partyService;
    constructor(repository: ICustomerRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService, partyService: PartyService);
    private getScope;
    findAll(): Promise<Customer[]>;
    findById(id: number): Promise<Customer>;
    getNextCode(): Promise<{
        code: string;
    }>;
    create(dto: CreateCustomerDto): Promise<Customer>;
    update(id: number, dto: UpdateCustomerDto): Promise<Customer>;
    remove(id: number): Promise<void>;
}
