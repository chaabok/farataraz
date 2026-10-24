import { ICustomerGroupRepository } from '../../domain/repositories/customer-group.repository.interface';
import { CustomerGroup } from '../../domain/entities/customer-group.entity';
import { CreateCustomerGroupDto, UpdateCustomerGroupDto } from '../dtos/customer-group.dto';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { UsageCheckService } from '../../../../core/services/usage-check.service';
export declare class CustomerGroupService {
    private readonly repository;
    private readonly idGenerationService;
    private readonly requestContextService;
    private readonly usageCheckService;
    constructor(repository: ICustomerGroupRepository, idGenerationService: IdGenerationService, requestContextService: RequestContextService, usageCheckService: UsageCheckService);
    private getScope;
    private enrichGroupsWithAncestors;
    findAll(): Promise<CustomerGroup[]>;
    getTree(): Promise<any>;
    getNextCode(parentRef?: number): Promise<string>;
    checkDuplicate(field: string, value: string, excludeId?: number, parentRef?: number | null): Promise<boolean>;
    create(dto: CreateCustomerGroupDto): Promise<CustomerGroup>;
    update(id: number, dto: UpdateCustomerGroupDto): Promise<CustomerGroup>;
    remove(id: number): Promise<void>;
    findById(id: number): Promise<CustomerGroup>;
    upsert(dto: CreateCustomerGroupDto): Promise<CustomerGroup>;
}
