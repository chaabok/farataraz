import { VoucherTypeService } from '../../application/services/voucher-type.service';
import { CreateVoucherTypeDto } from '../../application/dtos/create-voucher-type.dto';
import { UpdateVoucherTypeDto } from '../../application/dtos/update-voucher-type.dto';
export declare class VoucherTypeController {
    private readonly voucherTypeService;
    constructor(voucherTypeService: VoucherTypeService);
    checkDuplicate(field: string, value: string, excludeId?: string): Promise<{
        isDuplicate: boolean;
    }>;
    create(createDto: CreateVoucherTypeDto, companyId?: string, branchId?: string, agencyId?: string): Promise<import("../../domain/entities/voucher-type.entity").VoucherType>;
    update(id: number, updateDto: UpdateVoucherTypeDto, companyId?: string, branchId?: string, agencyId?: string): Promise<import("../../domain/entities/voucher-type.entity").VoucherType>;
    findAll(pageIndex?: string, pageSize?: string, sorting?: string, columnFilters?: string, globalFilter?: string, advancedFilters?: string): Promise<import("../../domain/entities/voucher-type.entity").VoucherType[] | {
        items: import("../../domain/entities/voucher-type.entity").VoucherType[];
        total: number;
    }>;
    findOne(id: number): Promise<import("../../domain/entities/voucher-type.entity").VoucherType>;
    remove(id: number): Promise<void>;
}
