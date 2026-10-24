import { DetailedType } from '../../domain/entities/detailed-type.entity';
import { CreateDetailedTypeDto } from '../dtos/create-detailed-type.dto';
import { UpdateDetailedTypeDto } from '../dtos/update-detailed-type.dto';
import { IDetailedTypeRepository } from '../../domain/repositories/detailed-type.repository.interface';
import { IDetailedAccountRepository } from '../../domain/repositories/detailed-account.repository.interface';
import { IDetailedAccountsNumberingRepository } from '../../../common/domain/repositories/detailed-accounts-numbering.repository.interface';
export declare class DetailedTypeService {
    private readonly detailedTypeRepository;
    private readonly detailedAccountRepository;
    private readonly detailedAccountsNumberingRepository;
    constructor(detailedTypeRepository: IDetailedTypeRepository, detailedAccountRepository: IDetailedAccountRepository, detailedAccountsNumberingRepository: IDetailedAccountsNumberingRepository);
    create(createDto: CreateDetailedTypeDto, companyId?: number, branchId?: number, agencyId?: number): Promise<DetailedType>;
    update(id: number, updateDto: UpdateDetailedTypeDto, companyId?: number, branchId?: number, agencyId?: number): Promise<DetailedType>;
    findAll(): Promise<DetailedType[]>;
    findWithPagination(params: {
        pageIndex: number;
        pageSize: number;
        sorting?: string;
        columnFilters?: string;
        globalFilter?: string;
        advancedFilters?: string;
    }): Promise<{
        items: DetailedType[];
        total: number;
    }>;
    findOne(id: number): Promise<DetailedType>;
    remove(id: number): Promise<void>;
    seedData(): Promise<void>;
    seedForBusinessStructure(businessStructureId: number): Promise<void>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}
