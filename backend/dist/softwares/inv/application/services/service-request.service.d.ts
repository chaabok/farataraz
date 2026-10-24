import { Repository } from 'typeorm';
import { ServiceRequest } from '../../domain/entities/service-request.entity';
import { ServiceRequestDetail } from '../../domain/entities/service-request-detail.entity';
import { CreateServiceRequestDto, UpdateServiceRequestDto } from '../dtos/service-request.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class ServiceRequestService {
    private readonly repository;
    private readonly detailRepository;
    private readonly idGenService;
    private readonly requestContextService;
    constructor(repository: Repository<ServiceRequest>, detailRepository: Repository<ServiceRequestDetail>, idGenService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    create(dto: CreateServiceRequestDto): Promise<ServiceRequest>;
    findAll(query?: any): Promise<ServiceRequest[]>;
    findOne(id: number): Promise<ServiceRequest>;
    update(id: number, dto: UpdateServiceRequestDto): Promise<ServiceRequest>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
