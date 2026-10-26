import { CostCenterService } from '../../application/services/cost-center.service';
import { CreateCostCenterDto } from '../../application/dtos/create-cost-center.dto';
import { UpdateCostCenterDto } from '../../application/dtos/update-cost-center.dto';
import { DetailedAccountsNumberingService } from '../../../common/application/services/detailed-accounts-numbering.service';
export declare class CostCenterController {
    private readonly costCenterService;
    private readonly detailedAccountsNumberingService;
    constructor(costCenterService: CostCenterService, detailedAccountsNumberingService: DetailedAccountsNumberingService);
    create(createDto: CreateCostCenterDto): Promise<import("../../domain/entities/cost-center.entity").CostCenter>;
    update(id: string, updateDto: UpdateCostCenterDto): Promise<import("../../domain/entities/cost-center.entity").CostCenter>;
    remove(id: string): Promise<void>;
    bulkRemove(ids: number[]): Promise<void>;
    findAll(): Promise<import("../../domain/entities/cost-center.entity").CostCenter[]>;
    findAdvanced(query: any): Promise<{
        items: import("../../domain/entities/cost-center.entity").CostCenter[];
        total: number;
    }>;
    getInitData(): Promise<{
        nextCode: string;
        detailedNumber: string;
    }>;
    findOne(id: string): Promise<import("../../domain/entities/cost-center.entity").CostCenter>;
}
