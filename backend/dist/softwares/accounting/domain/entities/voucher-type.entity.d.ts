import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class VoucherType extends AppBaseEntity {
    voucherTypeId: number;
    code: number;
    title: string;
    title_en: string;
    isActive: boolean;
}
