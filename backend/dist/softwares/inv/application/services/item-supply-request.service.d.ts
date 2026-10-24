import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ItemSupplyRequest } from '../../domain/entities/item-supply-request.entity';
import { ItemSupplyRequestDetail } from '../../domain/entities/item-supply-request-detail.entity';
import { CreateItemSupplyRequestDto, UpdateItemSupplyRequestDto } from '../dtos/item-supply-request.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class ItemSupplyRequestService implements OnModuleInit {
    private readonly repository;
    private readonly detailRepository;
    private readonly idGenService;
    private readonly requestContextService;
    constructor(repository: Repository<ItemSupplyRequest>, detailRepository: Repository<ItemSupplyRequestDetail>, idGenService: IdGenerationService, requestContextService: RequestContextService);
    onModuleInit(): Promise<void>;
    private getScope;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    getRequesters(): Promise<any[]>;
    private parseRef;
    private parseString;
    create(dto: CreateItemSupplyRequestDto): Promise<ItemSupplyRequest>;
    findAll(query?: any): Promise<ItemSupplyRequest[]>;
    findOne(id: number): Promise<ItemSupplyRequest>;
    update(id: number, dto: UpdateItemSupplyRequestDto): Promise<ItemSupplyRequest>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
