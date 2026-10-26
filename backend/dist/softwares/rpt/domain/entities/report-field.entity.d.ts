import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Report } from './report.entity';
export declare class ReportField extends AppBaseEntity {
    reportFieldID: string;
    reportRef: string;
    reportEntity?: Report;
    tableName: string;
    fieldName: string;
    alias: string;
    orderIndex: number;
    isVisible: boolean;
}
