import { Repository } from 'typeorm';
import { SalesContract } from '../../domain/entities/sales-contract.entity';
import { SalesContractItem } from '../../domain/entities/sales-contract-item.entity';
import { SalesContractFactor } from '../../domain/entities/sales-contract-factor.entity';
import { CreateSalesContractDto, UpdateSalesContractDto } from '../dtos/sales-contract.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class SalesContractService {
    private readonly repository;
    private readonly itemRepository;
    private readonly factorRepository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: Repository<SalesContract>, itemRepository: Repository<SalesContractItem>, factorRepository: Repository<SalesContractFactor>, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    getNextNumber(): Promise<{
        documentNumber: number;
    }>;
    private validateRequiredRefs;
    create(dto: CreateSalesContractDto): Promise<SalesContract>;
    private saveItems;
    private saveFactors;
    findAll(query?: any): Promise<{
        items: SalesContract[];
        total: number;
    }>;
    findOne(id: number): Promise<SalesContract>;
    update(id: number, dto: UpdateSalesContractDto): Promise<SalesContract>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
}
