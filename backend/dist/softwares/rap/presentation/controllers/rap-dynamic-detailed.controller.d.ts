import { Repository } from 'typeorm';
import { RapReason } from '../../domain/entities/rap-reason.entity';
import { RecieptAndPaymentAccountingSetting } from '../../domain/entities/reciept-and-payment-accounting-setting.entity';
import { Account } from '../../../accounting/domain/entities/account.entity';
export declare class RapDynamicDetailedController {
    private readonly reasonRepository;
    private readonly settingRepository;
    private readonly accountRepository;
    constructor(reasonRepository: Repository<RapReason>, settingRepository: Repository<RecieptAndPaymentAccountingSetting>, accountRepository: Repository<Account>);
    getRequiredDetailedTypes(reasonId?: string, accountingSettingId?: string): Promise<{
        success: boolean;
        detailedTypes: {
            detailedLevel: number;
            detailedTypeId: number;
            code: string;
            title: string;
        }[];
    }>;
}
