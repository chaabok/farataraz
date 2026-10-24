import { Repository } from 'typeorm';
import { IPurchaseSalesParameterRepository } from '../../domain/repositories/purchase-sales-parameter.repository.interface';
import { PurchaseSalesParameterValue } from '../../domain/entities/purchase-sales-parameter-value.entity';
import { CreatePurchaseSalesParameterDto } from '../dtos/create-purchase-sales-parameter.dto';
import { UpdatePurchaseSalesParameterDto } from '../dtos/update-purchase-sales-parameter.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class PurchaseSalesParameterService {
    private readonly repository;
    private readonly valueRepository;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(repository: IPurchaseSalesParameterRepository, valueRepository: Repository<PurchaseSalesParameterValue>, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    findAll(query?: any): Promise<any>;
    findOne(id: number): Promise<any>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    private validateFields;
    private validateDuplicates;
    private formatChar10Date;
    private saveParameterValues;
    create(createDto: CreatePurchaseSalesParameterDto): Promise<any>;
    update(id: number, updateDto: UpdatePurchaseSalesParameterDto): Promise<any>;
    remove(id: number): Promise<void>;
}
