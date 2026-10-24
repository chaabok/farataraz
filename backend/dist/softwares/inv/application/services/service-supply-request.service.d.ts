import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ServiceSupplyRequest } from '../../domain/entities/service-supply-request.entity';
import { ServiceSupplyRequestDetail } from '../../domain/entities/service-supply-request-detail.entity';
import { CreateServiceSupplyRequestDto, UpdateServiceSupplyRequestDto } from '../dtos/service-supply-request.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class ServiceSupplyRequestService implements OnModuleInit {
    private readonly repository;
    private readonly detailRepository;
    private readonly idGenService;
    private readonly requestContextService;
    constructor(repository: Repository<ServiceSupplyRequest>, detailRepository: Repository<ServiceSupplyRequestDetail>, idGenService: IdGenerationService, requestContextService: RequestContextService);
    onModuleInit(): Promise<void>;
    private getScope;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    getRequesters(): Promise<any[]>;
    private parseRef;
    private parseString;
    create(dto: CreateServiceSupplyRequestDto): Promise<ServiceSupplyRequest>;
    findAll(query?: any): Promise<ServiceSupplyRequest[]>;
    findOne(id: number): Promise<ServiceSupplyRequest>;
    update(id: number, dto: UpdateServiceSupplyRequestDto): Promise<ServiceSupplyRequest>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
