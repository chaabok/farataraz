import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
export declare class ReportTemplate extends AppBaseEntity {
    reportTemplateID: number;
    title: string;
    category: string;
    isLocked: boolean;
    unlockPrice: number;
    layoutConfig: string;
    querySql: string;
}
