import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog, ActivityAction } from '../entities/activity-log.entity';
import { RequestContextService } from './request-context.service';
import { User } from '../iam/entities/user.entity';
import { IdGenerationService } from './id-generation.service';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
    private readonly idGenerationService: IdGenerationService,
  ) {}

  logActionAsync(payload: Partial<ActivityLog>) {
    // Extract context synchronously before going async
    const store = RequestContextService.getStore();
    const userId = store?.get('userId');
    const ip = store?.get('ip');
    const userAgent = store?.get('userAgent');
    const url = store?.get('url');
    const method = store?.get('method');

    // Fire and forget, no await
    Promise.resolve().then(async () => {
      try {
        const userIdNum = userId ? Number(userId) : 1;
        const newId = await this.idGenerationService.generateNextId('ActivityLog');
        const log = this.activityLogRepository.create({
          ...payload,
          id: String(newId),
          creator: userIdNum,
          lastModifier: userIdNum,
          ipAddress: ip ? String(ip) : payload.ipAddress,
          userAgent: userAgent ? String(userAgent) : payload.userAgent,
          url: url ? String(url) : payload.url,
          method: method ? String(method) : payload.method,
        } as any);

        await this.activityLogRepository.save(log);
      } catch (error) {
        this.logger.error('Failed to save activity log asynchronously', error.stack || error);
      }
    }).catch(err => {
      this.logger.error('Unhandled async error in log action', err.stack || err);
    });
  }

  async findAll(): Promise<any[]> {
    return this.activityLogRepository.createQueryBuilder('log')
      .leftJoinAndMapOne('log.creatorUser', User, 'user', 'user.id = log.creator')
      .orderBy('log.creationDate', 'DESC')
      .take(200)
      .getMany();
  }
}
