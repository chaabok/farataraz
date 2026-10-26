import { Repository, DataSource } from 'typeorm';
import { Contract } from '../../domain/entities/contract.entity';
import { DetailedType } from '../../../accounting/domain/entities/detailed-type.entity';
import { DetailedAccountsNumbering } from '../../../common/domain/entities/detailed-accounts-numbering.entity';
import { DetailedAccountsNumberingService } from '../../../common/application/services/detailed-accounts-numbering.service';
import { DetailedAccountService } from '../../../accounting/application/services/detailed-account.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class ContractService {
    private contractRepository;
    private detailedTypeRepository;
    private numberingRepository;
    private readonly detailedAccountsNumberingService;
    private readonly detailedAccountService;
    private dataSource;
    private readonly requestContextService;
    constructor(contractRepository: Repository<Contract>, detailedTypeRepository: Repository<DetailedType>, numberingRepository: Repository<DetailedAccountsNumbering>, detailedAccountsNumberingService: DetailedAccountsNumberingService, detailedAccountService: DetailedAccountService, dataSource: DataSource, requestContextService: RequestContextService);
    private getScope;
    findAll(): Promise<Contract[]>;
    findOne(id: number): Promise<Contract>;
    create(data: Partial<Contract>): Promise<Contract>;
    update(id: number, data: Partial<Contract>): Promise<Contract>;
    remove(id: number): Promise<void>;
    checkDuplicate(field: string, value: string, excludeId?: number): Promise<boolean>;
}
