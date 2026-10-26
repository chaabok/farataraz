import { Repository, DataSource } from 'typeorm';
import { ClosingTemporaryAccount } from '../../domain/entities/closing-temporary-account.entity';
import { ClosingTemporaryAccountItem } from '../../domain/entities/closing-temporary-account-item.entity';
import { ClosingTemporaryAccountSelected } from '../../domain/entities/closing-temporary-account-selected.entity';
import { Account } from '../../domain/entities/account.entity';
import { DetailedAccount } from '../../domain/entities/detailed-account.entity';
import { VoucherItem } from '../../domain/entities/voucher-item.entity';
import { IdGenerationService } from '../../../../core/services/id-generation.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
export interface TemporaryTreeNode {
    id: string;
    name: string;
    code?: string;
    title?: string;
    accountType?: number;
    balance?: number;
    children?: TemporaryTreeNode[];
    isRoot?: boolean;
}
export declare class ClosingTemporaryAccountService {
    private readonly repo;
    private readonly itemRepo;
    private readonly selectedRepo;
    private readonly accountRepo;
    private readonly detailedAccountRepo;
    private readonly voucherItemRepo;
    private readonly idGen;
    private readonly reqCtx;
    private readonly dataSource;
    constructor(repo: Repository<ClosingTemporaryAccount>, itemRepo: Repository<ClosingTemporaryAccountItem>, selectedRepo: Repository<ClosingTemporaryAccountSelected>, accountRepo: Repository<Account>, detailedAccountRepo: Repository<DetailedAccount>, voucherItemRepo: Repository<VoucherItem>, idGen: IdGenerationService, reqCtx: RequestContextService, dataSource: DataSource);
    private getScope;
    getTemporaryAccountsTree(toDate?: string): Promise<TemporaryTreeNode>;
    findAll(): Promise<ClosingTemporaryAccount[]>;
    findOne(id: number): Promise<ClosingTemporaryAccount>;
    create(dto: any): Promise<ClosingTemporaryAccount>;
    update(id: number, dto: any): Promise<ClosingTemporaryAccount>;
    delete(id: number): Promise<void>;
}
