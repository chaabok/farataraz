import { DetailedTypeService } from '../../application/services/detailed-type.service';
import { CreateDetailedTypeDto } from '../../application/dtos/create-detailed-type.dto';
import { UpdateDetailedTypeDto } from '../../application/dtos/update-detailed-type.dto';
export declare class DetailedTypeController {
    private readonly detailedTypeService;
    constructor(detailedTypeService: DetailedTypeService);
    checkDuplicate(field: string, value: string, excludeId?: string): Promise<{
        isDuplicate: boolean;
    }>;
    create(createDto: CreateDetailedTypeDto, companyId?: string, branchId?: string, agencyId?: string): Promise<import("../../domain/entities/detailed-type.entity").DetailedType>;
    update(id: number, updateDto: UpdateDetailedTypeDto, companyId?: string, branchId?: string, agencyId?: string): Promise<import("../../domain/entities/detailed-type.entity").DetailedType>;
    findAll(pageIndex?: string, pageSize?: string, sorting?: string, columnFilters?: string, globalFilter?: string, advancedFilters?: string): Promise<import("../../domain/entities/detailed-type.entity").DetailedType[] | {
        items: import("../../domain/entities/detailed-type.entity").DetailedType[];
        total: number;
    }>;
    findOne(id: number): Promise<import("../../domain/entities/detailed-type.entity").DetailedType>;
    remove(id: number): Promise<void>;
}
