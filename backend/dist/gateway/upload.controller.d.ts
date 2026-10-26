import { ActivityLogService } from '../core/services/activity-log.service';
interface UploadedFilePayload {
    originalname?: string;
    size?: number;
    mimetype?: string;
    buffer?: Buffer;
}
export declare class UploadController {
    private readonly activityLogService;
    private readonly logger;
    constructor(activityLogService: ActivityLogService);
    upload(file?: UploadedFilePayload): Promise<{
        url: string;
    }>;
}
export {};
