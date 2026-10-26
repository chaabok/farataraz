import { Repository } from 'typeorm';
import { VoucherType } from '../../domain/entities/voucher-type.entity';
import { IVoucherTypeRepository } from '../../domain/repositories/voucher-type.repository.interface';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class VoucherTypeRepository implements IVoucherTypeRepository {
    private readonly typeOrmRepo;
    private readonly idGenerationService;
    private readonly requestContextService;
    constructor(typeOrmRepo: Repository<VoucherType>, idGenerationService: IdGenerationService, requestContextService: RequestContextService);
    private getScope;
    create(data: Partial<VoucherType>): Promise<VoucherType>;
    update(id: number, data: Partial<VoucherType>): Promise<VoucherType>;
    findAll(): Promise<VoucherType[]>;
    findWithPagination(skip: number, take: number): Promise<[VoucherType[], number]>;
    findAdvanced(params: any): Promise<[VoucherType[], number]>;
    findById(id: number): Promise<VoucherType | null>;
    delete(id: number): Promise<void>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}
