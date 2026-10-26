import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Report } from './report.entity';
export declare class ReportFormula extends AppBaseEntity {
    reportFormulaID: string;
    reportRef: string;
    reportEntity?: Report;
    formulaName: string;
    expression: string;
}
