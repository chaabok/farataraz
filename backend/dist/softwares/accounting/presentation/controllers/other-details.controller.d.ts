import { OtherDetailsService } from '../../application/services/other-details.service';
import { CreateOtherDetailsDto } from '../../application/dtos/create-other-details.dto';
import { UpdateOtherDetailsDto } from '../../application/dtos/update-other-details.dto';
export declare class OtherDetailsController {
    private readonly otherDetailsService;
    constructor(otherDetailsService: OtherDetailsService);
    checkDuplicate(field: string, value: string, excludeId?: string): Promise<{
        isDuplicate: boolean;
    }>;
    create(createDto: CreateOtherDetailsDto, companyId?: string, branchId?: string, agencyId?: string): Promise<import("../../domain/entities/other-details.entity").OtherDetails>;
    update(id: number, updateDto: UpdateOtherDetailsDto, companyId?: string, branchId?: string, agencyId?: string): Promise<import("../../domain/entities/other-details.entity").OtherDetails>;
    findAll(pageIndex?: string, pageSize?: string, sorting?: string, columnFilters?: string, globalFilter?: string, advancedFilters?: string): Promise<import("../../domain/entities/other-details.entity").OtherDetails[] | {
        items: import("../../domain/entities/other-details.entity").OtherDetails[];
        total: number;
    }>;
    findOne(id: number): Promise<import("../../domain/entities/other-details.entity").OtherDetails>;
    remove(id: number): Promise<void>;
}
