import { Repository } from 'typeorm';
import { Voucher } from '../../domain/entities/voucher.entity';
import { VoucherItem } from '../../domain/entities/voucher-item.entity';
import { Account } from '../../domain/entities/account.entity';
import { DetailedAccount } from '../../domain/entities/detailed-account.entity';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { VoucherService } from './voucher.service';
import { AccountService } from './account.service';
export declare class NatureAdjustmentService {
    private readonly voucherItemRepository;
    private readonly voucherRepository;
    private readonly accountRepository;
    private readonly detailedAccountRepository;
    private readonly requestContextService;
    private readonly voucherService;
    private readonly accountService;
    constructor(voucherItemRepository: Repository<VoucherItem>, voucherRepository: Repository<Voucher>, accountRepository: Repository<Account>, detailedAccountRepository: Repository<DetailedAccount>, requestContextService: RequestContextService, voucherService: VoucherService, accountService: AccountService);
    private getScopeWhere;
    getContraryBalances(fiscalYearId: number): Promise<any[]>;
    saveAdjustmentVoucher(payload: any): Promise<any>;
}
