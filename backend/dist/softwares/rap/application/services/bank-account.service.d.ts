import { IBankAccountRepository } from '../../domain/repositories/bank-account.repository.interface';
import { CreateBankAccountDto } from '../dtos/create-bank-account.dto';
import { UpdateBankAccountDto } from '../dtos/update-bank-account.dto';
import { BankAccount } from '../../domain/entities/bank-account.entity';
import { ActivityLogService } from '../../../../core/services/activity-log.service';
import { DetailedTypeService } from '../../../accounting/application/services/detailed-type.service';
import { DetailedAccountsNumberingService } from '../../../common/application/services/detailed-accounts-numbering.service';
import { DetailedAccountService } from '../../../accounting/application/services/detailed-account.service';
export declare class BankAccountService {
    private readonly bankAccountRepository;
    private readonly activityLogService;
    private readonly detailedTypeService;
    private readonly detailedAccountsNumberingService;
    private readonly detailedAccountService;
    constructor(bankAccountRepository: IBankAccountRepository, activityLogService: ActivityLogService, detailedTypeService: DetailedTypeService, detailedAccountsNumberingService: DetailedAccountsNumberingService, detailedAccountService: DetailedAccountService);
    create(createDto: CreateBankAccountDto): Promise<BankAccount>;
    update(id: number, updateDto: UpdateBankAccountDto): Promise<BankAccount>;
    delete(id: number): Promise<void>;
    private syncDetailedAccount;
    findById(id: number): Promise<BankAccount>;
    findAll(options?: any): Promise<{
        items: BankAccount[];
        total: number;
    }>;
}
