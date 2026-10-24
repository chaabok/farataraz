import { AppBaseEntity } from './app-base.entity';
export declare enum ActivityAction {
    CREATE = "CREATE",
    UPDATE = "UPDATE",
    DELETE = "DELETE",
    PRINT = "PRINT",
    EXPORT_EXCEL = "EXPORT_EXCEL",
    EXPORT_WORD = "EXPORT_WORD",
    EXPORT_PDF = "EXPORT_PDF",
    UPLOAD = "UPLOAD",
    DOWNLOAD = "DOWNLOAD",
    OTHER = "OTHER"
}
export declare class ActivityLog extends AppBaseEntity {
    id: string;
    action: string;
    entityName: string;
    entityId: string;
    oldValues: any;
    newValues: any;
    ipAddress: string;
    userAgent: string;
    url: string;
    method: string;
    description: string;
}
