import { OnModuleInit } from '@nestjs/common';
import { VoucherTypeService } from './application/services/voucher-type.service';
import { DetailedTypeService } from './application/services/detailed-type.service';
import { AccountService } from './application/services/account.service';
export declare class AccountingModule implements OnModuleInit {
    private readonly detailedTypeService;
    private readonly voucherTypeService;
    private readonly accountService;
    constructor(detailedTypeService: DetailedTypeService, voucherTypeService: VoucherTypeService, accountService: AccountService);
    onModuleInit(): Promise<void>;
}
