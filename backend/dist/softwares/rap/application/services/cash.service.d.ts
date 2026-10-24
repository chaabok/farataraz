import { ICashRepository } from '../../domain/repositories/cash.repository.interface';
import { ICashierRepository } from '../../domain/repositories/cashier.repository.interface';
import { Cash } from '../../domain/entities/cash.entity';
import { CreateCashDto } from '../dtos/create-cash.dto';
import { UpdateCashDto } from '../dtos/update-cash.dto';
import { DetailedAccountService } from '../../../accounting/application/services/detailed-account.service';
import { DetailedAccountsNumberingService } from '../../../common/application/services/detailed-accounts-numbering.service';
import { DetailedTypeService } from '../../../accounting/application/services/detailed-type.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
export declare class CashService {
    private readonly cashRepository;
    private readonly cashierRepository;
    private readonly detailedAccountService;
    private readonly detailedAccountsNumberingService;
    private readonly detailedTypeService;
    private readonly requestContextService;
    private readonly idGenService;
    constructor(cashRepository: ICashRepository, cashierRepository: ICashierRepository, detailedAccountService: DetailedAccountService, detailedAccountsNumberingService: DetailedAccountsNumberingService, detailedTypeService: DetailedTypeService, requestContextService: RequestContextService, idGenService: IdGenerationService);
    create(createDto: CreateCashDto): Promise<Cash>;
    update(id: number, updateDto: UpdateCashDto): Promise<Cash>;
    findAll(): Promise<Cash[]>;
    findWithPagination(params: any): Promise<{
        items: Cash[];
        total: number;
    }>;
    findOne(id: number): Promise<Cash>;
    remove(id: number): Promise<void>;
    checkDuplicate(field: string, value: any, excludeId?: number): Promise<boolean>;
}
