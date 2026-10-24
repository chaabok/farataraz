import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Report } from './report.entity';
export declare class ReportAggregate extends AppBaseEntity {
    reportAggregateID: string;
    reportRef: string;
    reportEntity?: Report;
    field: string;
    groupBy: string;
    printPosition: string;
    hasPageTotal: boolean;
    hasGrandTotal: boolean;
}
