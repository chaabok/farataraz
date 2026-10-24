import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Report } from './report.entity';
export declare class ReportFilter extends AppBaseEntity {
    reportFilterID: string;
    reportRef: string;
    reportEntity?: Report;
    tableName: string;
    fieldName: string;
    operator: string;
    valueType: string;
    value: string;
    logicalOperator: string;
    orderIndex: number;
}
