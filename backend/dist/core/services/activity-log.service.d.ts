import { Repository } from 'typeorm';
import { ActivityLog } from '../entities/activity-log.entity';
import { IdGenerationService } from './id-generation.service';
export declare class ActivityLogService {
    private readonly activityLogRepository;
    private readonly idGenerationService;
    private readonly logger;
    constructor(activityLogRepository: Repository<ActivityLog>, idGenerationService: IdGenerationService);
    logActionAsync(payload: Partial<ActivityLog>): void;
    findAll(): Promise<any[]>;
}
