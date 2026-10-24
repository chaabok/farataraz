import { AppBaseEntity } from '../../../../core/entities/app-base.entity';
import { Report } from './report.entity';
export declare class ReportPermission extends AppBaseEntity {
    reportPermissionID: string;
    reportRef: string;
    reportEntity?: Report;
    userRef: string;
    userGroupRef: string;
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
}
