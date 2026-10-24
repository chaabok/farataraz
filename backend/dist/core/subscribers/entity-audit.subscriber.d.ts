import { EntitySubscriberInterface, InsertEvent, UpdateEvent, RemoveEvent, DataSource } from 'typeorm';
import { ActivityLogService } from '../services/activity-log.service';
import { AppBaseEntity } from '../entities/app-base.entity';
export declare class EntityAuditSubscriber implements EntitySubscriberInterface<AppBaseEntity> {
    private readonly dataSource;
    private readonly activityLogService;
    constructor(dataSource: DataSource, activityLogService: ActivityLogService);
    listenTo(): typeof AppBaseEntity;
    private static cache;
    private resolveRefs;
    beforeInsert(event: InsertEvent<AppBaseEntity>): Promise<void>;
    private extractEntityId;
    private sanitizeValues;
    private shouldIgnoreEvent;
    afterInsert(event: InsertEvent<AppBaseEntity>): void;
    beforeUpdate(event: UpdateEvent<AppBaseEntity>): Promise<void>;
    afterUpdate(event: UpdateEvent<AppBaseEntity>): void;
    afterRemove(event: RemoveEvent<AppBaseEntity>): void;
}
