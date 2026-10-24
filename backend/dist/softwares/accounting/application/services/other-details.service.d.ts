import { OtherDetails } from '../../domain/entities/other-details.entity';
import { CreateOtherDetailsDto } from '../dtos/create-other-details.dto';
import { UpdateOtherDetailsDto } from '../dtos/update-other-details.dto';
import { IOtherDetailsRepository } from '../../domain/repositories/other-details.repository.interface';
export declare class OtherDetailsService {
    private readonly otherDetailsRepository;
    constructor(otherDetailsRepository: IOtherDetailsRepository);
    create(createDto: CreateOtherDetailsDto, companyId?: number, branchId?: number, agencyId?: number): Promise<OtherDetails>;
    update(id: number, updateDto: UpdateOtherDetailsDto, companyId?: number, branchId?: number, agencyId?: number): Promise<OtherDetails>;
    findAll(): Promise<OtherDetails[]>;
    findWithPagination(params: {
        pageIndex: number;
        pageSize: number;
        sorting?: string;
        columnFilters?: string;
        globalFilter?: string;
        advancedFilters?: string;
    }): Promise<{
        items: OtherDetails[];
        total: number;
    }>;
    findOne(id: number): Promise<OtherDetails>;
    remove(id: number): Promise<void>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}
