import { BaseSettingsService } from '../../../common/application/services/base-settings.service';
import { VoucherService } from '../../../accounting/application/services/voucher.service';
import { AccountService } from '../../../accounting/application/services/account.service';
import { RequestContextService } from '../../../../core/services/request-context.service';
import { DocumentAccountingInfoService } from './document-accounting-info.service';
export declare class AutoVoucherService {
    private readonly baseSettingsService;
    private readonly voucherService;
    private readonly accountService;
    private readonly requestContextService;
    private readonly documentAccountingInfoService;
    constructor(baseSettingsService: BaseSettingsService, voucherService: VoucherService, accountService: AccountService, requestContextService: RequestContextService, documentAccountingInfoService: DocumentAccountingInfoService);
    generateAutoVoucherIfNeeded(formType: string, status: number, documentDate: Date | string, documentNumber: string, existingVoucherId?: number | null, documentRef?: number): Promise<number | null>;
}
