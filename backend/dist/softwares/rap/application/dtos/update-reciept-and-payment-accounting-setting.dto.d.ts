import { UsedEntryType, RapOperationType, RapDetailedType, TermType } from '../../domain/entities/reciept-and-payment-accounting-setting.enum';
export declare class UpdateRecieptAndPaymentAccountingSettingDto {
    code?: string;
    title?: string;
    title_en?: string;
    accountRef?: number | null;
    usedEntryType?: UsedEntryType;
    operationType?: RapOperationType;
    detailedType?: RapDetailedType;
    termType?: TermType;
    isDefault?: boolean;
    isActive?: boolean;
}
