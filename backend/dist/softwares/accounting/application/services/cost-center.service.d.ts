import { ICostCenterRepository } from '../../domain/repositories/cost-center.repository.interface';
import { CostCenter } from '../../domain/entities/cost-center.entity';
import { CreateCostCenterDto } from '../dtos/create-cost-center.dto';
import { UpdateCostCenterDto } from '../dtos/update-cost-center.dto';
import { DetailedAccountService } from './detailed-account.service';
import { DetailedTypeService } from './detailed-type.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class CostCenterService {
    private readonly costCenterRepository;
    private readonly detailedAccountService;
    private readonly detailedTypeService;
    private readonly requestContextService;
    constructor(costCenterRepository: ICostCenterRepository, detailedAccountService: DetailedAccountService, detailedTypeService: DetailedTypeService, requestContextService: RequestContextService);
    create(createDto: CreateCostCenterDto): Promise<CostCenter>;
    update(id: number, updateDto: UpdateCostCenterDto): Promise<CostCenter>;
    findAll(): Promise<CostCenter[]>;
    findWithPagination(params: any): Promise<{
        items: CostCenter[];
        total: number;
    }>;
    findOne(id: number): Promise<CostCenter>;
    remove(id: number): Promise<void>;
    bulkRemove(ids: number[]): Promise<void>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    getNextCode(): Promise<number>;
}
