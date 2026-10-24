import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Account } from '../../../accounting/domain/entities/account.entity';
import { UsedEntryType, RapOperationType, RapDetailedType, TermType } from './reciept-and-payment-accounting-setting.enum';
export declare class RecieptAndPaymentAccountingSetting extends AppBaseEntity {
    recieptAndPaymentAccountingSettingId: number;
    code: string;
    title: string;
    title_en: string;
    accountRef: number;
    account: Account;
    usedEntryType: UsedEntryType;
    operationType: RapOperationType;
    detailedType: RapDetailedType;
    termType: TermType;
    isDefault: boolean;
    isActive: boolean;
}
