import { Repository, DataSource } from 'typeorm';
import { Project } from '../../domain/entities/project.entity';
import { DetailedType } from '../../../accounting/domain/entities/detailed-type.entity';
import { DetailedAccountsNumbering } from '../../../common/domain/entities/detailed-accounts-numbering.entity';
import { DetailedAccountsNumberingService } from '../../../common/application/services/detailed-accounts-numbering.service';
import { DetailedAccountService } from '../../../accounting/application/services/detailed-account.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export declare class ProjectService {
    private projectRepository;
    private detailedTypeRepository;
    private numberingRepository;
    private readonly detailedAccountsNumberingService;
    private readonly detailedAccountService;
    private dataSource;
    private readonly requestContextService;
    constructor(projectRepository: Repository<Project>, detailedTypeRepository: Repository<DetailedType>, numberingRepository: Repository<DetailedAccountsNumbering>, detailedAccountsNumberingService: DetailedAccountsNumberingService, detailedAccountService: DetailedAccountService, dataSource: DataSource, requestContextService: RequestContextService);
    private getScope;
    findAll(): Promise<Project[]>;
    findOne(id: number): Promise<Project>;
    create(data: Partial<Project>): Promise<Project>;
    update(id: number, data: Partial<Project>): Promise<Project>;
    remove(id: number): Promise<void>;
}
