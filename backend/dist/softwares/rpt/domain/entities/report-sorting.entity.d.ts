import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Report } from './report.entity';
export declare class ReportSorting extends AppBaseEntity {
    reportSortingID: string;
    reportRef: string;
    reportEntity?: Report;
    tableName: string;
    fieldName: string;
    sortDirection: string;
    orderIndex: number;
}
