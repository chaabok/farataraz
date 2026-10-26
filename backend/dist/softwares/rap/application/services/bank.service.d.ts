import { IBankRepository } from '../../domain/repositories/bank.repository.interface';
import { Bank } from '../../domain/entities/bank.entity';
import { CreateBankDto } from '../dtos/create-bank.dto';
import { UpdateBankDto } from '../dtos/update-bank.dto';
export declare class BankService {
    private readonly bankRepository;
    constructor(bankRepository: IBankRepository);
    create(createDto: CreateBankDto): Promise<Bank>;
    update(id: number, updateDto: UpdateBankDto): Promise<Bank>;
    findAll(): Promise<Bank[]>;
    findWithPagination(params: any): Promise<{
        items: Bank[];
        total: number;
    }>;
    findOne(id: number): Promise<Bank>;
    remove(id: number): Promise<void>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
    private validateDuplicates;
}
