import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { ReportGroup } from './report-group.entity';
export declare class Report extends AppBaseEntity {
    reportID: string;
    reportGroupRef: string;
    reportGroupEntity?: ReportGroup;
    title: string;
    direction: string;
    paperSize: string;
    paperOrientation: string;
    showInstitutionName: boolean;
    showDate: boolean;
    showRowNumber: boolean;
    showFilters: boolean;
    pageNumberType: string;
    showLogo: boolean;
    hideDuplicates: boolean;
    dataSourceType: string;
    primaryTable: string;
    targetForm: string;
    isDefaultTemplate: boolean;
    isSystemReport: boolean;
    sqlScript: string;
}
