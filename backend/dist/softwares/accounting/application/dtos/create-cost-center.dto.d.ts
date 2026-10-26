import { CostCenterType } from '../../domain/entities/cost-center.enum';
export declare class CreateCostCenterDto {
    code: string;
    title: string;
    title_en?: string;
    costCenterType: CostCenterType;
    detailedAccountCode: string;
    isActive?: boolean;
    description?: string;
}
