import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { ItemRequest } from '../../domain/entities/item-request.entity';
import { ItemRequestDetail } from '../../domain/entities/item-request-detail.entity';
import { CreateItemRequestDto, UpdateItemRequestDto } from '../dtos/item-request.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class ItemRequestService implements OnModuleInit {
    private readonly repository;
    private readonly detailRepository;
    private readonly idGenService;
    private readonly requestContextService;
    constructor(repository: Repository<ItemRequest>, detailRepository: Repository<ItemRequestDetail>, idGenService: IdGenerationService, requestContextService: RequestContextService);
    onModuleInit(): Promise<void>;
    private getScope;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    private parseRef;
    private parseString;
    create(dto: CreateItemRequestDto): Promise<ItemRequest>;
    findAll(query?: any): Promise<ItemRequest[]>;
    findOne(id: number): Promise<ItemRequest>;
    update(id: number, dto: UpdateItemRequestDto): Promise<ItemRequest>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
