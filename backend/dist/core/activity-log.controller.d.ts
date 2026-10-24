import { Request } from 'express';
import { ActivityLogService } from './services/activity-log.service';
export declare class ActivityLogController {
    private readonly activityLogService;
    constructor(activityLogService: ActivityLogService);
    logClientAction(req: Request, body: any): Promise<{
        success: boolean;
    }>;
    findAll(): Promise<{
        data: any[];
    }>;
}
