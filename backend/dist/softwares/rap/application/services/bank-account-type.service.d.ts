import { OnModuleInit } from '@nestjs/common';
import { IBankAccountTypeRepository } from '../../domain/repositories/bank-account-type.repository.interface';
import { BankAccountType } from '../../domain/entities/bank-account-type.entity';
import { CreateBankAccountTypeDto } from '../dtos/create-bank-account-type.dto';
import { UpdateBankAccountTypeDto } from '../dtos/update-bank-account-type.dto';
export declare class BankAccountTypeService implements OnModuleInit {
    private readonly repository;
    constructor(repository: IBankAccountTypeRepository);
    onModuleInit(): Promise<void>;
    private seedDefaults;
    findAll(): Promise<BankAccountType[]>;
    findWithPagination(params: any): Promise<{
        items: BankAccountType[];
        total: number;
    }>;
    findById(id: number): Promise<BankAccountType>;
    create(dto: CreateBankAccountTypeDto): Promise<BankAccountType>;
    update(id: number, dto: UpdateBankAccountTypeDto): Promise<BankAccountType>;
    delete(id: number): Promise<void>;
}
