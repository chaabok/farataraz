import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Report } from './report.entity';
export declare class ReportGrouping extends AppBaseEntity {
    reportGroupingID: string;
    reportRef: string;
    reportEntity?: Report;
    tableName: string;
    fieldName: string;
    orderIndex: number;
}
