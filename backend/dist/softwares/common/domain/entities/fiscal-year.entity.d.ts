import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class FiscalYear extends AppBaseEntity {
    fiscalYearID: number;
    title: string;
    startDate: Date | string;
    endDate: Date | string;
    isActive: boolean;
}
