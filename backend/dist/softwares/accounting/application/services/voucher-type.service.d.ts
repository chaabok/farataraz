import { VoucherType } from '../../domain/entities/voucher-type.entity';
import { CreateVoucherTypeDto } from '../dtos/create-voucher-type.dto';
import { IVoucherTypeRepository } from '../../domain/repositories/voucher-type.repository.interface';
export declare class VoucherTypeService {
    private readonly voucherTypeRepository;
    constructor(voucherTypeRepository: IVoucherTypeRepository);
    create(createDto: CreateVoucherTypeDto, companyId?: number, branchId?: number, agencyId?: number): Promise<VoucherType>;
    update(id: number, updateDto: any, companyId?: number, branchId?: number, agencyId?: number): Promise<VoucherType>;
    findAll(): Promise<VoucherType[]>;
    findWithPagination(params: {
        pageIndex: number;
        pageSize: number;
        sorting?: string;
        columnFilters?: string;
        globalFilter?: string;
        advancedFilters?: string;
    }): Promise<{
        items: VoucherType[];
        total: number;
    }>;
    findOne(id: number): Promise<VoucherType>;
    remove(id: number): Promise<void>;
    seedData(): Promise<void>;
    seedForBusinessStructure(businessStructureId: number): Promise<void>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}
